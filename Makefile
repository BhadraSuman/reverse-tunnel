# ─────────────────────────────────────────────────────────────────
#  Makefile — Development shortcuts
#  Usage: make <target>
# ─────────────────────────────────────────────────────────────────

.PHONY: help dev build test clean cross-compile docker-up docker-down logs

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── Development ─────────────────────────────────────────────────
dev-server: ## Run the server locally (needs MongoDB running)
	go run ./cmd/server

dev-cli: ## Run the CLI locally (connect to local server)
	go run ./cmd/tunnel start --port 3000 --server ws://localhost:3001

test: ## Run all Go tests
	go test ./... -v -race

lint: ## Run Go linter
	golangci-lint run ./...

tidy: ## Tidy Go modules
	go mod tidy

# ── Build ────────────────────────────────────────────────────────
build-server: ## Build the server binary
	go build -o bin/server ./cmd/server

build-cli: ## Build the CLI binary for current platform
	go build -o bin/tunnel ./cmd/tunnel

build: build-server build-cli ## Build both binaries

# ── Cross-compile CLI for all platforms ─────────────────────────
cross-compile: ## Build CLI binaries for all platforms
	@mkdir -p dist
	GOOS=linux   GOARCH=amd64  go build -ldflags="-s -w" -o dist/tunnel-linux-amd64      ./cmd/tunnel
	GOOS=linux   GOARCH=arm64  go build -ldflags="-s -w" -o dist/tunnel-linux-arm64      ./cmd/tunnel
	GOOS=darwin  GOARCH=amd64  go build -ldflags="-s -w" -o dist/tunnel-darwin-amd64     ./cmd/tunnel
	GOOS=darwin  GOARCH=arm64  go build -ldflags="-s -w" -o dist/tunnel-darwin-arm64     ./cmd/tunnel
	GOOS=windows GOARCH=amd64  go build -ldflags="-s -w" -o dist/tunnel-windows-amd64.exe ./cmd/tunnel
	@echo "✔ Cross-compiled binaries in dist/"
	@ls -lh dist/

# ── Docker ───────────────────────────────────────────────────────
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

# ── Utilities ────────────────────────────────────────────────────
clean: ## Clean build artifacts
	rm -rf bin/ dist/
	go clean

fmt: ## Format Go code
	gofmt -w .

env: ## Copy .env.example to .env (if .env doesn't exist)
	@if [ ! -f .env ]; then cp .env.example .env && echo "✔ .env created — fill in your values"; \
	else echo "⚠ .env already exists, not overwriting"; fi
