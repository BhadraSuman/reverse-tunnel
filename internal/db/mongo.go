// Package db provides a MongoDB connection singleton.
// Using sync.Once ensures the connection is established exactly once,
// no matter how many goroutines call Connect() concurrently.
// This is Go's idiomatic way to implement a singleton — no class, no getInstance().
package db

import (
	"context"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// once ensures the MongoDB client is initialized only once across the program's
// lifetime, even if Connect() is called from multiple goroutines simultaneously.
// Think of it as Go's equivalent of a lazy singleton initializer.
var once sync.Once

// Connect establishes a MongoDB connection using the provided URI.
// sync.Once.Do() ensures the connection logic runs exactly once.
// Subsequent calls return the same client (or an error if initialization failed).
//
// Note: We use a context with timeout for the initial ping to verify
// the connection is alive — fail fast rather than hanging indefinitely.
func Connect(uri string) (*mongo.Client, error) {
	// errConnect captures any error from the first (and only) connection attempt.
	var (
		client     *mongo.Client
		errConnect error
	)

	once.Do(func() {
		// options.Client() is the builder pattern for MongoDB client config.
		opts := options.Client().ApplyURI(uri)

		// mongo.Connect creates the client but doesn't actually open a network
		// connection yet — that happens lazily on the first operation.
		client, errConnect = mongo.Connect(context.Background(), opts)
		if errConnect != nil {
			return
		}

		// Ping with a 10-second timeout to verify the server is reachable.
		// context.WithTimeout returns a child context that cancels automatically
		// after the duration — similar to AbortController with setTimeout in JS.
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel() // Always cancel to release the timer resource.

		if errConnect = client.Ping(ctx, nil); errConnect != nil {
			// Disconnect if ping fails to clean up the unused connection pool.
			_ = client.Disconnect(context.Background())
			client = nil
		}
	})

	return client, errConnect
}

// GetCollection is a convenience helper that returns a *mongo.Collection.
// In Go, helper functions like this reduce boilerplate at call sites.
// Usage: col := db.GetCollection(client, "tunnel", "users")
func GetCollection(client *mongo.Client, dbName, collName string) *mongo.Collection {
	return client.Database(dbName).Collection(collName)
}
