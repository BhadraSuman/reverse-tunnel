package cli

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/bhadrasuman/reverse-tunnel/internal/protocol"
)

// hopByHopHeaders are headers that describe the connection between two adjacent
// nodes, not the end-to-end transmission. Proxies must remove them when
// forwarding. This mirrors what Nginx / express-http-proxy do automatically.
var hopByHopHeaders = []string{
	"Connection",
	"Keep-Alive",
	"Proxy-Authenticate",
	"Proxy-Authorization",
	"Te",
	"Trailers",
	"Transfer-Encoding",
	"Upgrade",
}

// forwardRequest handles a single incoming tunnel request:
// 1. Decodes the request from the frame.
// 2. Makes a real HTTP request to localhost.
// 3. Sends the response back through the tunnel.
//
// This runs in its own goroutine (spawned by readLoop), so it can block on the
// HTTP call without affecting other concurrent requests.
func (c *Client) forwardRequest(frame protocol.Frame) {
	start := time.Now()

	// --- Step 1: Decode request body ---
	// The server sent the body as base64. We decode it back to raw bytes.
	var bodyReader io.Reader
	if frame.Body != "" {
		bodyBytes, err := base64.StdEncoding.DecodeString(frame.Body)
		if err != nil {
			c.sendErrorResponse(frame.ChannelID, http.StatusBadRequest)
			return
		}
		bodyReader = strings.NewReader(string(bodyBytes))
	}

	// --- Step 2: Build the local HTTP request ---
	// fmt.Sprintf builds the full URL like "http://localhost:3000/api/hello"
	localURL := fmt.Sprintf("http://localhost:%d%s", c.LocalPort, frame.Path)

	req, err := http.NewRequest(frame.Method, localURL, bodyReader)
	if err != nil {
		c.sendErrorResponse(frame.ChannelID, http.StatusBadRequest)
		return
	}

	// --- Step 3: Copy headers from the tunnel frame to the local request ---
	for key, val := range frame.Headers {
		req.Header.Set(key, val)
	}

	// Remove hop-by-hop headers — they don't make sense end-to-end.
	for _, h := range hopByHopHeaders {
		req.Header.Del(h)
	}

	// Override Host to point to localhost so the local server doesn't get confused.
	req.Host = fmt.Sprintf("localhost:%d", c.LocalPort)

	// --- Step 4: Make the HTTP request ---
	// http.Client with a timeout — never use the default client without a timeout
	// in production code, as it can hang forever.
	httpClient := &http.Client{Timeout: 25 * time.Second}

	resp, err := httpClient.Do(req)
	if err != nil {
		c.sendErrorResponse(frame.ChannelID, http.StatusBadGateway)
		return
	}
	defer resp.Body.Close() //nolint:errcheck — cleanup only

	// --- Step 5: Read and encode the response body ---
	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		c.sendErrorResponse(frame.ChannelID, http.StatusInternalServerError)
		return
	}
	encodedBody := base64.StdEncoding.EncodeToString(respBytes)

	// --- Step 6: Flatten response headers ---
	flatHeaders := make(map[string]string, len(resp.Header))
	for key := range resp.Header {
		flatHeaders[key] = resp.Header.Get(key)
	}

	// Remove hop-by-hop headers from response too.
	for _, h := range hopByHopHeaders {
		delete(flatHeaders, h)
	}

	// --- Step 7: Send the response frame back to the server ---
	responseFrame := protocol.Frame{
		Type:      protocol.TypeResponse,
		ChannelID: frame.ChannelID,
		Status:    resp.StatusCode,
		Headers:   flatHeaders,
		Body:      encodedBody,
	}

	if err := c.WriteFrame(responseFrame); err != nil {
		// The tunnel connection dropped — nothing we can do.
		return
	}

	// --- Step 8: Log the completed request ---
	LogRequest(frame.Method, frame.Path, resp.StatusCode, time.Since(start))
}

// sendErrorResponse sends a minimal error response frame when local HTTP fails.
func (c *Client) sendErrorResponse(channelID string, status int) {
	// json.Marshal creates a JSON body for the error response.
	body, _ := json.Marshal(map[string]string{"error": http.StatusText(status)})
	encoded := base64.StdEncoding.EncodeToString(body)

	_ = c.WriteFrame(protocol.Frame{
		Type:      protocol.TypeResponse,
		ChannelID: channelID,
		Status:    status,
		Headers:   map[string]string{"Content-Type": "application/json"},
		Body:      encoded,
	})
}
