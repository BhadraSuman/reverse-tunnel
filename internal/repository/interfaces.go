// Package repository defines interfaces for data access layer abstraction.
// This enables dependency injection and makes unit testing with mocks possible.
package repository

import (
	"context"

	"github.com/bhadrasuman/reverse-tunnel/internal/models"
)

// UserRepository defines the interface for user data access operations.
// This abstraction allows us to swap between MongoDB implementation and
// mocked implementations for testing without changing business logic.
type UserRepository interface {
	// FindByKeyHash retrieves a user by their API key hash.
	// Returns the user if found, or an error if not found or on database failure.
	// This maps directly to the MongoDB query: { "apiKeyHash": hash }
	FindByKeyHash(ctx context.Context, keyHash string) (*models.User, error)

	// CreateUser creates a new user record in the database.
	// Returns the created user with populated ID, or an error on failure.
	CreateUser(ctx context.Context, user *models.User) (*models.User, error)

	// FindByGithubID retrieves a user by their GitHub OAuth ID.
	// Used during OAuth login flow to find existing accounts.
	FindByGithubID(ctx context.Context, githubID string) (*models.User, error)

	// UpdateUser updates an existing user record.
	// Returns the updated user or an error on failure.
	UpdateUser(ctx context.Context, user *models.User) (*models.User, error)

	// DeleteUser removes a user from the database.
	// Returns an error if the user doesn't exist or on database failure.
	DeleteUser(ctx context.Context, userID string) error
}