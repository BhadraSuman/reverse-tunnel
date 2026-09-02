# CLI Usage Guide

The `tunnel` CLI is the client-side component that runs on your local machine and forwards traffic to your local applications.

## Installation

**From source (requires Go 1.26+):**
```bash
go install github.com/bhadrasuman/reverse-tunnel/cmd/tunnel@latest
```

**Or build locally from the repo:**
```bash
git clone https://github.com/bhadrasuman/reverse-tunnel.git
cd reverse-tunnel
go build -o tunnel ./cmd/tunnel
# On Windows use: go build -o tunnel.exe ./cmd/tunnel
```

## Configuration
The CLI needs to know your server URL and API key to connect to your instance.

### API Key
1. Log in to your dashboard (e.g., `https://dashboard.quickshelf.online`).
2. Click **Regenerate Key**.
3. **Copy the full key immediately.** (It starts with `tk_` and is 51 characters long. The dashboard will only show the prefix later for security).

### Saving Config
```bash
tunnel config --key tk_YOUR_FULL_KEY --server wss://tunnel.quickshelf.online
```

**Config File Locations:**
- Windows: `%AppData%\tunnel\config.json`
- Mac: `~/Library/Application Support/tunnel/config.json`
- Linux: `~/.config/tunnel/config.json`

## Commands

### `tunnel start`
Starts the reverse tunnel, exposing a local port to the public internet.

```bash
# Expose local port 3000 using saved config
tunnel start --port 3000

# Override config values on the fly
tunnel start --port 8080 --server wss://tunnel.quickshelf.online --key tk_...
```

**Output:**
```text
  ⟳  Connecting to wss://tunnel.quickshelf.online...
  ✔  Tunnel live → https://brave-wolf-42.quickshelf.online
```

**Auto-reconnect:**
If the connection drops (e.g., internet hiccup), the CLI uses exponential backoff to reconnect seamlessly: `1s → 2s → 4s → 8s → ...` capped at a maximum of `30s`.

### `tunnel config`
Saves configuration to disk so you don't have to pass flags every time.

```bash
tunnel config --key <key> --server <url>
```

### `tunnel version`
Prints the current CLI version.
