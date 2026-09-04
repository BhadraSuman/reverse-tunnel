// Package auth handles API key validation using repository abstraction.
// It hashes incoming keys with SHA-256 and compares against stored hashes —
// so raw API keys are never stored in the database.
package auth

import (
	"context"
	"crypto/sha256"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/bhadrasuman/reverse-tunnel/internal/models"
	"github.com/bhadrasuman/reverse-tunnel/internal/repository"
)

// ErrInvalidKey is a sentinel error for authentication failures.
// In Go, sentinel errors are package-level variables that callers can compare
// with errors.Is() — similar to creating a named error class in TypeScript.
var ErrInvalidKey = errors.New("invalid or missing API key")

// Authenticator handles API key validation using a repository interface.
// This allows for dependency injection and makes unit testing possible with mocks.
type Authenticator struct {
	userRepo repository.UserRepository
}

// New constructs an Authenticator with the given UserRepository.
// This enables dependency injection — callers can pass either a real MongoDB
// repository or a mock repository for testing.
func New(userRepo repository.UserRepository) *Authenticator {
	return &Authenticator{
		userRepo: userRepo,
	}
}

// HashKey computes the SHA-256 hash of a raw API key and returns it as a hex string.
// SHA-256 is deterministic: same input always produces the same output,
// so we can hash the incoming key and compare with the stored hash.
//
// crypto/sha256.Sum256 returns a [32]byte array (fixed-size, stack-allocated).
// fmt.Sprintf("%x", ...) formats each byte as two lowercase hex digits.
func HashKey(key string) string {
	sum := sha256.Sum256([]byte(key))
	return fmt.Sprintf("%x", sum)
}

// ValidateKey checks a raw API key against the repository.
// It returns the matching User or ErrInvalidKey.
//
// Flow:
//  1. Strip the "Bearer " prefix if present (so both "Bearer rt_abc" and "rt_abc" work).
//  2. Hash the key.
//  3. Query repository for a user with that hash.
//  4. Return ErrInvalidKey if not found.
func (a *Authenticator) ValidateKey(rawKey string) (*models.User, error) {
	// strings.TrimPrefix returns the string with the prefix removed,
	// or the original string if the prefix is not present.
	key := strings.TrimPrefix(rawKey, "Bearer ")
	key = strings.TrimSpace(key)

	if key == "" {
		return nil, ErrInvalidKey
	}

	hash := HashKey(key)

	// Use a context with timeout so a slow/unreachable repository doesn't block
	// the HTTP handler goroutine indefinitely.
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	user, err := a.userRepo.FindByKeyHash(ctx, hash)
	if err != nil {
		// repository.ErrUserNotFound maps to our auth-level ErrInvalidKey
		if errors.Is(err, repository.ErrUserNotFound) {
			return nil, ErrInvalidKey
		}
		// For other errors (network issues, etc.), wrap and return them.
		return nil, fmt.Errorf("user lookup failed: %w", err)
	}

	return user, nil
}
