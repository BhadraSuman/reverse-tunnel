# PowerShell script for Windows test environment setup
param(
    [switch]$SkipDocker = $false,
    [switch]$SkipTests = $false,
    [switch]$Help = $false
)

function Write-Success($msg) { Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Warning($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Failure($msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red; exit 1 }

if ($Help) {
    Write-Host "Usage: .\scripts\test-setup.ps1 [-SkipDocker] [-SkipTests]"
    Write-Host "Options:"
    Write-Host "  -SkipDocker   Skip Docker setup"
    Write-Host "  -SkipTests    Skip running tests"
    Write-Host "  -Help         Show help"
    exit 0
}

Write-Host "Reverse Tunnel - Test Environment Setup" -ForegroundColor Blue
Write-Host "=======================================" -ForegroundColor Blue

# Check Go
Write-Info "Checking Go installation..."
try {
    $goVersion = go version
    Write-Success "Go found: $goVersion"
} catch {
    Write-Failure "Go not installed. Install from https://golang.org/"
}

# Check Node.js
Write-Info "Checking Node.js installation..."
try {
    $nodeVersion = node --version
    Write-Success "Node.js found: $nodeVersion"
} catch {
    Write-Failure "Node.js not installed. Install from https://nodejs.org/"
}

# Setup environment files
Write-Info "Setting up environment files..."
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Success ".env created from .env.example"
} else {
    Write-Success ".env already exists"
}

if (-not (Test-Path ".env.test.local")) {
    Copy-Item ".env.test" ".env.test.local"
    Write-Success ".env.test.local created"
} else {
    Write-Success ".env.test.local already exists"
}

# Install Air
Write-Info "Installing Air hot reload tool..."
try {
    go install github.com/air-verse/air@latest
    Write-Success "Air installed"
} catch {
    Write-Warning "Air installation failed"
}

# Install dashboard dependencies
Write-Info "Installing dashboard dependencies..."
Set-Location "dashboard"
try {
    npm install
    Write-Success "Dashboard dependencies installed"
} catch {
    Write-Failure "Failed to install dashboard dependencies"
} finally {
    Set-Location ".."
}

# Setup Docker (optional)
if (-not $SkipDocker) {
    Write-Info "Setting up MongoDB with Docker..."
    try {
        docker compose up -d mongo
        Start-Sleep -Seconds 5
        Write-Success "MongoDB container started"
    } catch {
        Write-Warning "Docker setup failed. Make sure Docker Desktop is running."
    }
}

# Download Go dependencies
Write-Info "Downloading Go dependencies..."
go mod tidy
go mod download
Write-Success "Go dependencies ready"

# Run tests
if (-not $SkipTests) {
    Write-Info "Running tests..."
    $result = go test ./... -short -cover
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Tests passed"
    } else {
        Write-Warning "Some tests failed"
    }
}

# Verify build
Write-Info "Verifying build..."
go build ./cmd/server
go build ./cmd/tunnel
if ($LASTEXITCODE -eq 0) {
    Write-Success "Build verification passed"
    Remove-Item "server.exe", "tunnel.exe" -ErrorAction SilentlyContinue
} else {
    Write-Failure "Build failed"
}

Write-Host ""
Write-Success "Setup complete!"
Write-Host "Next steps:"
Write-Host "  Run tests: .\scripts\dev.ps1 test"
Write-Host "  Start dev: .\scripts\dev.ps1 dev-hot"
Write-Host ""