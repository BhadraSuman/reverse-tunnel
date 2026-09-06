# Developer & Contributor Guide

Welcome to the **Reverse Tunnel** developer guide. This document provides an overview of the system architecture, code organization, security model, local development setup, testing, and contribution standards.

---

## 1. System Architecture

Reverse Tunnel is composed of three primary components:

```
                          ┌──────────────────────────┐
                          │ External Browser Visitor │
                          └─────────────┬────────────┘
                                        │ (HTTPS / port 443)
                                        ▼
                          ┌──────────────────────────┐
                          │    Nginx Reverse Proxy   │
                          └─────────────┬────────────┘
                                        │
           ┌────────────────────────────┴────────────────────────────┐
           │                                                         │
           ▼ (HTTP / port 4000)                                      ▼ (WSS / port 3001)
┌──────────────────────┐                                 ┌──────────────────────┐
│   Go Proxy Server    │                                 │  Go Control Server   │
│  (internal/proxy)    │                                 │  (internal/control)  │
└──────────┬───────────┘                                 └──────────┬───────────┘
           │                                                        │
           │           ┌────────────────────────────────┐           │
           └──────────►│      Tunnel Registry Map       │◄──────────┘
                       │      (internal/registry)       │
                       └────────────────────────────────┘
                                        │
                                        ▼ (WebSocket Stream)
                       ┌────────────────────────────────┐
                       │     CLI Client (User Laptop)   │
                       │     (cli / cmd/tunnel)         │
                       └────────────────────────────────┘
                                        │
                                        ▼ (HTTP localhost:3000)
                       ┌────────────────────────────────┐
                       │       Local App / Server       │
                       └────────────────────────────────┘
```

1. **Control Server (`internal/control`)**: Handles WebSocket handshakes from the CLI client, authenticates API keys against MongoDB, and registers active tunnels.
2. **Proxy Server (`internal/proxy`)**: Receives public HTTP traffic on subdomains, matches the active tunnel, streams the request over the WebSocket connection, and routes the response back to the client.
3. **CLI Client (`cli/`, `cmd/tunnel`)**: Connects to the Control Server, sets up local HTTP forwarding, and processes incoming requests.
4. **Dashboard (`dashboard/`)**: A Next.js 15 app for GitHub OAuth authentication, API key generation, active tunnel monitoring, traffic inspection, and 1-click webhook replays.

---

## 2. Codebase Directory Structure

```
reverse-tunnel/
├── cli/                 # CLI logic (WebSocket dialer, HTTP forwarder, local config)
├── cmd/
│   ├── server/          # Main entrypoint for Go Control + Proxy Server
│   └── tunnel/          # Main entrypoint for CLI client binary
├── dashboard/           # Next.js 15 web application & API routes
│   ├── src/app/         # App router (dashboard, docs, auth API)
│   ├── src/components/  # UI components (tunnels table, traffic inspector, quickstart)
│   ├── src/lib/         # Auth, MongoDB connection, API utilities
│   └── src/models/      # Mongoose models (User, Tunnel, ApiKey, RequestLog)
├── docs/                # Project documentation
├── internal/
│   ├── auth/            # API key authentication & SHA-256 validation
│   ├── control/         # WebSocket control plane server
│   ├── models/          # Shared Go models (User, Tunnel)
│   ├── protocol/        # WebSocket binary/JSON frame protocol definition
│   ├── proxy/           # Public HTTP proxy router & request handler
│   ├── registry/        # Thread-safe in-memory tunnel registry
│   └── subdomain/       # Account namespace isolation & system blacklist checks
├── scripts/             # Deployment & helper scripts
└── docker-compose.yml   # Multi-container production stack (MongoDB)
```

---

## 3. Security Architecture & Principles

### Strict Account Namespace Isolation
To prevent subdomain hijacking and phishing attacks, every tunnel URL is strictly scoped to the authenticated user's GitHub username:
- **Default Port Format**: `tunnel start --port 3000` -> `https://<username>-3000.quickshelf.online`
- **Custom Name Format**: `tunnel start --port 3000 --name billing` -> `https://<username>-billing.quickshelf.online`

### System Subdomain Blacklist
Infrastructure and platform subdomains (`dashboard`, `admin`, `api`, `tunnel`, `www`, `app`, `mail`, `status`) are reserved. Any user attempt to claim a reserved subdomain triggers a `403 Forbidden` error.

### SHA-256 API Key Storage
Plaintext API keys (e.g. `tk_...`) are generated once using 24 cryptographically secure random bytes and shown to the user only upon generation. Databases store only the SHA-256 digest (`apiKeyHash`). Plain text keys are never stored or logged.

---

## 4. Local Development Setup

### Prerequisites
- **Go**: v1.22 or higher
- **Node.js**: v18 or higher
- **Docker**: For local MongoDB instance

### Step-by-Step Instructions

1. **Start MongoDB**:
   ```bash
   docker compose up -d mongo
   ```

2. **Start the Go Control & Proxy Server**:
   ```bash
   make dev-server
   ```
   *(Server starts control plane on `ws://localhost:3001` and proxy on `http://localhost:4000`)*

3. **Start the Next.js Dashboard**:
   ```bash
   cd dashboard
   npm install
   npm run dev
   ```
   *(Dashboard opens at `http://localhost:3000`)*

4. **Test the CLI Client**:
   ```bash
   # Configure server URL and API key
   go run ./cmd/tunnel config --key tk_YOUR_KEY --server ws://localhost:3001

   # Start tunnel for a local port
   go run ./cmd/tunnel start --port 3000
   ```

---

## 5. Testing & Code Quality

### Go Tests
Run all unit tests across Go packages:
```bash
go test -v ./...
```

To run tests with race detection:
```bash
go test -race ./...
```

### Dashboard Build Verification
Verify Next.js compilation, TypeScript types, and static page generation:
```bash
cd dashboard
npm run build
```

---

## 6. Documentation Maintenance Policy

Whenever introducing a new feature, flag, or architectural change:
1. Update repo markdown files inside `docs/` (`cli-usage.md`, `deployment.md`, `troubleshooting.md`, `roadmap.md`).
2. Update the interactive dashboard docs page at `dashboard/src/app/docs/page.tsx`.
3. Keep code comments and docstrings up to date.