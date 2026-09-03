# 🗺️ Roadmap & Future Architecture

This document outlines the strategic vision and feature roadmap for **Reverse Tunnel**. Unlike basic port-forwarding tools, Reverse Tunnel aims to provide a complete **Traffic Capture, Debugging, and AI-Powered Observability Platform** for developers.

---

## 🎯 Phase 1: Core Capture & Debugging Engine (Foundational)

### 1. Traffic Inspector & One-Click Replay
* **What it is:** A full-featured HTTP traffic capture and replay console embedded directly in the dashboard and CLI.
* **What it does:** Captures every incoming HTTP request and outgoing response (headers, body, status code, timing, and payload size). Developers can view the payload in real-time and click a **"Replay"** button to re-trigger the exact request against their local machine without needing the original sender to send it again.
* **Engineering & Architecture:**
  * **Capture Layer:** Go proxy interceptor buffers the request/response stream and asynchronously writes to MongoDB with a TTL (Time-To-Live) index for auto-expiration.
  * **Real-Time Streaming:** Uses WebSocket broadcasting from the Go server to stream live inspect entries to the Next.js dashboard.
  * **Replay Engine:** The server reconstructs the exact `protocol.Frame` and pushes it back down the active tunnel channel, preserving headers and original request context.

### 2. Specialized Webhook Debugging Suite
* **What it is:** A dedicated toolset designed specifically for testing third-party webhooks (Stripe, GitHub, Twilio, Shopify, Slack).
* **What it does:**
  * **Automatic HMAC Signature Verification:** Automatically parses and verifies signature headers (e.g., `Stripe-Signature`, `X-Hub-Signature-256`) against secret keys to catch verification bugs early.
  * **Offline Payload Replay:** Allows developers to replay captured webhooks without triggering expensive or rate-limited real events on third-party platforms.
  * **Payload Diffing:** Side-by-side visual diffing between two incoming webhook payloads to see exact schema changes or missing fields.
* **Why it matters:** Webhook integration is the #1 reason developers use reverse tunnels. Eliminates the pain of triggering 20+ real Stripe test payments just to debug a local handler.

---

## ⚡ Phase 2: Resilience & Network Control

### 3. Fault Injection Engine (Chaos Engineering)
* **What it is:** Middleware inside the proxy server that allows developers to simulate adverse network conditions and server failures.
* **What it does:** Allows configuring rules per tunnel via dashboard/CLI:
  * **Latency Injection:** Introduce artificial delay (e.g., add +800ms) to test frontend loading states and request timeouts.
  * **Error Rate Simulation:** Randomly fail a percentage of requests (e.g., 10% 503 Service Unavailable) to test retry logic and circuit breakers.
  * **Connection Dropping:** Terminate connections mid-response to test client recovery.
* **Engineering & Architecture:** Built directly into the Go proxy request pipeline as a lightweight, rule-matching middleware without requiring any code changes in the developer's application.

### 4. Request-Level Access Control & Security
* **What it is:** Fine-grained security controls to protect publicly exposed local servers.
* **What it does:**
  * **Expiring Tunnel Links:** Generate URLs that automatically expire after a set duration (e.g., 1 hour for client demos).
  * **IP Allowlisting:** Restrict tunnel access to specific client IP addresses or CIDR blocks.
  * **Basic Auth & OIDC Gating:** Challenge unauthenticated visitors with HTTP Basic Auth or OAuth before proxying requests to localhost.

---

## 🤖 Phase 3: AI & Agentic Workflow Integrations

### 5. Native Model Context Protocol (MCP) Server
* **What it is:** An integrated MCP (Model Context Protocol) server exposed directly by the tunnel infrastructure.
* **What it does:** Allows AI coding assistants (Claude Code, Cursor, Windsurf, Copilot) to directly inspect, query, and debug local server traffic via standardized agent tools:
  * `list_recent_requests`: Query traffic filtered by status code or path.
  * `get_request_detail`: Retrieve complete request/response headers and body.
  * `replay_request`: Trigger request replays directly from the AI agent's chat interface.
