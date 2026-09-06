// Package proxy implements the HTTP proxy server that receives tunneled traffic.
// When a visitor hits https://brave-wolf-42.yourdomain.com, Nginx forwards it
// here. This server looks up the tunnel, sends the request to the CLI over
// WebSocket, waits for the response, and writes it back to the visitor.
package proxy

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/bhadrasuman/reverse-tunnel/internal/models"
	"github.com/bhadrasuman/reverse-tunnel/internal/protocol"
	"github.com/bhadrasuman/reverse-tunnel/internal/registry"
	"github.com/bhadrasuman/reverse-tunnel/internal/repository"
	"github.com/rs/xid"
	"go.uber.org/zap"
)

// Server is the HTTP proxy server. It's stateless except for the shared
// registry — all request state lives on the stack (each request gets its
// own goroutine with its own local variables).
type Server struct {
	registry *registry.Registry
	logRepo  repository.RequestLogRepository
	domain   string
	logger   *zap.Logger
}

// New constructs a proxy Server.
func New(reg *registry.Registry, domain string, logger *zap.Logger, opts ...Option) *Server {
	srv := &Server{
		registry: reg,
		domain:   domain,
		logger:   logger,
	}
	for _, opt := range opts {
		opt(srv)
	}
	return srv
}

// Option defines functional options for proxy Server.
type Option func(*Server)

// WithRequestLogRepository sets the Traffic Inspector repository.
func WithRequestLogRepository(repo repository.RequestLogRepository) Option {
	return func(s *Server) {
		s.logRepo = repo
	}
}

// extractSubdomain pulls the subdomain from a Host header.
// It handles:
//   - "brave-wolf-42.example.com"        → "brave-wolf-42"
//   - "brave-wolf-42.example.com:443"    → "brave-wolf-42"
//   - "brave-wolf-42.example.com:80"     → "brave-wolf-42"
//   - "example.com"                      → "" (no subdomain)
func extractSubdomain(host, domain string) string {
	// Strip the port if present. strings.Cut splits on the first occurrence
	// of sep and returns (before, after, found). If no port, host is unchanged.
	if h, _, hasPort := strings.Cut(host, ":"); hasPort {
		host = h
	}

	// The domain may or may not have a leading dot.
	// We normalize to ensure we're stripping ".example.com" not "example.com".
	suffix := domain
	if !strings.HasPrefix(suffix, ".") {
		suffix = "." + suffix
	}

	// strings.TrimSuffix removes the suffix only if present.
	trimmed := strings.TrimSuffix(host, suffix)

	// If nothing was trimmed, the host IS the domain (no subdomain).
	if trimmed == host {
		return ""
	}

	return trimmed
}

