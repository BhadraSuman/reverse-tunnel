// Package testutil - Mock data factories for consistent test data generation.
package testutil

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/bhadrasuman/reverse-tunnel/internal/models"
	"github.com/bhadrasuman/reverse-tunnel/internal/protocol"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// UserFactory provides methods to create test User instances with realistic data.
type UserFactory struct{}

// NewUserFactory creates a new UserFactory instance.
func NewUserFactory() *UserFactory {
	return &UserFactory{}
}

// CreateUser creates a basic test user with default values.
func (f *UserFactory) CreateUser() *models.User {
	return &models.User{
		ID:           primitive.NewObjectID(),
		GithubID:     "123456",
		Email:        "test@example.com",
		Name:         "Test User",
		AvatarURL:    "https://github.com/avatar.jpg",
		APIKeyHash:   "test_hash_123",
		APIKeyPrefix: "rt_test123",
		MaxTunnels:   5,
		CreatedAt:    time.Now(),
	}
}

// WithGithubID sets a custom GitHub ID for the user.
func (f *UserFactory) WithGithubID(githubID string) *models.User {
	user := f.CreateUser()
	user.GithubID = githubID
	return user
}

// WithEmail sets a custom email for the user.
func (f *UserFactory) WithEmail(email string) *models.User {
	user := f.CreateUser()
	user.Email = email
	return user
}

// WithMaxTunnels sets a custom tunnel limit for the user.
func (f *UserFactory) WithMaxTunnels(maxTunnels int) *models.User {
	user := f.CreateUser()
	user.MaxTunnels = maxTunnels
	return user
}

// WithAPIKey sets a custom API key hash and prefix.
func (f *UserFactory) WithAPIKey(keyHash, keyPrefix string) *models.User {
	user := f.CreateUser()
	user.APIKeyHash = keyHash
	user.APIKeyPrefix = keyPrefix
	return user
}

// CreatePremiumUser creates a user with higher tunnel limits.
func (f *UserFactory) CreatePremiumUser() *models.User {
	user := f.CreateUser()
	user.MaxTunnels = 20
	user.Email = "premium@example.com"
	user.Name = "Premium User"
	return user
}

// FrameFactory provides methods to create test protocol.Frame instances.
type FrameFactory struct{}

// NewFrameFactory creates a new FrameFactory instance.
func NewFrameFactory() *FrameFactory {
	return &FrameFactory{}
}

// CreateConnectedFrame creates a TypeConnected frame for testing.
func (f *FrameFactory) CreateConnectedFrame(subdomain string) protocol.Frame {
	return protocol.Frame{
		Type:      protocol.TypeConnected,
		Subdomain: subdomain,
		Message:   "tunnel established",
	}
}

// CreateRequestFrame creates a TypeRequest frame with realistic HTTP data.
func (f *FrameFactory) CreateRequestFrame(channelID string) protocol.Frame {
	return protocol.Frame{
		Type:      protocol.TypeRequest,
		ChannelID: channelID,
		Method:    "GET",
		Path:      "/api/test",
		Headers: map[string]string{
			"Host":       "test.example.com",
			"User-Agent": "Test-Client/1.0",
			"Accept":     "application/json",
		},
		Body: "", // GET request typically has no body
	}
}

// CreateResponseFrame creates a TypeResponse frame with realistic HTTP response data.
func (f *FrameFactory) CreateResponseFrame(channelID string, status int, body string) protocol.Frame {
	return protocol.Frame{
		Type:      protocol.TypeResponse,
		ChannelID: channelID,
		Status:    status,
		Headers: map[string]string{
			"Content-Type":   "application/json",
			"Content-Length": fmt.Sprintf("%d", len(body)),
			"Server":         "Test-Server/1.0",
		},
		Body: body,
	}
}

// CreatePostRequestFrame creates a TypeRequest frame with POST data.
func (f *FrameFactory) CreatePostRequestFrame(channelID, jsonBody string) protocol.Frame {
	return protocol.Frame{
		Type:      protocol.TypeRequest,
		ChannelID: channelID,
		Method:    "POST",
		Path:      "/api/create",
		Headers: map[string]string{
			"Host":           "test.example.com",
			"Content-Type":   "application/json",
			"Content-Length": fmt.Sprintf("%d", len(jsonBody)),
		},
		Body: jsonBody,
	}
}

// CreateErrorFrame creates a TypeError frame for testing error conditions.
func (f *FrameFactory) CreateErrorFrame(message string) protocol.Frame {
	return protocol.Frame{
		Type:    protocol.TypeError,
		Message: message,
	}
}

// CreatePingFrame creates a TypePing frame for keepalive testing.
func (f *FrameFactory) CreatePingFrame() protocol.Frame {
	return protocol.Frame{
		Type: protocol.TypePing,
	}
}

// CreatePongFrame creates a TypePong frame for keepalive testing.
func (f *FrameFactory) CreatePongFrame() protocol.Frame {
	return protocol.Frame{
		Type: protocol.TypePong,
	}
}

// GenerateRandomString generates a random string of specified length for testing.
// Useful for creating random subdomains, channel IDs, etc.
func GenerateRandomString(length int) string {
	bytes := make([]byte, length/2)
	if _, err := rand.Read(bytes); err != nil {
		panic(fmt.Sprintf("failed to generate random string: %v", err))
	}
	return hex.EncodeToString(bytes)[:length]
}

// GenerateChannelID generates a realistic channel ID for testing.
func GenerateChannelID() string {
	return GenerateRandomString(20)
}

// GenerateSubdomain generates a realistic subdomain for testing.
func GenerateSubdomain() string {
	adjectives := []string{"brave", "swift", "clever", "mighty", "gentle"}
	animals := []string{"wolf", "eagle", "tiger", "dolphin", "falcon"}
	
	adj := adjectives[time.Now().UnixNano()%int64(len(adjectives))]
	animal := animals[time.Now().UnixNano()%int64(len(animals))]
	number := time.Now().UnixNano() % 100
	
	return fmt.Sprintf("%s-%s-%d", adj, animal, number)
}