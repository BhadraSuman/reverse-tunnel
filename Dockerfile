# ============================================================
# Stage 1: Build
# ============================================================
# We use the official Go Alpine image as the builder.
# Alpine is a minimal Linux distro (~5MB) — much smaller than the default Debian.
# "AS builder" names this stage so Stage 2 can copy from it.
FROM golang:1.26-alpine AS builder

WORKDIR /app

# Copy go.mod and go.sum first, then download dependencies.
# Docker builds layers incrementally — if go.mod/go.sum haven't changed,
# Docker reuses the cached layer and skips `go mod download`.
# This makes rebuilds much faster when only source files change.
COPY go.mod go.sum ./
RUN go mod download

# Copy all source files and build.
COPY . .

# Build flags explained:
#   CGO_ENABLED=0  — disable C bindings (makes the binary fully static, no .so deps)
#   GOOS=linux     — cross-compile for Linux (even if building on macOS/Windows)
#   -ldflags="-s -w" — strip debug info and DWARF tables (reduces binary size ~30%)
#   -o server      — output binary name
#   ./cmd/server   — the package to build (can also use the full module path)
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o server ./cmd/server

# ============================================================
# Stage 2: Runtime
# ============================================================
# We start fresh from a minimal Alpine image — the final image contains
# ONLY what's needed to run the binary, not the Go toolchain (~300MB savings).
FROM alpine:3.20

# ca-certificates — needed for TLS connections (HTTPS, MongoDB Atlas, etc.)
# tzdata — timezone data for time.LoadLocation() if needed
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

# Copy only the compiled binary from the builder stage.
# The Go binary is statically linked — no runtime dependencies needed.
COPY --from=builder /app/server .

# Expose the three ports this server listens on:
# 3001 — WebSocket control server (CLI clients)
# 3002 — Internal HTTP API (health, metrics)
# 4000 — HTTP proxy server (Nginx-forwarded traffic)
EXPOSE 3001 3002 4000

CMD ["./server"]
