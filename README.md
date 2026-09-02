# Reverse Tunnel

**Expose your localhost to the internet. Instantly.**  
A self-hosted ngrok alternative built with Go and Next.js.

[![Go](https://img.shields.io/badge/Go-1.26-00ADD8?logo=go)](https://go.dev)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## What is this?

Reverse Tunnel lets you share your local development server with anyone on the internet — no port forwarding, no VPN, no configuration. Run one command and get a public URL like `https://brave-wolf-42.yourdomain.com`.

```
localhost:3000  ←→  Go CLI  ←→  WebSocket  ←→  Go Server  ←→  Browser
```

---

## Architecture

```
Browser
  │
  ▼
Nginx (*.yourdomain.com:443)  ← wildcard SSL via Cloudflare + Certbot
  │
  ├── dashboard.yourdomain.com → Next.js Dashboard :3000
  ├── tunnel.yourdomain.com   → Go Control Server :3001 (WebSocket)
  └── *.yourdomain.com        → Go HTTP Proxy :4000
                                    │
                                    ▼ (WebSocket frames, multiplexed)
                               CLI on developer's machine
                                    │
                                    ▼
                               localhost:3000
```

**How the tunnel works:**
1. CLI connects to control server with API key
2. Server assigns subdomain (`brave-wolf-42`)
3. HTTP requests to `brave-wolf-42.yourdomain.com` hit the proxy
4. Proxy sends request frame over WebSocket to CLI
5. CLI forwards to `localhost:3000`, sends response back
6. Proxy returns response to original browser request

---

## Prerequisites

**Server:** Ubuntu 22.04+ with a public IP  
**DNS:** Domain managed on Cloudflare (free plan works)  
**Local machine:** Go 1.22+ installed

---

## 1. Server Setup

### 1.1 Point your GoDaddy domain to Cloudflare

1. Go to [cloudflare.com](https://cloudflare.com) → Add your site (free plan)
2. Cloudflare will give you two nameservers, e.g.:
   - `aria.ns.cloudflare.com`
   - `bert.ns.cloudflare.com`
3. In GoDaddy → DNS → Nameservers → Change to Custom → paste both

> Propagation takes 10 minutes to 48 hours (usually under 1 hour)

### 1.2 Add DNS records in Cloudflare

Go to your domain in Cloudflare → DNS → Add these records:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `@` | `YOUR_SERVER_IP` | DNS only (grey) |
| A | `*` | `YOUR_SERVER_IP` | DNS only (grey) |
| A | `dashboard` | `YOUR_SERVER_IP` | DNS only (grey) |
| A | `tunnel` | `YOUR_SERVER_IP` | DNS only (grey) |

> ⚠️ Use **DNS only** (grey cloud), NOT proxied (orange cloud) for `tunnel.*` — Cloudflare's proxy interferes with long-lived WebSocket connections.

### 1.3 Get a Cloudflare API Token

1. [dash.cloudflare.com](https://dash.cloudflare.com) → My Profile → API Tokens
2. Create Token → Use "Edit zone DNS" template
3. Scope it to your specific domain
4. Copy the token (you'll need it for setup)

### 1.4 Create a GitHub OAuth App

1. [github.com/settings/developers](https://github.com/settings/developers) → New OAuth App
2. Fill in:
   - **Homepage URL:** `https://dashboard.yourdomain.com`
   - **Callback URL:** `https://dashboard.yourdomain.com/api/auth/callback/github`
3. Copy Client ID and Client Secret

### 1.5 Clone and run setup script on your server

```bash
# SSH into your server
ssh user@YOUR_SERVER_IP

# Clone the repo
git clone https://github.com/bhadrasuman/reverse-tunnel.git
cd reverse-tunnel

# Run the setup script (installs everything, gets SSL cert, starts services)
chmod +x scripts/setup.sh
sudo ./scripts/setup.sh
```

The script will prompt you for:
- Your domain name
- Cloudflare API token
- GitHub OAuth Client ID + Secret

It will then automatically:
- Install Docker, Nginx, Certbot
- Get a wildcard SSL cert for `*.yourdomain.com`
- Configure Nginx
- Start all services

### 1.6 Verify deployment

```bash
# Check services are running
docker compose ps

# Check logs
make logs
```

Visit `https://dashboard.yourdomain.com` — you should see the login page.

---

## 2. Using the CLI

### Install

```bash
# Option 1: Install with Go (recommended)
go install github.com/bhadrasuman/reverse-tunnel/cmd/tunnel@latest

# Option 2: Download pre-built binary from GitHub Releases
# (see Releases page for your OS/arch)
```

### Configure

```bash
# Get your API key from the dashboard, then:
tunnel config --key YOUR_API_KEY --server wss://tunnel.yourdomain.com
```

### Start tunneling

```bash
# Expose localhost:3000
tunnel start --port 3000

# Output:
# ✔  Tunnel live → https://brave-wolf-42.yourdomain.com
#
#   GET  /                    200   12ms
#   GET  /api/health          200    3ms
#   POST /api/users           201   89ms
```

### Share your tunnel URL

Send `https://brave-wolf-42.yourdomain.com` to anyone. They can hit your local server directly.

---

## 3. Dashboard

Visit `https://dashboard.yourdomain.com` to:
- Sign in with GitHub
- Get your API key
- View all active tunnels
- See request counts per tunnel

---

## Local Development

```bash
# Clone repo
git clone https://github.com/bhadrasuman/reverse-tunnel.git
cd reverse-tunnel

# Copy env file
make env
# Edit .env with your values

# Run MongoDB (required for auth)
docker compose up -d mongo

# Start the Go server
make dev-server

# In another terminal, start the CLI
make dev-cli
```

For the dashboard:
```bash
cd dashboard
npm install
npm run dev
```

---

## Building

```bash
# Build all binaries
make build

# Cross-compile CLI for all platforms
make cross-compile
# Creates: dist/tunnel-linux-amd64, dist/tunnel-darwin-arm64, dist/tunnel-windows-amd64.exe, etc.
```

---

## Project Structure

```
reverse-tunnel/
├── cmd/
│   ├── server/main.go          # Server entry point
│   └── tunnel/main.go          # CLI entry point
├── internal/
│   ├── protocol/               # Shared WebSocket frame types
│   ├── registry/               # Active tunnel registry
│   ├── control/                # WebSocket control server
│   ├── proxy/                  # HTTP proxy server
│   ├── auth/                   # API key validation
│   ├── subdomain/              # Subdomain generator
│   ├── db/                     # MongoDB connection
│   └── models/                 # Data models
├── cli/                        # CLI client logic
├── dashboard/                  # Next.js dashboard
├── nginx/tunnel.conf           # Nginx configuration
├── scripts/setup.sh            # Server bootstrap script
└── docker-compose.yml
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Tunnel Server | Go 1.26, gorilla/websocket |
| CLI | Go 1.26, Cobra |
| Dashboard | Next.js 15, TypeScript, Tailwind CSS |
| Auth | NextAuth.js v5, GitHub OAuth |
| Database | MongoDB 7 |
| Proxy | Nginx |
| SSL | Let's Encrypt (Certbot + Cloudflare) |
| Containers | Docker + Docker Compose |

---

## How the Multiplexing Works

The most interesting part of this project: multiple HTTP requests are handled concurrently over a single WebSocket connection.

```
Incoming HTTP request for brave-wolf-42.yourdomain.com
    │
    ▼ Proxy Server
Generate channelId = "ch_abc123"
Create Go channel: responseCh := make(chan Frame, 1)
Store: tunnel.pending["ch_abc123"] = responseCh

Send over WebSocket:
    { type: "request", channelId: "ch_abc123", method: "GET", path: "/api/data", ... }

    ┌─────────────────────────────┐
    │  goroutine blocks here:     │
    │  select {                   │
    │    case resp := <-responseCh │ ← waiting for CLI response
    │    case <-time.After(30s):  │ ← 504 timeout
    │  }                          │
    └─────────────────────────────┘
         ▲
         │ CLI responds:
         │ { type: "response", channelId: "ch_abc123", status: 200, body: "..." }
         │
Control Server receives response frame
→ tunnel.pending["ch_abc123"] <- frame  (unblocks the waiting goroutine)
→ Proxy writes HTTP response back to browser ✔
```

Each HTTP request is a separate goroutine, each waiting on its own Go channel. This is Go's concurrency model at its best.

---

## License

MIT — see [LICENSE](LICENSE)

---

*Built by [Suman Bhadra](https://github.com/bhadrasuman)*
