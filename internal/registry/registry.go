// Package registry maintains a thread-safe in-memory map of all active tunnel
// connections. It's the central lookup table that links subdomains to WebSocket
// connections — think of it like a Map<string, Tunnel> with mutex protection.
package registry

import (
	"sync"
	"sync/atomic"
	"time"

	"github.com/bhadrasuman/reverse-tunnel/internal/protocol"
	"github.com/gorilla/websocket"
)

// Tunnel represents one active CLI connection to the server.
// Each field is carefully chosen:
//   - Public fields (Conn, UserID, etc.) are read by the proxy and API handlers
//   - writeMu MUST be held for any conn.WriteJSON / conn.WriteMessage call
//     because WebSocket connections are NOT safe for concurrent writes in gorilla/websocket
//   - mu protects the pending map from concurrent access
type Tunnel struct {
	Conn        *websocket.Conn
	UserID      string
	Subdomain   string
	ConnectedAt time.Time

	// ReqCount tracks total proxied requests. atomic.Int64 (from sync/atomic) is a
	// struct that provides atomic increment without a mutex — safe for concurrent use.
	// Use tunnel.ReqCount.Add(1) to increment; tunnel.ReqCount.Load() to read.
	// NOTE: atomic.Int64 must NOT be copied after first use — always pass Tunnel by pointer.
	ReqCount atomic.Int64

	// writeMu serializes all WebSocket writes. gorilla/websocket explicitly
	// states: "Connections support one concurrent reader and one concurrent writer."
	// So concurrent WriteJSON calls without a lock = data races / panics.
	writeMu sync.Mutex

	// mu protects the pending map below.
	mu sync.Mutex

	// pending maps a channelID → response channel.
	// When the proxy sends a request, it creates a channel and stores it here.
	// When the CLI sends a response, the control server calls ResolvePending
	// to deliver the response to the waiting proxy handler.
	// This is the Go equivalent of a Map<string, Promise<Frame>> resolver.
	pending map[string]chan protocol.Frame
}

// NewTunnel constructs a Tunnel and initializes the pending map.
// In Go, maps must be initialized with make() before use — a nil map panics on write.
func NewTunnel(conn *websocket.Conn, userID, subdomain string) *Tunnel {
	return &Tunnel{
		Conn:        conn,
		UserID:      userID,
		Subdomain:   subdomain,
		ConnectedAt: time.Now(),
		pending:     make(map[string]chan protocol.Frame),
	}
}

// WriteJSON is the ONLY safe way to write to a WebSocket connection from this package.
// It acquires writeMu before delegating to gorilla's WriteJSON.
//
// In TypeScript you might use a queue or async mutex; in Go we use sync.Mutex.
// The `defer` keyword schedules the Unlock to run when this function returns,
// even if WriteJSON panics — similar to try/finally.
func (t *Tunnel) WriteJSON(v any) error {
	t.writeMu.Lock()
	defer t.writeMu.Unlock()
	return t.Conn.WriteJSON(v)
}

// AddPending registers a response channel for a given channelID.
// Called by the proxy handler before sending a request frame to the CLI.
func (t *Tunnel) AddPending(channelID string, ch chan protocol.Frame) {
	t.mu.Lock()
	defer t.mu.Unlock()
	t.pending[channelID] = ch
}

// ResolvePending delivers a response frame to the waiting proxy handler.
// Returns true if the channel was found and the frame was sent.
//
// The `select` with `default` is a non-blocking channel send — if nobody is
// listening (e.g. request timed out), we silently drop it to avoid blocking.
func (t *Tunnel) ResolvePending(channelID string, frame protocol.Frame) bool {
	t.mu.Lock()
	ch, ok := t.pending[channelID]
	t.mu.Unlock() // Unlock before sending to avoid holding lock during channel send

	if !ok {
		return false
	}

	// Non-blocking send: if the channel is already full (capacity 1) or the
	// reader is gone, we don't block — we just discard.
	select {
	case ch <- frame:
		return true
	default:
		return false
	}
}

// RemovePending cleans up the pending map entry after the proxy handler finishes
// (either successfully or after a timeout). Always called via defer in the proxy.
func (t *Tunnel) RemovePending(channelID string) {
	t.mu.Lock()
	defer t.mu.Unlock()
	delete(t.pending, channelID)
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

// Registry is a thread-safe map from subdomain → *Tunnel.
// sync.RWMutex allows multiple concurrent readers (Get, List, Count) but only
// one writer at a time (Register, Unregister). This is more efficient than a
// plain sync.Mutex when reads are much more frequent than writes.
type Registry struct {
	mu      sync.RWMutex
	tunnels map[string]*Tunnel
}

// New returns an initialized Registry.
// Convention in Go: a "constructor" function is named New() and returns a pointer
// to the struct. Callers don't need to know the internal structure.
func New() *Registry {
	return &Registry{
		tunnels: make(map[string]*Tunnel),
	}
}

// Register adds a tunnel to the registry under the given subdomain.
// Uses a write lock (Lock/Unlock) since we're mutating the map.
func (r *Registry) Register(subdomain string, t *Tunnel) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.tunnels[subdomain] = t
}

// Get retrieves a tunnel by subdomain. The second return value (bool) is Go's
// idiomatic way to distinguish "key not found" from "value is nil/zero" —
// similar to Map.get() returning undefined vs. null in TypeScript.
// Uses a read lock (RLock/RUnlock) since we're only reading.
func (r *Registry) Get(subdomain string) (*Tunnel, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	t, ok := r.tunnels[subdomain]
	return t, ok
}

// Unregister removes a tunnel from the registry.
// Called via defer in the control server when a WebSocket disconnects.
func (r *Registry) Unregister(subdomain string) {
	r.mu.Lock()
	defer r.mu.Unlock()
	delete(r.tunnels, subdomain)
}

// List returns a snapshot of all active tunnels as a slice.
// We copy the map values under the read lock, then release it immediately.
// Returning copies (not live map values) means callers can iterate safely
// without holding the lock.
func (r *Registry) List() []*Tunnel {
	r.mu.RLock()
	defer r.mu.RUnlock()
	tunnels := make([]*Tunnel, 0, len(r.tunnels))
	for _, t := range r.tunnels {
		tunnels = append(tunnels, t)
	}
	return tunnels
}

// Count returns the number of active tunnels. Needs only a read lock.
func (r *Registry) Count() int {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return len(r.tunnels)
}
