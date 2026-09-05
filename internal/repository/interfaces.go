// Package repository defines interfaces for data access layer abstraction.
// This enables dependency injection and makes unit testing with mocks possible.
package repository

import (
	"context"

	"github.com/bhadrasuman/reverse-tunnel/internal/models"
)

// UserRepository defines the interface for user data access operations.
type UserRepository interface {
	FindByKeyHash(ctx context.Context, keyHash string) (*models.User, error)
	CreateUser(ctx context.Context, user *models.User) (*models.User, error)
	FindByGithubID(ctx context.Context, githubID string) (*models.User, error)
	UpdateUser(ctx context.Context, user *models.User) (*models.User, error)
	DeleteUser(ctx context.Context, userID string) error
}

// RequestLogRepository defines the interface for traffic capture data access operations.
type RequestLogRepository interface {
	// CreateLog asynchronously inserts a captured request/response pair.
	CreateLog(ctx context.Context, log *models.RequestLog) error

	// GetLogsBySubdomain retrieves recent captured logs for a specific tunnel subdomain.
	GetLogsBySubdomain(ctx context.Context, subdomain string, limit int) ([]*models.RequestLog, error)

	// GetLogByID retrieves a single request log by its ID (used for replay or deep inspection).
	GetLogByID(ctx context.Context, id string) (*models.RequestLog, error)
}