// Package mcp implements a Model Context Protocol (MCP) server over stdin/stdout.
// It allows AI coding assistants (Claude Code, Cursor, Antigravity) to query active
// tunnels, inspect HTTP traffic logs, and trigger request replays via JSON-RPC 2.0.
package mcp

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/bhadrasuman/reverse-tunnel/internal/version"
)

// JSONRPCRequest represents an incoming MCP JSON-RPC 2.0 request frame.
type JSONRPCRequest struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      interface{}     `json:"id,omitempty"`
	Method  string          `json:"method"`
	Params  json.RawMessage `json:"params,omitempty"`
}

// JSONRPCResponse represents an outgoing MCP JSON-RPC 2.0 response frame.
type JSONRPCResponse struct {
	JSONRPC string      `json:"jsonrpc"`
	ID      interface{} `json:"id,omitempty"`
	Result  interface{} `json:"result,omitempty"`
	Error   *RPCError   `json:"error,omitempty"`
}

// RPCError represents a JSON-RPC error.
type RPCError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

// ToolCallParams represents params for tools/call.
type ToolCallParams struct {
	Name      string                 `json:"name"`
	Arguments map[string]interface{} `json:"arguments"`
}

// Server handles MCP JSON-RPC communication over stdin/stdout.
type Server struct {
	apiURL string
	client *http.Client
}

// NewServer constructs an MCP Server.
func NewServer(apiURL string) *Server {
	if apiURL == "" {
		apiURL = "http://localhost:3002"
	}
	// Strip trailing slashes
	apiURL = strings.TrimRight(apiURL, "/")
	return &Server{
		apiURL: apiURL,
		client: &http.Client{},
	}
}

// Run starts the JSON-RPC read loop over stdin and responses to stdout.
func (s *Server) Run() error {
	reader := bufio.NewReader(os.Stdin)

	for {
		line, err := reader.ReadBytes('\n')
		if err != nil {
			if err == io.EOF {
				return nil
			}
			return err
		}

		line = bytes.TrimSpace(line)
		if len(line) == 0 {
			continue
		}

		var req JSONRPCRequest
		if err := json.Unmarshal(line, &req); err != nil {
			s.sendError(nil, -32700, "Parse error")
			continue
		}

		s.handleRequest(req)
	}
}

func (s *Server) handleRequest(req JSONRPCRequest) {
	// Handle notifications (requests without ID)
	if req.ID == nil {
		return
	}

	switch req.Method {
	case "initialize":
		s.sendResult(req.ID, map[string]interface{}{
			"protocolVersion": "2024-11-05",
			"capabilities": map[string]interface{}{
				"tools": map[string]interface{}{},
			},
			"serverInfo": map[string]interface{}{
				"name":    "reverse-tunnel",
				"version": version.Version,
			},
		})

	case "ping":
		s.sendResult(req.ID, map[string]interface{}{})

	case "tools/list":
		s.sendResult(req.ID, map[string]interface{}{
			"tools": []map[string]interface{}{
				{
					"name":        "list_active_tunnels",
					"description": "Lists all active reverse tunnels currently running on the server including subdomain, uptime, and request count.",
					"inputSchema": map[string]interface{}{
						"type":       "object",
						"properties": map[string]interface{}{},
					},
				},
				{
					"name":        "list_recent_requests",
					"description": "Queries captured HTTP traffic logs for a specific tunnel subdomain.",
					"inputSchema": map[string]interface{}{
						"type": "object",
						"properties": map[string]interface{}{
							"subdomain": map[string]interface{}{
								"type":        "string",
								"description": "The tunnel subdomain to query logs for",
							},
							"limit": map[string]interface{}{
								"type":        "number",
								"description": "Maximum number of log entries to return (default: 20)",
							},
						},
						"required": []string{"subdomain"},
					},
				},
				{
					"name":        "get_request_detail",
					"description": "Retrieves complete HTTP request and response details (headers and body) for a log ID.",
					"inputSchema": map[string]interface{}{
						"type": "object",
						"properties": map[string]interface{}{
							"logId": map[string]interface{}{
								"type":        "string",
								"description": "The unique log entry ID",
							},
						},
						"required": []string{"logId"},
					},
				},
				{
					"name":        "replay_request",
					"description": "Replays a previously captured request payload against the target active tunnel.",
					"inputSchema": map[string]interface{}{
						"type": "object",
						"properties": map[string]interface{}{
							"logId": map[string]interface{}{
								"type":        "string",
								"description": "The ID of the request log to replay",
							},
							"subdomain": map[string]interface{}{
								"type":        "string",
								"description": "The tunnel subdomain",
							},
						},
						"required": []string{"logId", "subdomain"},
					},
				},
			},
		})

	case "tools/call":
		var params ToolCallParams
		if err := json.Unmarshal(req.Params, &params); err != nil {
			s.sendError(req.ID, -32602, "Invalid params")
			return
		}
		s.handleToolCall(req.ID, params)

	default:
		s.sendError(req.ID, -32601, "Method not found")
	}
}

