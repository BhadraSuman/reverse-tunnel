// Package auth handles API key validation against MongoDB.
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
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// ErrInvalidKey is a sentinel error for authentication failures.
// In Go, sentinel errors are package-level variables that callers can compare
// with errors.Is() — similar to creating a named error class in TypeScript.
var ErrInvalidKey = errors.New("invalid or missing API key")

// Authenticator holds a reference to the MongoDB users collection.
// This is Go's equivalent of a class with a constructor-injected dependency.
type Authenticator struct {
	collection *mongo.Collection
}

// New constructs an Authenticator with the given MongoDB database.
// We accept *mongo.Database and extract the collection here, so callers
// only need to pass the database — not the specific collection name.
func New(db *mongo.Database) *Authenticator {
	return &Authenticator{
		collection: db.Collection("users"),
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

// ValidateKey checks a raw API key against the database.
// It returns the matching User or ErrInvalidKey.
//
// Flow:
//  1. Strip the "Bearer " prefix if present (so both "Bearer rt_abc" and "rt_abc" work).
//  2. Hash the key.
//  3. Query MongoDB for a user with that hash.
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

	// Use a context with timeout so a slow/unreachable DB doesn't block
	// the HTTP handler goroutine indefinitely.
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// bson.M is a map type used to build MongoDB query filters.
	// Equivalent to: db.users.findOne({ apiKeyHash: hash })
	var user models.User
	err := a.collection.FindOne(ctx, bson.M{"apiKeyHash": hash}).Decode(&user)
	if err != nil {
		// mongo.ErrNoDocuments is the sentinel error for "not found".
		// errors.Is() unwraps error chains — always prefer it over == comparison.
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, ErrInvalidKey
		}
		// For other errors (network issues, etc.), wrap and return them.
		// fmt.Errorf with %w creates an error that wraps the original,
		// preserving it for errors.Is / errors.As unwrapping by callers.
		return nil, fmt.Errorf("db lookup failed: %w", err)
	}

	return &user, nil
}
