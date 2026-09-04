// Package testutil - MongoDB testing utilities and helpers.
package testutil

import (
	"context"
	"testing"
	"time"

	"github.com/bhadrasuman/reverse-tunnel/internal/config"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// TestDBConfig holds configuration for test database connections.
type TestDBConfig struct {
	URI        string
	Database   string
	Timeout    time.Duration
}

// DefaultTestDBConfig returns the default configuration for test database.
// Uses configuration from environment variables or sensible defaults.
func DefaultTestDBConfig() *TestDBConfig {
	testConfig := config.LoadTestConfig()
	
	return &TestDBConfig{
		URI:      testConfig.MongoDB.URI,
		Database: testConfig.MongoDB.Database,
		Timeout:  testConfig.MongoDB.Timeout,
	}
}

// MongoTestHelper provides utilities for MongoDB testing.
type MongoTestHelper struct {
	Client   *mongo.Client
	Database *mongo.Database
	Config   *TestDBConfig
}

// NewMongoTestHelper creates a new MongoDB test helper.
// This connects to a test database and provides cleanup utilities.
func NewMongoTestHelper(t *testing.T, config *TestDBConfig) *MongoTestHelper {
	if config == nil {
		config = DefaultTestDBConfig()
	}

	ctx, cancel := context.WithTimeout(context.Background(), config.Timeout)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(config.URI))
	if err != nil {
		t.Skipf("MongoDB not available for integration tests: %v", err)
		return nil
	}

	// Ping to verify connection
	if err := client.Ping(ctx, nil); err != nil {
		t.Skipf("Cannot ping MongoDB for integration tests: %v", err)
		return nil
	}

	database := client.Database(config.Database)

	return &MongoTestHelper{
		Client:   client,
		Database: database,
		Config:   config,
	}
}

// Cleanup drops the test database and disconnects the client.
// Should be called with defer in test setup.
func (h *MongoTestHelper) Cleanup(t *testing.T) {
	if h.Client == nil {
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), h.Config.Timeout)
	defer cancel()

	// Drop the entire test database to ensure clean state
	if err := h.Database.Drop(ctx); err != nil {
		t.Logf("Warning: failed to drop test database: %v", err)
	}

	// Disconnect client
	if err := h.Client.Disconnect(ctx); err != nil {
		t.Logf("Warning: failed to disconnect MongoDB client: %v", err)
	}
}

// GetCollection returns a collection from the test database.
func (h *MongoTestHelper) GetCollection(name string) *mongo.Collection {
	return h.Database.Collection(name)
}

// CreateIndexes creates common indexes for testing.
// This mirrors the production indexes but in the test database.
func (h *MongoTestHelper) CreateIndexes(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), h.Config.Timeout)
	defer cancel()

	usersCollection := h.GetCollection("users")

	// Create indexes that mirror production
	indexes := []mongo.IndexModel{
		{
			Keys: map[string]int{"githubId": 1},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys: map[string]int{"apiKeyHash": 1},
		},
	}

	_, err := usersCollection.Indexes().CreateMany(ctx, indexes)
	if err != nil {
		t.Fatalf("Failed to create test indexes: %v", err)
	}
}

// InsertTestUser inserts a test user into the database and returns the inserted user.
func (h *MongoTestHelper) InsertTestUser(t *testing.T, user interface{}) *mongo.InsertOneResult {
	ctx, cancel := CreateTestContext()
	defer cancel()

	collection := h.GetCollection("users")
	result, err := collection.InsertOne(ctx, user)
	if err != nil {
		t.Fatalf("Failed to insert test user: %v", err)
	}

	return result
}

// CountDocuments counts documents in a collection with optional filter.
func (h *MongoTestHelper) CountDocuments(t *testing.T, collectionName string, filter interface{}) int64 {
	ctx, cancel := CreateTestContext()
	defer cancel()

	collection := h.GetCollection(collectionName)
	count, err := collection.CountDocuments(ctx, filter)
	if err != nil {
		t.Fatalf("Failed to count documents: %v", err)
	}

	return count
}

// IsMongoAvailable checks if MongoDB is available for testing.
// Returns true if MongoDB can be reached, false otherwise.
func IsMongoAvailable() bool {
	config := DefaultTestDBConfig()
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(config.URI))
	if err != nil {
		return false
	}
	defer client.Disconnect(ctx)

	return client.Ping(ctx, nil) == nil
}

// SkipIfMongoUnavailable skips the test if MongoDB is not available.
// Use this in integration tests that require MongoDB.
func SkipIfMongoUnavailable(t *testing.T) {
	if !IsMongoAvailable() {
		t.Skip("Skipping test: MongoDB not available")
	}
}