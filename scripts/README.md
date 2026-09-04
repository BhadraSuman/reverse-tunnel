# Development Scripts

This directory contains scripts to help with development and testing of the Reverse Tunnel project.

## Setup Scripts

### `test-setup.sh` (Linux/macOS)
Comprehensive setup script for Unix-like systems.

```bash
# Full setup with Docker
./scripts/test-setup.sh

# Skip Docker setup (use external MongoDB)
./scripts/test-setup.sh --skip-docker

# Skip running initial tests
./scripts/test-setup.sh --skip-tests

# Show help
./scripts/test-setup.sh --help
```

### `test-setup.ps1` (Windows)
PowerShell setup script for Windows systems.

```powershell
# Full setup with Docker
.\scripts\test-setup.ps1

# Skip Docker setup
.\scripts\test-setup.ps1 -SkipDocker

# Skip running initial tests  
.\scripts\test-setup.ps1 -SkipTests

# Show help
.\scripts\test-setup.ps1 -Help
```

## Development Scripts

### `dev.ps1` (Windows)
PowerShell wrapper for common development tasks.

```powershell
# Show available commands
.\scripts\dev.ps1 help

# Run tests
.\scripts\dev.ps1 test
.\scripts\dev.ps1 test-unit
.\scripts\dev.ps1 test-integration

# Start development servers
.\scripts\dev.ps1 dev-hot        # Server with hot reload
.\scripts\dev.ps1 test-watch     # Continuous testing

# Build and clean
.\scripts\dev.ps1 build
.\scripts\dev.ps1 clean
```

## What the Setup Scripts Do

1. **Check Prerequisites**
   - Go 1.21+ installation
   - Node.js 18+ installation
   - Docker (optional, for MongoDB)

2. **Environment Configuration**
   - Create `.env` from `.env.example`
   - Create `.env.test.local` from `.env.test`

3. **Install Development Tools**
   - Air (Go hot reload tool)
   - golangci-lint (code linting)
   - Dashboard npm dependencies

4. **Database Setup**
   - Start MongoDB container (if Docker available)
   - Verify database connectivity

5. **Verification**
   - Run unit tests
   - Run integration tests (if MongoDB available)
   - Verify builds work correctly

## Manual Setup (Alternative)

If you prefer manual setup or the scripts don't work in your environment:

```bash
# 1. Install Air
go install github.com/air-verse/air@latest

# 2. Create environment files
cp .env.example .env
cp .env.test .env.test.local

# 3. Install dashboard dependencies
cd dashboard && npm install && cd ..

# 4. Start MongoDB (optional)
docker compose up -d mongo

# 5. Download Go dependencies
go mod tidy && go mod download

# 6. Run tests
go test ./...

# 7. Start development
air  # Hot reload server
```

## Troubleshooting

### "Air not found"
Make sure `$(go env GOPATH)/bin` is in your PATH.

### "MongoDB connection failed"
- Ensure Docker is running: `docker compose up -d mongo`
- Or install MongoDB locally and run on port 27017

### "Dashboard dependencies failed"
- Ensure Node.js and npm are installed
- Try: `cd dashboard && npm install --force`

### "Tests failing"
- Check if MongoDB is running for integration tests
- Run unit tests only: `go test ./... -short`

## Environment Files

- `.env` - Main configuration (copy from `.env.example`)
- `.env.test.local` - Test-specific config (copy from `.env.test`)

Fill in your values in these files before running in production.