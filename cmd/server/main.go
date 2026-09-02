// Package main is the entry point for the tunnel server binary.
// This binary runs on a cloud VM and exposes three HTTP servers:
//   - :3001 WebSocket control server (CLI clients connect here)
//   - :4000 HTTP proxy server (Nginx forwards visitor traffic here)
//   - :3002 Internal API server (health checks, metrics)
package main

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/bhadrasuman/reverse-tunnel/internal/auth"
	"github.com/bhadrasuman/reverse-tunnel/internal/control"
	"github.com/bhadrasuman/reverse-tunnel/internal/db"
	"github.com/bhadrasuman/reverse-tunnel/internal/proxy"
	"github.com/bhadrasuman/reverse-tunnel/internal/registry"
	"github.com/joho/godotenv"
	"go.uber.org/zap"
)

func main() {
	// --- Load .env file ---
	// godotenv.Load() reads a .env file and sets environment variables.
	// We ignore the error: if .env doesn't exist, env vars come from Docker/systemd.
	// In production, secrets are injected as real env vars, not via .env.
	_ = godotenv.Load()

	// --- Initialize logger ---
	// zap is a high-performance structured logger from Uber.
	// "Structured" means log fields are key-value pairs (not printf strings),
	// which makes them easy to query in log aggregators like Datadog / Loki.
	logger := buildLogger(os.Getenv("LOG_LEVEL"))
	defer logger.Sync() //nolint:errcheck — flush buffered log entries on exit

	// --- Connect to MongoDB ---
	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}

	mongoClient, err := db.Connect(mongoURI)
	if err != nil {
		// logger.Fatal logs the error and calls os.Exit(1).
		// This is appropriate in main() for unrecoverable startup failures.
		logger.Fatal("failed to connect to MongoDB", zap.Error(err))
	}
	logger.Info("connected to MongoDB")

	// --- Set up dependencies ---
	mongoDatabase := mongoClient.Database("tunnel")
	authenticator := auth.New(mongoDatabase)
	reg := registry.New()

	// Read domain from env, default to a placeholder for local dev.
	domain := os.Getenv("DOMAIN")
	if domain == "" {
		domain = "tunnel.localhost"
	}

	// Create the two servers. They share the same registry.
	controlServer := control.New(reg, authenticator, domain, logger)
	proxyServer := proxy.New(reg, domain, logger)

	// --- Read ports from env with defaults ---
	portControl := envOrDefault("PORT_CONTROL", "3001")
	portProxy := envOrDefault("PORT_PROXY", "4000")
	portAPI := envOrDefault("PORT_API", "3002")

	// --- Set up graceful shutdown context ---
	// signal.NotifyContext returns a context that is cancelled when SIGINT or
	// SIGTERM is received (i.e. Ctrl+C or docker stop / kill).
	// This is the idiomatic Go way to handle OS signals for graceful shutdown.
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop() // Release signal resources when main exits.

	// --- Start internal API server in a goroutine ---
	// We start servers in goroutines so they run concurrently.
	// Each goroutine runs its own http.ListenAndServe, which blocks internally.
	logger.Info("internal api starting", zap.String("port", portAPI))
	go func() {
		mux := http.NewServeMux()

		// GET /health — simple liveness check for load balancers / Docker healthcheck.
		mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte("ok"))
		})

		// GET /api/tunnels — returns JSON list of active tunnels for the dashboard.
		mux.HandleFunc("/api/tunnels", func(w http.ResponseWriter, r *http.Request) {
			tunnels := reg.List()

			// We project only the fields we want to expose — not the raw *Tunnel
			// struct (which contains the WebSocket conn and mutex).
			// This is Go's version of a DTO (Data Transfer Object).
			type tunnelDTO struct {
				Subdomain   string    `json:"subdomain"`
				UserID      string    `json:"userId"`
				ConnectedAt time.Time `json:"connectedAt"`
				ReqCount    int64     `json:"reqCount"`
			}

			dtos := make([]tunnelDTO, 0, len(tunnels))
			for _, t := range tunnels {
				dtos = append(dtos, tunnelDTO{
					Subdomain:   t.Subdomain,
					UserID:      t.UserID,
					ConnectedAt: t.ConnectedAt,
					ReqCount:    t.ReqCount.Load(),
				})
			}

			w.Header().Set("Content-Type", "application/json")
			// json.NewEncoder(w).Encode writes directly to the ResponseWriter —
			// more efficient than json.Marshal + w.Write for large payloads.
			if err := json.NewEncoder(w).Encode(dtos); err != nil {
				logger.Error("failed to encode tunnels", zap.Error(err))
			}
		})

		apiServer := &http.Server{
			Addr:    ":" + portAPI,
			Handler: mux,
		}
		if err := apiServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Error("internal api server error", zap.Error(err))
		}
	}()

	// --- Start proxy server in a goroutine ---
	logger.Info("proxy server starting", zap.String("port", portProxy))
	go func() {
		proxyHTTP := &http.Server{
			Addr:    ":" + portProxy,
			Handler: proxyServer.Handler(),
		}
		if err := proxyHTTP.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Error("proxy server error", zap.Error(err))
		}
	}()

	// --- Start control (WebSocket) server — blocks main goroutine ---
	// We start this last and let it block main(). When SIGINT arrives,
	// the context is cancelled and we can proceed to graceful shutdown.
	logger.Info("control server starting", zap.String("port", portControl))

	// Run the control server in a goroutine too, so we can wait on ctx.Done().
	go func() {
		controlHTTP := &http.Server{
			Addr:    ":" + portControl,
			Handler: controlServer.Handler(),
		}
		if err := controlHTTP.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Error("control server error", zap.Error(err))
		}
	}()

	// Block until a shutdown signal is received.
	// <-ctx.Done() reads from the context's Done channel, which is closed
	// when SIGINT/SIGTERM fires. This replaces the old select{} pattern.
	<-ctx.Done()

	logger.Info("shutting down gracefully...")

	// Give in-flight requests up to 15 seconds to complete.
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	// Disconnect from MongoDB cleanly.
	if err := mongoClient.Disconnect(shutdownCtx); err != nil {
		logger.Error("mongo disconnect error", zap.Error(err))
	}

	logger.Info("shutdown complete")
}

// buildLogger creates a zap logger appropriate for the given log level.
// In development (LOG_LEVEL=debug), we use the console-friendly "development" preset.
// In production, we use the JSON "production" preset for structured log aggregation.
func buildLogger(level string) *zap.Logger {
	var logger *zap.Logger
	var err error

	if level == "debug" {
		// Development logger: human-readable console output with stack traces.
		logger, err = zap.NewDevelopment()
	} else {
		// Production logger: JSON output, sampling, no caller info (for performance).
		logger, err = zap.NewProduction()
	}

	if err != nil {
		// Fallback to a no-op logger if initialization fails — never panic in main().
		return zap.NewNop()
	}
	return logger
}

// envOrDefault returns the value of an environment variable, or a default if not set.
// This is Go's equivalent of: process.env.VAR ?? defaultValue
func envOrDefault(key, defaultValue string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultValue
}
