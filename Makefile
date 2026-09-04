# ─────────────────────────────────────────────────────────────────
#  Makefile — Development shortcuts for Reverse Tunnel
#  Usage: make <target>
# ─────────────────────────────────────────────────────────────────

.PHONY: help dev build test clean cross-compile docker-up docker-down logs

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── Testing ───────────────────────────────────────────────────────
test: ## Run all tests with coverage
	go test ./... -cover

test-verbose: ## Run all tests with verbose output
	go test ./... -v -cover

test-unit: ## Run only unit tests (exclude integration tests)
	go test ./... -cover -short

test-integration: ## Run integration tests with MongoDB
	@echo "Running integration tests (requires MongoDB)..."
	go test ./internal/repository -v -cover -run Integration

test-auth: ## Run auth package tests only
	go test ./internal/auth -v -cover

test-repo: ## Run repository tests (includes integration tests)
	go test ./internal/repository -v -cover

test-coverage: ## Run tests and generate coverage report
	go test ./... -coverprofile=coverage.out
	go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html"

test-bench: ## Run benchmark tests
	go test ./... -bench=. -benchmem

test-watch: ## Watch for changes and run tests continuously
	air -c .air.test.toml

test-ci: ## Run tests in CI mode (with race detection)
	go test ./... -v -race -cover

# ── Hot Reload Development ──────────────────────────────────────────
dev-hot: ## Start server with hot reload (Air)
	air

dev-tunnel: ## Start tunnel CLI with hot reload (Air)  
	air -c .air.tunnel.toml

dev-dashboard: ## Start Next.js dashboard in development mode
	cd dashboard && npm run dev

dev-full: ## Start full development stack (server + dashboard)
	@echo "Starting development servers..."
	@echo "Server (hot reload): http://localhost:3001"
	@echo "Dashboard: http://localhost:3000" 
	@$(MAKE) -j2 dev-hot dev-dashboard

# ── Traditional Development ─────────────────────────────────────────
dev-server: ## Run the server locally (no hot reload)
	go run ./cmd/server

dev-cli: ## Run the CLI locally (connect to local server)
	go run ./cmd/tunnel start --port 3000 --server ws://localhost:3001

# ── Development Environment Setup ───────────────────────────────────
dev-env: ## Set up development environment files
	@echo "Setting up development environment..."
	@if [ ! -f .env ]; then cp .env.example .env && echo "✔ .env created from .env.example"; fi
	@if [ ! -f .env.test.local ]; then cp .env.test .env.test.local && echo "✔ .env.test.local created"; fi
	@echo "✔ Development environment ready"
	@echo "Next: Fill in your values in .env and .env.test.local"

dev-deps: ## Install development dependencies
	@echo "Installing Go development tools..."
	go install github.com/air-verse/air@latest
	@echo "Installing dashboard dependencies..."
	cd dashboard && npm install
	@echo "✔ All development dependencies installed"

# ── Code Quality ────────────────────────────────────────────────────
lint: ## Run Go linter
	golangci-lint run ./...

fmt: ## Format Go code
	gofmt -w .

tidy: ## Tidy Go modules
	go mod tidy

# ── Build ───────────────────────────────────────────────────────────
build-server: ## Build the server binary
	go build -o bin/server ./cmd/server

build-cli: ## Build the CLI binary for current platform
	go build -o bin/tunnel ./cmd/tunnel

build: build-server build-cli ## Build both binaries

# ── Cross-compile CLI for all platforms ─────────────────────────────
cross-compile: ## Build CLI binaries for all platforms
	@mkdir -p dist
	GOOS=linux   GOARCH=amd64  go build -ldflags="-s -w" -o dist/tunnel-linux-amd64      ./cmd/tunnel
	GOOS=linux   GOARCH=arm64  go build -ldflags="-s -w" -o dist/tunnel-linux-arm64      ./cmd/tunnel
	GOOS=darwin  GOARCH=amd64  go build -ldflags="-s -w" -o dist/tunnel-darwin-amd64     ./cmd/tunnel
	GOOS=darwin  GOARCH=arm64  go build -ldflags="-s -w" -o dist/tunnel-darwin-arm64     ./cmd/tunnel
	GOOS=windows GOARCH=amd64  go build -ldflags="-s -w" -o dist/tunnel-windows-amd64.exe ./cmd/tunnel
	@echo "✔ Cross-compiled binaries in dist/"
	@ls -lh dist/

# ── Docker ───────────────────────────────────────────────────────────
docker-up: ## Start all services with Docker Compose
	docker compose up -d --build

docker-down: ## Stop all services
	docker compose down

docker-restart: ## Restart all services
	docker compose restart

logs: ## Tail logs from all services
	docker compose logs -f --tail=50

logs-server: ## Tail server logs only
	docker compose logs -f server --tail=100

logs-dashboard: ## Tail dashboard logs only
	docker compose logs -f dashboard --tail=100

# ── Utilities ────────────────────────────────────────────────────────
clean: ## Clean build artifacts and test files
	rm -rf bin/ dist/ coverage.out coverage.html tmp/
	go clean

env: ## Copy .env.example to .env (if .env doesn't exist)
	@if [ ! -f .env ]; then cp .env.example .env && echo "✔ .env created — fill in your values"; \
	else echo "⚠ .env already exists, not overwriting"; fi

# ── All-in-One Commands ─────────────────────────────────────────────
setup: dev-env dev-deps ## Complete development setup
	@echo "✔ Development environment fully set up!"
	@echo "Next steps:"
	@echo "  1. Fill in .env and .env.test.local with your values"
	@echo "  2. Start MongoDB: docker compose up -d mongo"
	@echo "  3. Run tests: make test"
	@echo "  4. Start development: make dev-hot"

ci: test-ci lint ## Run all CI checks (tests + linting)
	@echo "✔ All CI checks passed!"