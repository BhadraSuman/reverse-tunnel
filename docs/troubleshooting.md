# Troubleshooting Guide

Here are common issues encountered during development and deployment, and how to fix them.

### 1. Port 27017 conflict on local dev
**Error:** `bind: Only one usage of each socket address is normally permitted.`
**Cause:** A native MongoDB instance is already running on port 27017 on the host machine.
**Fix:** Comment out the `ports:` binding for the mongo service in `docker-compose.yml`.

### 2. docker-compose version warning
**Error:** `the attribute 'version' is obsolete, it will be ignored`
**Fix:** Remove `version: "3.9"` from the top of `docker-compose.yml`. Compose V2 doesn't need it.

### 3. Dashboard NextAuth MissingSecret error
**Error:** `MissingSecret: Please define a secret.`
**Cause:** Next.js dashboard needs its own `.env.local` inside the `dashboard/` directory. It does not read the root `.env` file used by Go.
**Fix:** Create `dashboard/.env.local` and add `AUTH_SECRET`.

### 4. `client_id=undefined` in GitHub OAuth URL
**Error:** URL contains `client_id=undefined` when clicking Login.
**Cause:** NextAuth v5 (with shorthand providers) uses specific environment variable names.
**Fix:** Use `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` in `dashboard/.env.local` instead of the v4 `GITHUB_CLIENT_ID` names.

### 5. GitHub OAuth 404 Not Found
**Error:** 404 page on GitHub after clicking login.
**Cause:** Redirect URI is missing or incorrect in the GitHub OAuth App settings.
**Fix:** Add `http://localhost:3000/api/auth/callback/github` (dev) or `https://dashboard.yourdomain.com/api/auth/callback/github` (prod).

### 6. Nginx: unknown directive 'http2'
**Error:** `nginx: [emerg] unknown directive "http2"`
**Cause:** Ubuntu 22.04 ships Nginx 1.18, which doesn't support the standalone `http2 on;` directive (added in 1.25+).
**Fix:** Use inline syntax: `listen 443 ssl http2;` and delete `http2 on;`.
```bash
sudo sed -i 's/listen 443 ssl;/listen 443 ssl http2;/g' /etc/nginx/sites-enabled/tunnel.conf
sudo sed -i '/^    http2 on;$/d' /etc/nginx/sites-enabled/tunnel.conf
sudo nginx -s reload
```

### 7. Docker permission denied
**Error:** `permission denied while trying to connect to the docker API`
**Cause:** Non-root user is not in the docker group.
**Fix:** `sudo usermod -aG docker $USER && newgrp docker`

### 8. Dashboard Docker build fails on public directory
**Error:** `failed to compute cache key: "/app/public": not found`
**Cause:** The `dashboard/public` directory doesn't exist but the Dockerfile tries to copy it.
**Fix:** `mkdir -p dashboard/public` and add a placeholder file so git tracks it.

### 9. websocket: bad handshake
**Cause 1:** CLI is connecting to a placeholder URL (e.g., `wss://tunnel.yourdomain.com`). Fix: `tunnel config --server wss://tunnel.YOURDOMAIN.com`.
**Cause 2:** Using the API key prefix instead of the full API key. Fix: Regenerate key in dashboard and use the 51-character key.

### 10. API key only shows prefix in dashboard
**Cause:** For security, the full key is only shown *once* when generated. The DB only stores a one-way SHA-256 hash.
**Fix:** Click **Regenerate Key** and copy the full key immediately.

### 11. Invalid Host header via curl/Invoke-WebRequest
**Error:** `The specified value is not a valid Host header string.`
**Fix:** Do not include `https://` in the Host header when testing tunnels locally. Use `Host: subdomain.localhost`.

### 12. Local tunnel URL not resolving in browser
**Error:** Browser can't find `subdomain.localhost`.
**Fix:** Add it to your OS hosts file mapped to `127.0.0.1`. (Production uses wildcard DNS, so this isn't needed there).
```
Add-Content -Path C:\Windows\System32\drivers\etc\hosts -Value '127.0.0.1 subdomain.localhost'
```
