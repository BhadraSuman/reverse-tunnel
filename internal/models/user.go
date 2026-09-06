// Package models defines the data structures that map to MongoDB documents.
// Think of these as your Mongoose schemas / TypeScript interfaces for DB records.
package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// User represents a registered user stored in MongoDB.
//
// Go struct tags here serve double duty:
//   - `bson:"..."` controls how MongoDB driver serializes to/from BSON
//   - `json:"..."` controls how encoding/json serializes to/from JSON
//
// The `json:"-"` tag on APIKeyHash means it will NEVER appear in JSON output,
// even if you marshal the struct directly — great for security.
type User struct {
	// ID is MongoDB's _id field. primitive.ObjectID is a 12-byte BSON type.
	// `omitempty` means Go won't include the field if it's a zero-value ObjectID
	// (avoids sending null _id on insert, letting MongoDB auto-generate it).
	ID primitive.ObjectID `bson:"_id,omitempty" json:"id"`

	// GithubID stores the GitHub OAuth user ID as a string.
	GithubID string `bson:"githubId" json:"githubId"`

	// Email is the user's email from GitHub OAuth.
	Email string `bson:"email" json:"email"`

	// Name is the user's display name.
	Name string `bson:"name" json:"name"`

	// Username is the user's GitHub handle (e.g. "bhadrasuman").
	Username string `bson:"username,omitempty" json:"username,omitempty"`

	// Subdomain is the user's base isolated subdomain namespace.
	Subdomain string `bson:"subdomain,omitempty" json:"subdomain,omitempty"`

	// AvatarURL is the GitHub profile picture URL.
	AvatarURL string `bson:"avatarUrl" json:"avatarUrl"`

	// APIKeyHash is the SHA-256 hash of the raw API key.
	// We never store the raw key — only the hash (like bcrypt for passwords,
	// but SHA-256 is sufficient for high-entropy random API keys).
	// `json:"-"` ensures this field is never leaked in API responses.
	APIKeyHash string `bson:"apiKeyHash" json:"-"`

	// APIKeyPrefix is the first 8 chars of the raw key (e.g. "rt_abc123").
	// We show this to the user so they can identify which key they're using
	// without revealing the full secret.
	APIKeyPrefix string `bson:"apiKeyPrefix" json:"apiKeyPrefix"`

	// MaxTunnels is the maximum number of simultaneous tunnels this user can open.
	// This acts as a rate-limiting / tier control mechanism.
	MaxTunnels int `bson:"maxTunnels" json:"maxTunnels"`

	// CreatedAt is the account creation timestamp.
	// time.Time is automatically handled by the MongoDB driver.
	CreatedAt time.Time `bson:"createdAt" json:"createdAt"`
}
