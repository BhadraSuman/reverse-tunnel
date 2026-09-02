// Package cli implements the tunnel client that runs on a developer's machine.
// It connects to the server via WebSocket, forwards incoming HTTP requests to
// localhost, and sends responses back through the tunnel.
package cli

import (
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/bhadrasuman/reverse-tunnel/internal/protocol"
	"github.com/gorilla/websocket"
)

// Client manages a single tunnel connection to the server.
// All WebSocket writes go through WriteFrame() which holds writeMu,
// because gorilla/websocket connections are not safe for concurrent writes.
type Client struct {
	// ServerURL is the wss:// WebSocket URL of the control server.
	ServerURL string

	// APIKey is the raw API key to send in the Authorization header.
	APIKey string

	// LocalPort is the localhost port to forward requests to (e.g. 3000).
	LocalPort int

	// retries tracks consecutive failed connection attempts, used for
	// exponential backoff delay calculation.
	retries int

	// conn is the active WebSocket connection. It is replaced on reconnect.
	// Protected implicitly by the sequential connect() → readLoop() flow.
	conn *websocket.Conn

	// writeMu ensures only one goroutine writes to conn at a time.
	// In the read loop, the caller goroutine reads; forwardRequest goroutines write.
	// gorilla/websocket allows one concurrent reader AND one concurrent writer —
	// but we may have many forwardRequest goroutines, so we serialize writes.
	writeMu sync.Mutex

	// done is a channel used to signal shutdown.
	// chan struct{} is idiomatic Go for a signal-only channel (no data, just close).
	done chan struct{}
}

// NewClient creates a new tunnel Client.
func NewClient(serverURL, apiKey string, localPort int) *Client {
	return &Client{
		ServerURL: serverURL,
		APIKey:    apiKey,
		LocalPort: localPort,
		done:      make(chan struct{}),
	}
}

// Start is the public entry point. It runs the connection loop with
// automatic reconnection on failure. This function blocks indefinitely.
func (c *Client) Start() {
	PrintConnecting(c.ServerURL)

	for {
		// connect() blocks until the WebSocket connection drops.
		if err := c.connect(); err != nil {
			fmt.Printf("  connection error: %v\n", err)
		}
		// Whether connect() returns nil or an error, we always reconnect.
		c.scheduleReconnect()
	}
}

// connect dials the server, reads the TypeConnected frame, runs the read loop,
// and returns when the connection is lost.
func (c *Client) connect() error {
	headers := http.Header{}
	headers.Set("Authorization", "Bearer "+c.APIKey)

	// websocket.DefaultDialer.Dial performs the WebSocket handshake over TCP.
	// The third return value is the HTTP upgrade response — not needed here.
	conn, _, err := websocket.DefaultDialer.Dial(c.ServerURL, headers)
	if err != nil {
		return fmt.Errorf("dial failed: %w", err)
	}
	defer conn.Close() //nolint:errcheck — cleanup on return

	c.conn = conn
	c.retries = 0 // Reset backoff counter on successful connect.

	// Read the handshake frame — server sends TypeConnected immediately after upgrade.
	_, msg, err := conn.ReadMessage()
	if err != nil {
		return fmt.Errorf("failed to read connected frame: %w", err)
	}

	var firstFrame protocol.Frame
	if err := json.Unmarshal(msg, &firstFrame); err != nil {
		return fmt.Errorf("failed to parse connected frame: %w", err)
	}

	if firstFrame.Type == protocol.TypeConnected {
		PrintBanner(firstFrame.Subdomain, extractDomain(c.ServerURL))
	}

	// readLoop blocks here until the WebSocket connection closes.
	c.readLoop()
	return nil
}

// readLoop dispatches incoming frames from the server.
// For TypeRequest frames, it spawns a goroutine per request so that
// multiple concurrent requests can be handled simultaneously — like
// having multiple event loop callbacks running in parallel.
func (c *Client) readLoop() {
	for {
		_, msg, err := c.conn.ReadMessage()
		if err != nil {
			// Normal disconnect: websocket.CloseError, io.EOF, or net error.
			return
		}

		var frame protocol.Frame
		if err := json.Unmarshal(msg, &frame); err != nil {
			continue // Skip malformed frames.
		}

		switch frame.Type {
		case protocol.TypeRequest:
			// Capture frame by value in the goroutine to avoid a data race.
			// In Go, goroutines close over variables by reference — if we wrote
			// `go c.forwardRequest(frame)` without the explicit capture, all
			// goroutines could see the same (mutated) frame from the loop variable.
			// The function argument `frame` creates a per-goroutine copy.
			go c.forwardRequest(frame)

		case protocol.TypePing:
			// Respond synchronously — WriteFrame will serialize with writeMu.
			if err := c.WriteFrame(protocol.Frame{Type: protocol.TypePong}); err != nil {
				return
			}
		}
	}
}

// WriteFrame is the ONLY safe way to write to the WebSocket connection
// from within the CLI. Multiple forwardRequest goroutines call this
// concurrently, so we serialize with writeMu.
func (c *Client) WriteFrame(frame protocol.Frame) error {
	c.writeMu.Lock()
	defer c.writeMu.Unlock()
	return c.conn.WriteJSON(frame)
}

// scheduleReconnect computes an exponential backoff delay and sleeps.
// Delay = min(2^retries, 30) seconds.
// Sequence: 1s, 2s, 4s, 8s, 16s, 30s, 30s, 30s…
func (c *Client) scheduleReconnect() {
	delaySecs := math.Pow(2, float64(c.retries))
	if delaySecs > 30 {
		delaySecs = 30
	}
	delay := time.Duration(delaySecs) * time.Second
	c.retries++

	PrintReconnecting(delay)
	time.Sleep(delay)
}

// extractDomain strips the scheme and "tunnel." prefix from the server URL
// to produce a bare domain for display (e.g. "wss://tunnel.example.com" → "example.com").
func extractDomain(serverURL string) string {
	s := serverURL
	// Strip scheme.
	for _, prefix := range []string{"wss://", "ws://", "https://", "http://"} {
		if len(s) >= len(prefix) && s[:len(prefix)] == prefix {
			s = s[len(prefix):]
			break
		}
	}
	// Strip path — take everything before the first "/".
	if i := strings.Index(s, "/"); i >= 0 {
		s = s[:i]
	}
	// Strip port — take everything before the last ":".
	if i := strings.LastIndex(s, ":"); i >= 0 {
		s = s[:i]
	}
	// Strip "tunnel." prefix to get the user-facing domain.
	s = strings.TrimPrefix(s, "tunnel.")
	return s
}
