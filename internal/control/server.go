// Package control implements the WebSocket control server.
// This is the component that CLI clients connect to, and where the tunnel
// lifecycle (connect → forward requests → disconnect) is managed.
package control

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/bhadrasuman/reverse-tunnel/internal/auth"
	"github.com/bhadrasuman/reverse-tunnel/internal/protocol"
	"github.com/bhadrasuman/reverse-tunnel/internal/registry"
	"github.com/bhadrasuman/reverse-tunnel/internal/subdomain"
	"github.com/gorilla/websocket"
	"go.uber.org/zap"
)

// Server is the WebSocket control server. It holds shared dependencies
// that are safe to use concurrently — zap.Logger is goroutine-safe,
// and Registry has its own internal mutex.
type Server struct {
	registry *registry.Registry
	auth     *auth.Authenticator
	upgrader websocket.Upgrader
	logger   *zap.Logger
	domain   string
}

// New constructs a control Server. The websocket.Upgrader is configured
// to accept connections from any origin — appropriate for a tunnel server
// where the client is a CLI tool, not a browser app.
func New(reg *registry.Registry, authenticator *auth.Authenticator, domain string, logger *zap.Logger) *Server {
	return &Server{
		registry: reg,
		auth:     authenticator,
		domain:   domain,
		logger:   logger,
		// CheckOrigin returning true disables the same-origin policy.
		// By default, gorilla/websocket rejects cross-origin connections.
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool { return true },
		},
	}
}

// writeJSON is a helper to write a JSON error response before the WebSocket upgrade.
// Before Upgrade() is called, we're still in plain HTTP land, so we can use
// the standard http.ResponseWriter.
func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	// Intentionally ignore encoding errors here — we're already in error path
	_ = json.NewEncoder(w).Encode(v)
}

// Handler returns an http.HandlerFunc for the WebSocket upgrade endpoint.
// This function is the heart of the control server. Each CLI connection
// runs through this handler in its own goroutine (Go's HTTP server spawns
// a goroutine per request automatically).
func (s *Server) Handler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// --- Step 1: Authenticate ---
		// Read the Authorization header and validate the API key.
		rawKey := r.Header.Get("Authorization")
		user, err := s.auth.ValidateKey(rawKey)
		if err != nil {
			if errors.Is(err, auth.ErrInvalidKey) {
				writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
			} else {
				writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "auth error"})
			}
			return
		}

		// --- Step 2: Check tunnel limit ---
		// Count how many tunnels this user already has open.
		// We scan the list (under a read lock) and count matching userIDs.
		userID := user.ID.Hex()
		currentCount := 0
		for _, t := range s.registry.List() {
			if t.UserID == userID {
				currentCount++
			}
		}
		if currentCount >= user.MaxTunnels {
			writeJSON(w, http.StatusTooManyRequests, map[string]string{
				"error": "tunnel limit reached",
			})
			return
		}

		// --- Step 3: Upgrade to WebSocket ---
		// After Upgrade(), we can no longer write HTTP responses.
		// All communication must go through the WebSocket conn.
		conn, err := s.upgrader.Upgrade(w, r, nil)
		if err != nil {
			// Upgrade writes its own error response if it fails, so we just log.
			s.logger.Error("websocket upgrade failed", zap.Error(err))
			return
		}

		// --- Step 4: Set up tunnel ---
		sub := subdomain.Generate()
		tunnel := registry.NewTunnel(conn, userID, sub)

		s.registry.Register(sub, tunnel)

		// defer runs when this function returns — whether normally, via return,
		// or via panic recovery. This guarantees cleanup even on errors below.
		// The order matters: defers execute LIFO (last in, first out).
		defer s.registry.Unregister(sub)
		defer conn.Close() //nolint:errcheck — Close errors are ignorable on cleanup

		s.logger.Info("tunnel connected",
			zap.String("subdomain", sub),
			zap.String("userId", userID),
		)

		// --- Step 5: Send the "connected" frame ---
		// Tell the CLI what subdomain was assigned to it.
		if err := tunnel.WriteJSON(protocol.Frame{
			Type:      protocol.TypeConnected,
			Subdomain: sub,
			Message:   "tunnel established",
		}); err != nil {
			s.logger.Error("failed to send connected frame", zap.Error(err))
			return
		}

		// --- Step 6: Start keep-alive goroutine ---
		// The `go` keyword launches a goroutine — lightweight concurrency unit.
		// This runs concurrently with the read loop below.
		go s.keepAlive(tunnel)

		// --- Step 7: Read loop ---
		// Block here, reading frames from the CLI until the connection closes.
		// When the CLI disconnects, ReadMessage returns an error and we fall
		// through to the deferred cleanup above.
		for {
			_, msg, err := conn.ReadMessage()
			if err != nil {
				// This is the normal path for disconnect: websocket.CloseError,
				// io.EOF, or "use of closed network connection".
				s.logger.Info("tunnel disconnected",
					zap.String("subdomain", sub),
					zap.Error(err),
				)
				return // defers fire: Unregister + conn.Close
			}

			// json.Unmarshal deserializes JSON bytes into a Go struct.
			// If we can't parse the frame, skip it — don't disconnect.
			var frame protocol.Frame
			if err := json.Unmarshal(msg, &frame); err != nil {
				s.logger.Warn("failed to parse frame", zap.Error(err))
				continue
			}

			switch frame.Type {
			case protocol.TypeResponse:
				// A CLI response to a proxied request — deliver it to the
				// waiting proxy handler via the pending channel.
				tunnel.ResolvePending(frame.ChannelID, frame)

			case protocol.TypePong:
				// The CLI acknowledged our ping, so we know it's alive.
				// Extend the read deadline by another 60 seconds.
				if err := conn.SetReadDeadline(time.Now().Add(60 * time.Second)); err != nil {
					s.logger.Warn("failed to set read deadline", zap.Error(err))
				}
			}
		}
	}
}

// keepAlive sends periodic pings to the CLI to detect dead connections.
//
// Why is this needed? WebSocket connections over the internet can silently
// drop (NAT timeout, firewall, network hiccup) without the TCP stack noticing.
// By pinging every 25s and expecting a pong within 60s, we detect and clean up
// zombie connections quickly.
//
// This goroutine exits when WriteJSON fails (connection is dead).
func (s *Server) keepAlive(tunnel *registry.Tunnel) {
	// time.NewTicker creates a channel that receives a value every 25 seconds.
	// It's like setInterval() in JS, but channel-based.
	ticker := time.NewTicker(25 * time.Second)
	defer ticker.Stop() // Always stop the ticker to release its goroutine + channel.

	// Set an initial read deadline. If the CLI doesn't send anything (including
	// a pong) within 60 seconds, conn.ReadMessage() will return a timeout error,
	// causing the read loop to exit and defers to clean up.
	if err := tunnel.Conn.SetReadDeadline(time.Now().Add(60 * time.Second)); err != nil {
		s.logger.Warn("failed to set initial read deadline", zap.Error(err))
		return
	}

	for {
		// `range ticker.C` blocks until the ticker fires.
		// ticker.C is a <-chan time.Time — a receive-only channel.
		<-ticker.C

		err := tunnel.WriteJSON(protocol.Frame{Type: protocol.TypePing})
		if err != nil {
			// Connection is dead — close it so the read loop wakes up
			// and the deferred cleanup runs.
			tunnel.Conn.Close() //nolint:errcheck
			return
		}
	}
}
