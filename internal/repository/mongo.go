// Package repository provides MongoDB implementations of repository interfaces.
package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/bhadrasuman/reverse-tunnel/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// MongoUserRepository implements UserRepository interface using MongoDB.
// This contains all the concrete MongoDB operations that were previously
// embedded in the auth.Authenticator struct.
type MongoUserRepository struct {
	collection *mongo.Collection
}

// NewMongoUserRepository creates a new MongoDB-backed user repository.
// This is the constructor that takes a MongoDB collection and returns
// an implementation of the UserRepository interface.
func NewMongoUserRepository(collection *mongo.Collection) UserRepository {
	return &MongoUserRepository{
		collection: collection,
	}
}

// FindByKeyHash retrieves a user by their API key hash.
// This is the exact same logic that was in auth.Authenticator.ValidateKey(),
// but now isolated in the repository layer.
func (r *MongoUserRepository) FindByKeyHash(ctx context.Context, keyHash string) (*models.User, error) {
	var user models.User
	err := r.collection.FindOne(ctx, bson.M{"apiKeyHash": keyHash}).Decode(&user)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			// Return a custom not found error that auth layer can recognize
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("failed to find user by key hash: %w", err)
	}
	return &user, nil
}

// CreateUser creates a new user record in MongoDB.
// This will be used during OAuth registration flow.
func (r *MongoUserRepository) CreateUser(ctx context.Context, user *models.User) (*models.User, error) {
	result, err := r.collection.InsertOne(ctx, user)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Set the generated ObjectID back on the user struct
	if oid, ok := result.InsertedID.(primitive.ObjectID); ok {
		user.ID = oid
	}

	return user, nil
}

// FindByGithubID retrieves a user by their GitHub OAuth ID.
// Used during OAuth login to check if user already exists.
func (r *MongoUserRepository) FindByGithubID(ctx context.Context, githubID string) (*models.User, error) {
	var user models.User
	err := r.collection.FindOne(ctx, bson.M{"githubId": githubID}).Decode(&user)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("failed to find user by GitHub ID: %w", err)
	}
	return &user, nil
}

// UpdateUser updates an existing user record.
// Used for updating user profile info or API key regeneration.
func (r *MongoUserRepository) UpdateUser(ctx context.Context, user *models.User) (*models.User, error) {
	filter := bson.M{"_id": user.ID}
	update := bson.M{"$set": user}

	result := r.collection.FindOneAndUpdate(ctx, filter, update)
	if err := result.Err(); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	return user, nil
}

// DeleteUser removes a user from the database.
// Used for account deletion functionality.
func (r *MongoUserRepository) DeleteUser(ctx context.Context, userID string) error {
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return fmt.Errorf("invalid user ID format: %w", err)
	}

	result, err := r.collection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	if result.DeletedCount == 0 {
		return ErrUserNotFound
	}

	return nil
}

// ErrUserNotFound is a sentinel error for when a user lookup fails.
// This replaces the auth.ErrInvalidKey for repository-level "not found" cases.
// The auth layer can then decide how to handle this (return ErrInvalidKey, etc.)
var ErrUserNotFound = errors.New("user not found")