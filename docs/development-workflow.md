# Development Workflow Implementation Plan

## Problem Statement

Establish a professional development workflow with comprehensive unit testing, hot reload development, and automated CI/CD pipeline to support rapid, reliable feature development.

## Requirements

- **Unit tests first approach** with mocked interfaces + integration tests against local MongoDB
- **Native Go development** with Air hot reload + Next.js dev server
- **GitHub Actions CI/CD** with automated testing and deployment 
- **Maintain current Docker production deployment** approach

## Background

- Current codebase has zero tests but clean architecture (registry, auth, models)  
- Database layer uses concrete MongoDB collections (needs interface abstraction)
- Manual deployment via setup.sh script works but lacks automation
- Good foundation with Makefile, Docker Compose, proper project structure

## Proposed Solution

Create a comprehensive testing and development workflow that supports both rapid local iteration and production reliability through automated testing and deployment.

## Task Breakdown

### Task 1: Create Database Interface Layer & Mocking Foundation

**Objectives:**
- Extract `UserRepository` interface from `auth.Authenticator` 
- Create `MockUserRepository` with testify/mock for unit tests
- Refactor auth package to accept repository interface instead of direct MongoDB collection
- Add dependency injection pattern to main.go for repository implementation
- Add testify dependencies to go.mod
- Write initial unit tests for auth.Authenticator with mocked repository

**Deliverables:**
- `internal/repository/interfaces.go` - Repository interfaces
- `internal/repository/mongo.go` - MongoDB implementations
- `internal/repository/mocks/` - Generated mocks
- `internal/auth/auth_test.go` - Unit tests with mocks
- Updated `go.mod` with testify dependencies
- Refactored `internal/auth/auth.go` to use interfaces
- Updated `cmd/server/main.go` for dependency injection

**Demo:** Auth validation works identically but now fully unit testable

### Task 2: Set Up Testing Infrastructure & Hot Reload

**Objectives:**
- Install Air for Go hot reload development 
- Create `internal/testutil` package with test helpers (mock factories, assertion helpers)
- Add test-specific MongoDB setup with separate test database
- Update Makefile with `test`, `test-watch`, `dev-hot` targets
- Create .air.toml configuration for hot reload

**Deliverables:**
- `.air.toml` - Air configuration for hot reload
- `internal/testutil/` - Test utilities and helpers
- Updated `Makefile` with new development targets
- `scripts/test-setup.sh` - Test environment setup script

**Demo:** Changes to Go files trigger automatic rebuild and test execution

### Task 3: Unit Test Coverage for Core Components

**Objectives:**
- Write comprehensive unit tests for `internal/protocol` (message parsing, validation)
- Write unit tests for `internal/registry` (thread-safety, tunnel lifecycle)  
- Write unit tests for `internal/auth` with mocked repository
- Write unit tests for `internal/proxy` server request handling logic
- Add test coverage reporting and enforcement (minimum 80% coverage)

**Deliverables:**
- `internal/protocol/messages_test.go` - Protocol message tests
- `internal/registry/registry_test.go` - Registry component tests  
- `internal/proxy/server_test.go` - Proxy server tests
- Coverage reporting in Makefile and CI
- Test coverage badge and reporting

**Demo:** `make test` shows 80%+ coverage across all core packages  

### Task 4: Integration Testing Setup

**Objectives:**
- Create integration test suite that spins up full server + MongoDB
- Write WebSocket integration tests (CLI connection, message flow)  
- Write HTTP proxy integration tests (end-to-end request flow)
- Add `make test-integration` target with local MongoDB requirement
- Create test data fixtures and cleanup helpers

**Deliverables:**
- `tests/integration/` - Integration test suite
- `tests/fixtures/` - Test data and fixtures
- `tests/integration/websocket_test.go` - WebSocket flow tests
- `tests/integration/proxy_test.go` - HTTP proxy tests
- Integration test utilities and setup

**Demo:** Entire tunnel flow (CLI connect → HTTP request → CLI response → visitor) works end-to-end

### Task 5: GitHub Actions CI/CD Pipeline

**Objectives:**
- Create `.github/workflows/ci.yml` with Go test matrix (Go 1.21, 1.22)
- Add MongoDB service container for integration tests in Actions
- Create `.github/workflows/deploy.yml` triggered on main branch pushes
- Add secrets management for deployment (server SSH key, domain config)
- Implement automated deployment to production server with health checks

**Deliverables:**
- `.github/workflows/ci.yml` - Continuous integration workflow
- `.github/workflows/deploy.yml` - Deployment workflow
- `scripts/deploy.sh` - Automated deployment script
- Documentation for required GitHub secrets
- Health check and rollback mechanisms

**Demo:** Every PR runs full test suite; main branch pushes auto-deploy

### Task 6: Enhanced Development Environment

**Objectives:**
- Add Air configuration file (.air.toml) with proper Go build settings
- Create docker-compose.dev.yml for local development with hot reload
- Add environment switching (dev/test/prod) with proper config isolation  
- Update documentation with new development workflow
- Add pre-commit hooks for tests and linting

**Deliverables:**
- `docker-compose.dev.yml` - Development environment
- `.pre-commit-config.yaml` - Pre-commit hooks configuration
- Updated `README.md` with development workflow
- `docs/development.md` - Comprehensive development guide
- Environment configuration management

**Demo:** `make dev` starts full hot-reload environment; code changes reflect instantly

## Testing Stack

- **Go's built-in `testing` package** - Standard test runner
- **Testify** (assert, mock, suite) - Rich testing capabilities
- **Mocked interfaces** - Unit tests with no database dependencies
- **Local MongoDB** - Integration tests against real database
- **Air** - Hot reload during development
- **GitHub Actions** - Automated CI/CD pipeline

## Development Commands

After implementation, the workflow will support:

```bash
# Development with hot reload
make dev-hot

# Run all tests
make test

# Run tests with coverage
make test-coverage

# Run integration tests
make test-integration

# Watch tests (re-run on changes)
make test-watch

# Build and test everything
make ci

# Start development environment
make dev-env
```

## Success Metrics

- **Test Coverage:** 80%+ across all core packages
- **Build Time:** Under 30 seconds for full test suite
- **Hot Reload:** Code changes reflected in under 3 seconds
- **CI/CD:** Full pipeline (test → build → deploy) under 5 minutes
- **Developer Experience:** Single command setup for new contributors