* **Why it matters:** Places Reverse Tunnel directly inside the modern agentic developer workflow. The AI agent can diagnose bugs by reading live network traffic rather than guessing.

### 6. Automated AI Failure Triage & Root Cause Analysis
* **What it is:** Real-time AI analysis of failed HTTP requests (4xx / 5xx errors).
* **What it does:** When a request fails, the system automatically:
  1. Redacts sensitive data (API keys, passwords, JWTs).
  2. Constructs a compact context payload (stack traces, response body, headers, timing).
  3. Queries an LLM using structured JSON outputs to generate a concise root-cause explanation, confidence score, and suggested fix rendered directly in the dashboard.
* **Engineering & Architecture:** Implements strict context window truncation, prompt caching for static instructions, and a two-stage fallback so failed LLM calls never disrupt core proxy operations.

### 7. Two-Stage PII & Secret Leak Detection
* **What it is:** Security inspection of outgoing response bodies to prevent accidental exposure of credentials or sensitive data.
* **What it does:** Warns developers if their local API accidentally leaks API keys, database credentials, AWS secrets, or PII (emails, SSNs) to the public web.
* **Engineering & Architecture:** Uses a high-performance **two-stage evaluation pipeline**:
  * **Stage 1 (High Speed, Zero Cost):** Regex pattern matching and Shannon entropy calculation catch 90%+ of credential formats in ~0ms.
  * **Stage 2 (Targeted AI Validation):** Only flagged payloads are sent to a fast LLM classifier to eliminate false positives. Reduces AI token costs by ~97%.

---

## 🚀 Phase 4: Platform & Protocol Extensions

### 8. Semantic Traffic Search (Vector RAG on Real Data)
* **What it is:** Vector-based natural language search over captured network traffic.
* **What it does:** Enables queries like *"Show me requests where checkout failed after the user auth refactor"* using MongoDB Atlas Vector Search + hybrid keyword filtering.

### 9. Non-HTTP Raw TCP Tunneling
* **What it is:** Support for forwarding raw bidirectional TCP streams.
* **What it does:** Extends Reverse Tunnel beyond web servers to support databases (PostgreSQL, MySQL, Redis), SSH sessions, and gRPC services.
* **Engineering Challenge:** Requires extending the multiplexing layer from frame-based HTTP chunks to persistent, bidirectional byte-stream multiplexing.

### 10. Instant Static Site & HTML Hosting (`tunnel deploy`)
* **What it is:** A zero-configuration static asset deployment tool built into both the CLI and Dashboard.
* **What it does:** Allows developers to publish an `index.html` file or build output directory (`dist/`) using `tunnel deploy ./dist` or drag-and-drop in the Dashboard. Generates a live URL (e.g. `swift-falcon-88.quickshelf.online`) that remains online even when the local laptop is powered off.
* **Engineering & Architecture:**
  * **Dual-Mode Proxy Routing:** The Go proxy checks subdomain entries in MongoDB. If flagged `isStatic: true`, requests bypass the WebSocket tunnel channel and are served directly from disk via `http.FileServer`.
  * **Abuse & Quota Control:** Enforces per-user storage quotas (e.g., 20 MB per deployment) and requires authenticated sessions to prevent phishing abuse.

---

## 📊 Summary Roadmap Matrix

| Milestone | Target Feature | Key Technical Highlight |
|---|---|---|
| **v0.2** | Traffic Inspector & Replay | Go Proxy Interceptor + MongoDB TTL + WS Streaming |
| **v0.2** | Webhook Debugger & HMAC | Signature validation engines (Stripe/GitHub) & diffing |
| **v0.3** | Fault Injection Middleware | Chaos engineering latency & error injection |
| **v0.3** | MCP Server Integration | Protocol implementation for Cursor & Claude Code |
| **v0.4** | AI Triage & PII Detector | Structured JSON output + Two-stage entropy/LLM filter |
| **v0.4** | Instant Static Site Hosting | Dual-mode Go proxy routing (`isStatic`) & disk file serving |
| **v0.5** | Raw TCP Tunneling | Bidirectional byte-stream multiplexing |
