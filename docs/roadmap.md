# Roadmap & Future Plans

## v0.2 — Stability & Testing
- **Unit Tests:** Add tests for all packages (proxy, auth, subdomain, registry, protocol, cli forwarder).
- **Integration Test:** Full tunnel flow with httptest and mock WebSockets.
- **Race Conditions:** Run `go test -race` in CI.
- **Memory Leak Fix:** Fix `time.After` goroutine leak in proxy (replace with `time.NewTimer` + `defer Stop()`).
- **Rate Limiting:** Request rate limiting per tunnel.
- **Configurable Limits:** Allow setting body size limit via env var (currently hardcoded to 10MB).
- **Linting:** Add `.golangci.yml` and CI checks.

## v0.3 — CLI Improvements
- **`tunnel status`:** Show current connection info, subdomain, uptime, and request count.
- **`tunnel list`:** List all active tunnels for your account.
- **`tunnel stop`:** Graceful disconnect.
- **Custom Subdomains:** `tunnel start --subdomain myapp`.
- **Request Inspector:** `tunnel start --port 3000 --inspect` to print live HTTP request/response details.
- **Config Show:** `tunnel config show` to display saved variables.
- **Shell Completions:** Bash, zsh, fish, PowerShell completion generation.

## v0.4 — Dashboard Improvements
- **Real-Time Status:** WebSocket updates so page refresh isn't needed.
- **Live Request Logs:** View incoming traffic in the browser.
- **Bandwidth Charts:** Usage graphs over time.
- **Tunnel History:** See past sessions.
- **Key Management:** Support multiple API keys per user with custom labels.
- **Access Controls:** Password-protect specific tunnel URLs.
- **Theme:** Dark/light mode toggle.

## v0.5 — Production Hardening
- **Graceful Shutdown:** Drain in-flight requests before exiting the server.
- **Horizontal Scaling:** Replace in-memory map registry with a Redis-backed registry.
- **Observability:** Prometheus metrics endpoint (`/metrics`) and structured JSON logs (for Loki/Datadog).
- **Cert Monitoring:** Automatic TLS certificate renewal alerting.
- **Admin Panel:** Dashboard for server operators to manage users and view system stats.
- **DB Tuning:** MongoDB indexing and connection pooling optimizations.

## v1.0 — Full Platform
- **TCP Tunnels:** Support for non-HTTP traffic (SSH, databases).
- **TLS Passthrough:** Let the local server terminate SSL.
- **CI/CD:** GitHub Releases with pre-built binaries for linux/darwin/windows (amd64/arm64).
- **Package Managers:** Homebrew formula (macOS) and MSI installer (Windows).
- **Docker CLI:** `docker run ghcr.io/bhadrasuman/tunnel start --port 3000`.
- **Public API:** REST API for programmatic tunnel management.
- **Webhooks:** Notifications for tunnel up/down events.
