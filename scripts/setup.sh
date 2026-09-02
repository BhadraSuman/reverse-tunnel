#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  setup.sh — One-command server bootstrap for Reverse Tunnel
#
#  Run this script ONCE on your freshly provisioned server (Ubuntu 22.04+):
#    chmod +x scripts/setup.sh
#    sudo ./scripts/setup.sh
#
#  What this does:
#    1. Installs Docker + Docker Compose
#    2. Installs Certbot + Cloudflare DNS plugin
#    3. Obtains a wildcard SSL certificate for your domain
#    4. Configures Nginx with your domain
#    5. Sets up the .env file
#    6. Starts all services with Docker Compose
#    7. Sets up automatic cert renewal
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail  # exit on error, unset vars, pipe failures

# ── Colors ───────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log()  { echo -e "${GREEN}[✔]${NC} $1"; }
info() { echo -e "${BLUE}[→]${NC} $1"; }
warn() { echo -e "${YELLOW}[⚠]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# ── Check root ────────────────────────────────────────────────────────────────
if [[ $EUID -ne 0 ]]; then
    err "This script must be run as root. Use: sudo ./scripts/setup.sh"
fi

# ── Collect inputs ────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║          Reverse Tunnel — Server Setup               ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

read -rp "Enter your domain (e.g., mytunnel.dev): " DOMAIN
[[ -z "$DOMAIN" ]] && err "Domain cannot be empty"

read -rp "Enter your Cloudflare API Token: " CF_TOKEN
[[ -z "$CF_TOKEN" ]] && err "Cloudflare API token cannot be empty"

read -rp "Enter your GitHub OAuth Client ID: " GH_CLIENT_ID
read -rp "Enter your GitHub OAuth Client Secret: " GH_CLIENT_SECRET

# Generate a random NextAuth secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)

echo ""
info "Setting up tunnel.${DOMAIN} and dashboard.${DOMAIN}"
echo ""

# ── Step 1: Update system ─────────────────────────────────────────────────────
info "Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq
log "System updated"

# ── Step 2: Install Docker ────────────────────────────────────────────────────
if ! command -v docker &> /dev/null; then
    info "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    log "Docker installed"
else
    log "Docker already installed ($(docker --version))"
fi

# ── Step 3: Install Nginx ─────────────────────────────────────────────────────
if ! command -v nginx &> /dev/null; then
    info "Installing Nginx..."
    apt-get install -y -qq nginx
    systemctl enable nginx
    log "Nginx installed"
else
    log "Nginx already installed"
fi

# ── Step 4: Install Certbot + Cloudflare plugin ───────────────────────────────
if ! command -v certbot &> /dev/null; then
    info "Installing Certbot with Cloudflare plugin..."
    apt-get install -y -qq python3 python3-pip python3-venv
    python3 -m venv /opt/certbot
    /opt/certbot/bin/pip install --quiet certbot certbot-nginx certbot-dns-cloudflare
    ln -sf /opt/certbot/bin/certbot /usr/local/bin/certbot
    log "Certbot installed"
else
    log "Certbot already installed"
fi

# ── Step 5: Configure Cloudflare credentials ─────────────────────────────────
info "Setting up Cloudflare credentials..."
mkdir -p /etc/cloudflare
cat > /etc/cloudflare/credentials.ini << EOF
dns_cloudflare_api_token = ${CF_TOKEN}
EOF
chmod 600 /etc/cloudflare/credentials.ini
log "Cloudflare credentials saved"

# ── Step 6: Obtain wildcard SSL certificate ───────────────────────────────────
info "Requesting wildcard SSL certificate for *.${DOMAIN}..."
info "This may take 1-2 minutes (DNS propagation check)..."

certbot certonly \
    --dns-cloudflare \
    --dns-cloudflare-credentials /etc/cloudflare/credentials.ini \
    --dns-cloudflare-propagation-seconds 30 \
    -d "${DOMAIN}" \
    -d "*.${DOMAIN}" \
    --non-interactive \
    --agree-tos \
    --email "admin@${DOMAIN}" \
    --quiet

log "SSL certificate obtained for *.${DOMAIN}"

# ── Step 7: Configure Nginx ───────────────────────────────────────────────────
info "Configuring Nginx..."

# Substitute domain in config
sed "s/yourdomain.com/${DOMAIN}/g" "$(dirname "$0")/../nginx/tunnel.conf" \
    > "/etc/nginx/sites-available/tunnel.conf"

# Enable site
ln -sf /etc/nginx/sites-available/tunnel.conf /etc/nginx/sites-enabled/tunnel.conf

# Remove default site if present
rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
nginx -t
systemctl reload nginx
log "Nginx configured and reloaded"

# ── Step 8: Set up .env ───────────────────────────────────────────────────────
info "Creating .env file..."

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cat > "${PROJECT_DIR}/.env" << EOF
DOMAIN=${DOMAIN}
MONGODB_URI=mongodb://mongo:27017/tunnel
PORT_CONTROL=3001
PORT_PROXY=4000
PORT_API=3002
LOG_LEVEL=info
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXTAUTH_URL=https://dashboard.${DOMAIN}
GITHUB_CLIENT_ID=${GH_CLIENT_ID}
GITHUB_CLIENT_SECRET=${GH_CLIENT_SECRET}
CLOUDFLARE_API_TOKEN=${CF_TOKEN}
EOF

log ".env file created"

# ── Step 9: Set up automatic cert renewal ─────────────────────────────────────
info "Setting up automatic SSL cert renewal..."

cat > /etc/cron.d/certbot-renewal << EOF
# Renew certificates twice daily (Certbot only renews if expiry < 30 days)
0 0,12 * * * root /opt/certbot/bin/certbot renew --quiet --post-hook "systemctl reload nginx"
EOF

log "Auto-renewal cron job created"

# ── Step 10: Start services ───────────────────────────────────────────────────
info "Starting all services with Docker Compose..."
cd "${PROJECT_DIR}"
docker compose up -d --build

# Wait for services to be healthy
info "Waiting for services to start..."
sleep 10

# Check service status
docker compose ps

log "All services started"

# ── Step 11: Create MongoDB indexes ──────────────────────────────────────────
info "Creating MongoDB indexes..."
docker compose exec -T mongo mongosh tunnel --eval "
    db.users.createIndex({ githubId: 1 }, { unique: true });
    db.users.createIndex({ apiKeyHash: 1 });
    print('Indexes created');
" 2>/dev/null || warn "Could not create indexes (MongoDB may still be starting — run manually later)"

# ── Done! ─────────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    Setup Complete! 🎉                        ║"
echo "╠══════════════════════════════════════════════════════════════╣"
printf "║  Dashboard:  https://dashboard.%-29s ║\n" "${DOMAIN}"
printf "║  Control WS: wss://tunnel.%-33s ║\n" "${DOMAIN}"
printf "║  Tunnels:    https://<subdomain>.%-26s ║\n" "${DOMAIN}"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  Next steps:                                                 ║"
echo "║  1. Login at the dashboard with GitHub                       ║"
echo "║  2. Copy your API key from the dashboard                     ║"
echo "║  3. Run on your machine:                                      ║"
echo "║     go install github.com/bhadrasuman/reverse-tunnel/...     ║"
echo "║     tunnel start --port 3000                                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