func (s *Server) handleToolCall(id interface{}, params ToolCallParams) {
	switch params.Name {
	case "list_active_tunnels":
		res, err := s.client.Get(s.apiURL + "/api/tunnels")
		if err != nil {
			s.sendToolText(id, fmt.Sprintf("Error fetching tunnels: %v", err))
			return
		}
		defer res.Body.Close()
		body, _ := io.ReadAll(res.Body)
		s.sendToolText(id, string(body))

	case "list_recent_requests":
		sub, _ := params.Arguments["subdomain"].(string)
		if sub == "" {
			s.sendToolText(id, "Error: subdomain argument required")
			return
		}
		res, err := s.client.Get(fmt.Sprintf("%s/api/inspect/logs?subdomain=%s", s.apiURL, sub))
		if err != nil {
			s.sendToolText(id, fmt.Sprintf("Error fetching logs: %v", err))
			return
		}
		defer res.Body.Close()
		body, _ := io.ReadAll(res.Body)
		s.sendToolText(id, string(body))

	case "get_request_detail":
		logID, _ := params.Arguments["logId"].(string)
		if logID == "" {
			s.sendToolText(id, "Error: logId argument required")
			return
		}
		res, err := s.client.Get(fmt.Sprintf("%s/api/inspect/log?id=%s", s.apiURL, logID))
		if err != nil {
			s.sendToolText(id, fmt.Sprintf("Error fetching log detail: %v", err))
			return
		}
		defer res.Body.Close()
		body, _ := io.ReadAll(res.Body)
		s.sendToolText(id, string(body))

	case "replay_request":
		logID, _ := params.Arguments["logId"].(string)
		sub, _ := params.Arguments["subdomain"].(string)
		if logID == "" || sub == "" {
			s.sendToolText(id, "Error: logId and subdomain arguments required")
			return
		}

		payload := map[string]string{"logId": logID, "subdomain": sub}
		pBytes, _ := json.Marshal(payload)
		res, err := s.client.Post(s.apiURL+"/api/inspect/replay", "application/json", bytes.NewReader(pBytes))
		if err != nil {
			s.sendToolText(id, fmt.Sprintf("Error replaying request: %v", err))
			return
		}
		defer res.Body.Close()
		body, _ := io.ReadAll(res.Body)
		s.sendToolText(id, string(body))

	default:
		s.sendError(id, -32601, fmt.Sprintf("Unknown tool: %s", params.Name))
	}
}

func (s *Server) sendToolText(id interface{}, text string) {
	s.sendResult(id, map[string]interface{}{
		"content": []map[string]interface{}{
			{
				"type": "text",
				"text": text,
			},
		},
	})
}

func (s *Server) sendResult(id interface{}, result interface{}) {
	resp := JSONRPCResponse{
		JSONRPC: "2.0",
		ID:      id,
		Result:  result,
	}
	s.writeResponse(resp)
}

func (s *Server) sendError(id interface{}, code int, message string) {
	resp := JSONRPCResponse{
		JSONRPC: "2.0",
		ID:      id,
		Error: &RPCError{
			Code:    code,
			Message: message,
		},
	}
	s.writeResponse(resp)
}

func (s *Server) writeResponse(resp JSONRPCResponse) {
	bytes, err := json.Marshal(resp)
	if err != nil {
		return
	}
	os.Stdout.Write(bytes)
	os.Stdout.Write([]byte("\n"))
}

// Suppress unused imports warning if needed
var _ = strconv.Itoa
