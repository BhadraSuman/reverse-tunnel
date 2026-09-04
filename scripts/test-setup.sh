#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
#  test-setup.sh — Automated test environment setup for Reverse Tunnel
#
#  This script sets up everything needed for development and testing:
#    1. Checks prerequisites (Go, Node.js, Docker)
#    2. Creates environment files
#    3. Installs development dependencies
#    4. Sets up test database
#    5. Runs initial tests to verify setup
#
#  Usage: ./scripts/test-setup.sh [--skip-docker] [--skip-tests]
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail  # Exit on error, unset vars, pipe failures

# ── Colors and utilities ─────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log()  { echo -e "${GREEN}[✔]${NC} $1"; }
info() { echo -e "${BLUE}[→]${NC} $1"; }
warn() { echo -e "${YELLOW}[⚠]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# ── Parse command line arguments ─────────────────────────────────────────────
SKIP_DOCKER=false
SKIP_TESTS=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-docker)
      SKIP_DOCKER=true
      shift
      ;;
    --skip-tests)
      SKIP_TESTS=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [--skip-docker] [--skip-tests]"
      echo ""
      echo "Options:"
      echo "  --skip-docker   Skip Docker-based services setup"
      echo "  --skip-tests    Skip running initial tests"
      echo "  --help          Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# ── Header ───────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║          Reverse Tunnel — Test Environment Setup     ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ── Step 1: Check prerequisites ──────────────────────────────────────────────
info "Checking prerequisites..."

# Check Go
if ! command -v go &> /dev/null; then
    err "Go is not installed. Please install Go 1.21+ from https://golang.org/dl/"
fi
GO_VERSION=$(go version | grep -o 'go[0-9]\+\.[0-9]\+' | head -1)
log "Go detected: $GO_VERSION"

# Check Node.js
if ! command -v node &> /dev/null; then
    err "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
fi
NODE_VERSION=$(node --version)
log "Node.js detected: $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    err "npm is not installed. Please install npm (usually comes with Node.js)"
fi

# Check Docker (optional)
if ! $SKIP_DOCKER; then
    if ! command -v docker &> /dev/null; then
        warn "Docker not found. Will skip Docker-based services."
        warn "Install Docker from https://www.docker.com/get-started to run MongoDB locally."
        SKIP_DOCKER=true
    else
        log "Docker detected: $(docker --version)"
    fi
fi

# ── Step 2: Create environment files ─────────────────────────────────────────
info "Setting up environment files..."

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    log ".env created from .env.example"
    warn "Please fill in your values in .env before proceeding with deployment"
else
    log ".env already exists"
fi

# Create .env.test.local if it doesn't exist
if [ ! -f .env.test.local ]; then
    cp .env.test .env.test.local
    log ".env.test.local created from .env.test"
    info "Test environment configured for local MongoDB on port 27017"
else
    log ".env.test.local already exists"
fi

# ── Step 3: Install Go development dependencies ──────────────────────────────
info "Installing Go development tools..."

# Install Air for hot reload
if ! command -v air &> /dev/null; then
    info "Installing Air (hot reload tool)..."
    go install github.com/air-verse/air@latest
    log "Air installed successfully"
else
    log "Air already installed: $(air -v 2>&1 | head -1)"
fi

# Install golangci-lint if available (optional)
if ! command -v golangci-lint &> /dev/null; then
    info "Installing golangci-lint..."
    curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $(go env GOPATH)/bin v1.54.2
    if command -v golangci-lint &> /dev/null; then
        log "golangci-lint installed successfully"
    else
        warn "golangci-lint installation failed (optional dependency)"
    fi
else
    log "golangci-lint already available"
fi

# ── Step 4: Install dashboard dependencies ───────────────────────────────────
info "Installing dashboard dependencies..."
cd dashboard
npm install
log "Dashboard dependencies installed"
cd ..

# ── Step 5: Set up test database (Docker) ────────────────────────────────────
if ! $SKIP_DOCKER; then
    info "Setting up test database with Docker..."
    
    # Start MongoDB for testing
    if docker compose ps mongo | grep -q "Up"; then
        log "MongoDB container already running"
    else
        info "Starting MongoDB container..."
        docker compose up -d mongo
        
        # Wait for MongoDB to be ready
        info "Waiting for MongoDB to be ready..."
        sleep 10
        
        # Test connection
        if docker compose exec mongo mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
            log "MongoDB is ready and responding"
        else
            warn "MongoDB may not be fully ready yet. Tests might fail initially."
        fi
    fi
else
    warn "Skipping Docker setup. Make sure MongoDB is running on localhost:27017 for integration tests."
fi

# ── Step 6: Download Go module dependencies ──────────────────────────────────
info "Downloading Go dependencies..."
go mod tidy
go mod download
log "Go dependencies ready"

# ── Step 7: Run initial tests ────────────────────────────────────────────────
if ! $SKIP_TESTS; then
    info "Running initial tests to verify setup..."
    
    # Run unit tests first
    info "Running unit tests..."
    if go test ./... -short -cover; then
        log "Unit tests passed"
    else
        err "Unit tests failed. Please check your setup."
    fi
    
    # Run integration tests if MongoDB is available
    if ! $SKIP_DOCKER || command -v mongosh &> /dev/null; then
        info "Running integration tests..."
        if go test ./internal/repository -v -run Integration; then
            log "Integration tests passed"
        else
            warn "Integration tests failed. MongoDB might not be available."
            warn "This is OK for unit testing, but integration tests require MongoDB."
        fi
    else
        warn "Skipping integration tests (MongoDB not available)"
    fi
else
    info "Skipping initial tests (--skip-tests flag provided)"
fi

# ── Step 8: Verify build ─────────────────────────────────────────────────────
info "Verifying build configuration..."
if go build ./cmd/server && go build ./cmd/tunnel; then
    log "Build verification passed"
    rm -f server tunnel  # Clean up test binaries
else
    err "Build failed. Please check for compilation errors."
fi

# ── Success summary ──────────────────────────────────────────────────────────
echo ""
log "Test environment setup complete!"
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    Setup Summary                              ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  ✔ Go development tools installed                            ║"
echo "║  ✔ Dashboard dependencies ready                              ║"
echo "║  ✔ Environment files configured                              ║"
if ! $SKIP_DOCKER; then
echo "║  ✔ MongoDB test database running                             ║"
fi
if ! $SKIP_TESTS; then
echo "║  ✔ Tests verified and passing                                ║"
fi
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  Next steps:                                                 ║"
echo "║                                                              ║"
echo "║  # Run tests                                                 ║"
echo "║  make test                    (or: go test ./...)             ║"
echo "║                                                              ║"
echo "║  # Start development with hot reload                         ║"
echo "║  make dev-hot                 (or: air)                      ║"
echo "║                                                              ║"
echo "║  # Start dashboard development                               ║"
echo "║  make dev-dashboard           (or: cd dashboard && npm run dev) ║"
echo "║                                                              ║"
echo "║  # Run test watcher                                          ║"
echo "║  make test-watch              (or: air -c .air.test.toml)    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ── Additional setup hints ───────────────────────────────────────────────────
if [ -f .env ]; then
    if grep -q "yourdomain.com" .env 2>/dev/null; then
        echo ""
        warn "Don't forget to update .env with your actual domain and API keys!"
    fi
fi