// writeJSONError writes a JSON error response with the given status code.
func writeJSONError(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

// Handler returns the http.HandlerFunc for the proxy server.
// Each incoming HTTP request from Nginx is handled by this function
// in its own goroutine. The goroutine blocks on the select{} below,
// waiting for the CLI to respond.
func (s *Server) Handler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// --- Step 1: Extract subdomain ---
		host := r.Header.Get("X-Tunnel-Subdomain")
		if host == "" {
			host = r.Header.Get("X-Forwarded-Host")
		}
		if host == "" {
			host = r.Host
		}

		sub := extractSubdomain(host, s.domain)
		if sub == "" && host != "" {
			// Fallback: If host is raw subdomain string (e.g. "brave-lynx-8")
			if !strings.Contains(host, ".") && !strings.Contains(host, ":") {
				sub = host
			}
		}

		if sub == "" {
			writeJSONError(w, http.StatusBadRequest, map[string]string{
				"error": "missing subdomain",
			})
			return
		}

		// --- Step 2: Look up tunnel ---
		tunnel, ok := s.registry.Get(sub)
		if !ok {
			writeJSONError(w, http.StatusBadGateway, map[string]string{
				"error":     "no active tunnel",
				"subdomain": sub,
			})
			return
		}

		// --- Step 3: Read request body ---
		// io.LimitReader caps the body at 10MB to protect against huge payloads.
		// This is like express's bodyParser with a size limit.
		const maxBodySize = 10 << 20 // 10 MB in bytes (bit shift: 10 * 2^20)
		bodyBytes, err := io.ReadAll(io.LimitReader(r.Body, maxBodySize))
		if err != nil {
			writeJSONError(w, http.StatusInternalServerError, map[string]string{
				"error": "failed to read request body",
			})
			return
		}

		// --- Step 4: Encode body as base64 ---
		// JSON requires strings to be valid UTF-8. HTTP bodies can be binary,
		// so we base64-encode them before embedding in the JSON frame.
		encodedBody := base64.StdEncoding.EncodeToString(bodyBytes)

		// --- Step 5: Flatten request headers ---
		// HTTP headers can have multiple values per key. We take the first value
		// only, to keep the protocol simple (map[string]string, not map[string][]string).
		flatHeaders := make(map[string]string, len(r.Header))
		for key := range r.Header {
			flatHeaders[key] = r.Header.Get(key) // Get() returns the first value
		}

		// --- Step 6: Generate a unique channel ID ---
		// xid generates a globally unique, URL-safe, sortable ID.
		// We use it to correlate this request frame with its response frame.
		channelID := xid.New().String()

		// --- Step 7: Create a response channel and register it ---
		// make(chan T, 1) creates a buffered channel with capacity 1.
		// Buffered means the sender (ResolvePending) won't block even if this
		// goroutine is briefly busy — equivalent to a Promise that can be
		// resolved before anyone awaits it.
		responseCh := make(chan protocol.Frame, 1)
		tunnel.AddPending(channelID, responseCh)

		// defer ensures cleanup even if we return early (write error, timeout).
		defer tunnel.RemovePending(channelID)

		// Build the full request path including query string.
		path := r.URL.Path
		if r.URL.RawQuery != "" {
			path = fmt.Sprintf("%s?%s", path, r.URL.RawQuery)
		}

		// --- Step 8: Send request frame to CLI ---
		err = tunnel.WriteJSON(protocol.Frame{
			Type:      protocol.TypeRequest,
			ChannelID: channelID,
			Method:    r.Method,
			Path:      path,
			Headers:   flatHeaders,
			Body:      encodedBody,
		})
		if err != nil {
			s.logger.Error("failed to send request frame",
				zap.String("subdomain", sub),
				zap.Error(err),
			)
			writeJSONError(w, http.StatusBadGateway, map[string]string{
				"error": "tunnel write failed",
			})
			return
		}

		startTime := time.Now()

		// --- Step 9: Wait for CLI response ---
		// select is Go's multi-channel wait — similar to Promise.race().
		// We wait for either the CLI response or a 30-second timeout.
		select {
		case resp := <-responseCh:
			durationMs := time.Since(startTime).Milliseconds()

			// Decode the base64-encoded response body from the CLI.
			body, err := base64.StdEncoding.DecodeString(resp.Body)
			if err != nil {
				// Body might be empty string (no body responses like 204 No Content).
				body = []byte{}
			}

			// Set response headers. We must call w.Header().Set() BEFORE
			// calling w.WriteHeader() — headers cannot be modified after that.
			for k, v := range resp.Headers {
				w.Header().Set(k, v)
			}

			// WriteHeader sends the status code. After this call, headers are locked.
			w.WriteHeader(resp.Status)

			// Write the response body. We don't return errors — the connection
			// may have been closed by the browser, which is fine.
			_, _ = w.Write(body)

			// Atomically increment the tunnel's request counter.
			tunnel.ReqCount.Add(1)

			// Asynchronously log to Traffic Inspector (MongoDB) if logRepo configured
			if s.logRepo != nil {
				reqBodyStr := string(bodyBytes)
				respBodyStr := resp.Body // base64 encoded payload
				userID := tunnel.UserID

				go func() {
					ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
					defer cancel()

					_ = s.logRepo.CreateLog(ctx, &models.RequestLog{
						ChannelID:       channelID,
						Subdomain:       sub,
						UserID:          userID,
						Method:          r.Method,
						Path:            r.URL.Path,
						Query:           r.URL.RawQuery,
						RequestHeaders:  flatHeaders,
						RequestBody:     reqBodyStr,
						ResponseStatus:  resp.Status,
						ResponseHeaders: resp.Headers,
						ResponseBody:    respBodyStr,
						DurationMs:      durationMs,
						ClientIP:        r.RemoteAddr,
						CreatedAt:       startTime,
					})
				}()
			}

			s.logger.Info("proxied request",
				zap.String("subdomain", sub),
				zap.String("method", r.Method),
				zap.String("path", path),
				zap.Int("status", resp.Status),
				zap.Int64("durationMs", durationMs),
			)

		case <-time.After(30 * time.Second):
			// The CLI didn't respond within 30 seconds.
			// time.After returns a channel that receives after the duration —
			// like a Promise that resolves after a timeout.
			http.Error(w, "tunnel timeout", http.StatusGatewayTimeout)
			s.logger.Warn("tunnel timeout",
				zap.String("subdomain", sub),
				zap.String("channelId", channelID),
			)
		}
	}
}
