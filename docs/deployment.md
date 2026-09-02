# Deployment Guide (GCP + Cloudflare)

This guide walks through deploying the reverse-tunnel stack (Go Server, Next.js Dashboard, MongoDB, Nginx) on a Linux VM.

## 1. Create a VM on GCP
1. **Machine Type:** e2-medium (2 vCPU, 4 GB RAM). *Note: MongoDB is memory-hungry. A 1GB instance (e2-micro) will OOM without strict cache tuning.*
2. **OS:** Ubuntu 22.04 LTS.
3. **Disk:** 30 GB balanced persistent disk.
4. **Networking:** Reserve a static External IP address.
5. **Firewall:** Check both **Allow HTTP traffic** and **Allow HTTPS traffic**.
6. **Security:** Add your SSH public key.

## 2. Cloudflare DNS Setup
Move your domain (e.g., `quickshelf.online`) to Cloudflare (Free tier) if it isn't there already.

**Add 4 DNS Records (Type A):**
All must point to your VM's Static IP and MUST be **DNS Only (Grey Cloud)**. Proxied (Orange Cloud) will break the long-lived WebSocket connections.

| Type | Name | IPv4 Address | Proxy Status |
|---|---|---|---|
| A | `@` | `YOUR_VM_IP` | DNS Only (Grey) |
| A | `*` | `YOUR_VM_IP` | DNS Only (Grey) |
| A | `dashboard` | `YOUR_VM_IP` | DNS Only (Grey) |
| A | `tunnel` | `YOUR_VM_IP` | DNS Only (Grey) |

**Create an API Token (for Certbot):**
- Profile → API Tokens → Create Token
- Template: **Edit zone DNS**
- Zone Resources: Include → Specific zone → `yourdomain.com`
- Copy the token for the setup script.

## 3. GitHub OAuth App
For dashboard authentication.
- Go to GitHub → Developer Settings → OAuth Apps → New.
- **Homepage URL:** `https://dashboard.yourdomain.com`
- **Callback URL:** `https://dashboard.yourdomain.com/api/auth/callback/github`
- Leave "Allow wildcard matching" and "Enable Device Flow" **unchecked**.
- Save the Client ID and Secret.

## 4. SSH & Deploy
```bash
ssh user@YOUR_VM_IP
git clone https://github.com/bhadrasuman/reverse-tunnel.git
cd reverse-tunnel
chmod +x scripts/setup.sh
sudo ./scripts/setup.sh
```

Provide the requested variables (Domain, CF Token, GitHub ID/Secret).
> *Note: If Ubuntu prompts to restart services (Daemons using outdated libraries), type `17` (none of the above) and press Enter.*

## 5. VM Management Commands
Run these inside `~/reverse-tunnel`:

| Command | Action |
|---|---|
| `docker compose ps` | Check status of all containers |
| `docker compose logs -f --tail=50` | Tail live logs for all services |
| `docker compose logs server --tail=20` | Server logs only |
| `docker compose restart` | Restart all services |
| `docker compose up -d --build` | Rebuild and deploy local changes |
| `git pull && docker compose up -d --build` | Deploy updates from GitHub |
| `docker compose down` | Stop everything |
