# PowerShell script for Windows development shortcuts
param([string]$Command = "help")

switch ($Command) {
    "help" {
        Write-Host "Available commands:" -ForegroundColor Green
        Write-Host "  test          - Run all tests with coverage"
        Write-Host "  test-unit     - Run unit tests only"
        Write-Host "  test-integration - Run integration tests"
        Write-Host "  test-watch    - Watch for changes and run tests"
        Write-Host "  dev-hot       - Start server with hot reload"
        Write-Host "  build         - Build both server and CLI"
        Write-Host "  clean         - Clean build artifacts"
    }
    "test" {
        Write-Host "Running all tests with coverage..." -ForegroundColor Blue
        go test ./... -cover
    }
    "test-unit" {
        Write-Host "Running unit tests..." -ForegroundColor Blue
        go test ./... -cover -short
    }
    "test-integration" {
        Write-Host "Running integration tests..." -ForegroundColor Blue
        go test ./internal/repository -v -cover -run Integration
    }
    "test-watch" {
        Write-Host "Starting test watcher..." -ForegroundColor Blue
        air -c .air.test.toml
    }
    "dev-hot" {
        Write-Host "Starting server with hot reload..." -ForegroundColor Blue
        air
    }
    "build" {
        Write-Host "Building binaries..." -ForegroundColor Blue
        go build -o bin/server ./cmd/server
        go build -o bin/tunnel ./cmd/tunnel
        Write-Host "Build complete!" -ForegroundColor Green
    }
    "clean" {
        Write-Host "Cleaning build artifacts..." -ForegroundColor Blue
        Remove-Item -Path "bin", "dist", "coverage.out", "coverage.html" -Recurse -Force -ErrorAction SilentlyContinue
        go clean
        Write-Host "Clean complete!" -ForegroundColor Green
    }
    default {
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Write-Host "Use 'help' to see available commands."
    }
}