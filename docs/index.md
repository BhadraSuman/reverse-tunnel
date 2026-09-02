# Reverse Tunnel Documentation

Welcome to the **Reverse Tunnel** docs! This project is a self-hosted alternative to ngrok, built with Go and Next.js.

## Quick Links
- [CLI Usage Guide](./cli-usage.md)
- [Deployment Guide](./deployment.md)
- [Troubleshooting](./troubleshooting.md)
- [Roadmap](./roadmap.md)

## Quick Start
1. **Install CLI:**
   ```bash
   go install github.com/bhadrasuman/reverse-tunnel/cmd/tunnel@latest
   ```
2. **Configure:**
   ```bash
   tunnel config --key tk_YOUR_KEY --server wss://tunnel.quickshelf.online
   ```
3. **Start:**
   ```bash
   tunnel start --port 3000
   ```

## Architecture Overview

```text
Your Browser
        │
        │ visits https://brave-wolf-42.yourdomain.com
        ▼
    [ Nginx ] (Cloud Server)
        │
        │ forwards to port 4000
        ▼
  [ Go Proxy Server ]
        │
        │ sends request through WebSocket tunnel
        ▼
  [ Your Laptop (CLI) ]
        │
        │ forwards to localhost:3000
        ▼
  [ Local Application ]
```

## Local Development
To run the stack locally:
```bash
# 1. Start MongoDB
docker compose up -d mongo

# 2. Run the Go server
make dev-server

# 3. Start the dashboard
cd dashboard && npm run dev
```

## Environment Variables
| Variable | Location | Description |
|---|---|---|
| `DOMAIN` | `.env` | Base domain (e.g., `quickshelf.online`) |
| `MONGODB_URI` | `.env` / `dashboard/.env.local` | MongoDB connection string |
| `PORT_CONTROL` | `.env` | WebSocket control port (default: 3001) |
| `PORT_PROXY` | `.env` | HTTP proxy port (default: 4000) |
| `PORT_API` | `.env` | Internal API port (default: 3002) |
| `AUTH_SECRET` | `dashboard/.env.local` | NextAuth v5 secret key |
| `AUTH_URL` | `dashboard/.env.local` | NextAuth v5 base URL |
| `AUTH_GITHUB_ID` | `dashboard/.env.local` | GitHub OAuth Client ID |
| `AUTH_GITHUB_SECRET`| `dashboard/.env.local` | GitHub OAuth Client Secret |

## License
MIT License
