// Package protocol defines the shared WebSocket message format used by both
// the server and the CLI client. Think of this like a shared TypeScript
// interface file — one source of truth for the wire protocol.
package protocol

// MessageType is a string alias used as an enum.
// In Go, we create typed constants to get type safety without a true enum type.
type MessageType string

const (
	// TypeConnected is sent by the server to the CLI after a successful handshake.
	// It carries the assigned subdomain for the tunnel.
	TypeConnected MessageType = "connected"

	// TypeRequest is sent by the server to the CLI when an HTTP request comes in
	// through the proxy. The CLI must forward it to localhost.
	TypeRequest MessageType = "request"

	// TypeResponse is sent by the CLI back to the server after it has made
	// the local HTTP request and received a response.
	TypeResponse MessageType = "response"

	// TypePing / TypePong are used for the WebSocket keep-alive heartbeat.
	// The server sends pings; the CLI responds with pongs.
	TypePing MessageType = "ping"
	TypePong MessageType = "pong"

	// TypeError is used to signal error conditions over the WebSocket.
	TypeError MessageType = "error"
)

// Frame is the envelope for every WebSocket message in the system.
// Only the fields relevant to each message type need to be populated.
//
// In Go, struct tags (the backtick expressions) control JSON marshaling.
// `json:"type"` means the field is serialized as "type" in JSON.
// `json:",omitempty"` means the field is omitted if it's the zero value
// (empty string, 0, nil map, etc.) — similar to making a field optional in TS.
type Frame struct {
	// Type identifies the message purpose (required in every frame).
	Type MessageType `json:"type"`

	// ChannelID ties a request frame to its response frame.
	// It acts like a correlation ID / request ID.
	ChannelID string `json:"channelId,omitempty"`

	// Subdomain is set in the TypeConnected frame to tell the CLI
	// what public subdomain was assigned to it.
	Subdomain string `json:"subdomain,omitempty"`

	// --- HTTP Request fields (TypeRequest) ---

	// Method is the HTTP method (GET, POST, etc.)
	Method string `json:"method,omitempty"`

	// Path is the request path + query string (e.g. "/api/users?page=1")
	Path string `json:"path,omitempty"`

	// Headers is a flat map of request/response headers.
	// We flatten multi-value headers to a single string (first value wins)
	// to keep the protocol simple.
	Headers map[string]string `json:"headers,omitempty"`

	// Body is the base64-encoded request or response body.
	// We use base64 because JSON strings must be valid UTF-8, but HTTP bodies
	// can be arbitrary binary data (images, gzip, etc.).
	Body string `json:"body,omitempty"`

	// --- HTTP Response fields (TypeResponse) ---

	// Status is the HTTP response status code (e.g. 200, 404).
	Status int `json:"status,omitempty"`

	// --- Error / info / version fields ---

	// Message carries human-readable text for TypeError or TypeConnected frames.
	Message string `json:"message,omitempty"`

	// LatestVersion carries the current latest CLI version string available from server.
	LatestVersion string `json:"latestVersion,omitempty"`

	// UpdateNotice carries an upgrade recommendation banner text if the client CLI is outdated.
	UpdateNotice string `json:"updateNotice,omitempty"`
}
