package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/bhadrasuman/reverse-tunnel/internal/auth"
	"github.com/bhadrasuman/reverse-tunnel/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	uri := "mongodb://localhost:27017/tunnel"
	if envURI := os.Getenv("MONGODB_URI"); envURI != "" {
		uri = envURI
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	defer client.Disconnect(ctx)

	collection := client.Database("tunnel").Collection("users")

	rawKey := "tk_test_12345"
	hashedKey := auth.HashKey(rawKey)

	user := models.User{
		GithubID:     "test-user-id",
		Email:        "test@example.com",
		Name:         "Test User",
		APIKeyHash:   hashedKey,
		APIKeyPrefix: "tk_test_123",
		MaxTunnels:   3,
		CreatedAt:    time.Now(),
	}

	_, err = collection.UpdateOne(
		ctx,
		bson.M{"githubId": user.GithubID},
		bson.M{"$set": user},
		options.Update().SetUpsert(true),
	)
	if err != nil {
		log.Fatalf("Failed to seed user: %v", err)
	}

	fmt.Println("--------------------------------------------------")
	fmt.Println("✔ Test user seeded successfully!")
	fmt.Printf("✔ API Key for testing: %s\n", rawKey)
	fmt.Println("--------------------------------------------------")
}
