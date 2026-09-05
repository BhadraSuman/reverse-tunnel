package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/bhadrasuman/reverse-tunnel/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// MongoRequestLogRepository implements RequestLogRepository using MongoDB.
type MongoRequestLogRepository struct {
	collection *mongo.Collection
}

// NewMongoRequestLogRepository initializes a new RequestLog repository and ensures TTL index exists.
func NewMongoRequestLogRepository(db *mongo.Database) (*MongoRequestLogRepository, error) {
	coll := db.Collection("request_logs")

	// Ensure TTL Index on expiresAt so old traffic logs auto-expire after 24h
	indexModel := mongo.IndexModel{
		Keys:    bson.D{{Key: "expiresAt", Value: 1}},
		Options: options.Index().SetExpireAfterSeconds(0), // Delete immediately when expiresAt is reached
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := coll.Indexes().CreateOne(ctx, indexModel)
	if err != nil {
		return nil, fmt.Errorf("failed to create TTL index on request_logs: %w", err)
	}

	// Ensure secondary index on subdomain + createdAt for fast queries
	subdomainIndex := mongo.IndexModel{
		Keys: bson.D{
			{Key: "subdomain", Value: 1},
			{Key: "createdAt", Value: -1},
		},
	}
	_, _ = coll.Indexes().CreateOne(ctx, subdomainIndex)

	return &MongoRequestLogRepository{collection: coll}, nil
}

// CreateLog inserts a new traffic request log into MongoDB.
func (r *MongoRequestLogRepository) CreateLog(ctx context.Context, log *models.RequestLog) error {
	if log.CreatedAt.IsZero() {
		log.CreatedAt = time.Now()
	}
	if log.ExpiresAt.IsZero() {
		log.ExpiresAt = log.CreatedAt.Add(24 * time.Hour) // Auto-expire after 24 hours
	}

	_, err := r.collection.InsertOne(ctx, log)
	if err != nil {
		return fmt.Errorf("failed to insert request log: %w", err)
	}
	return nil
}

// GetLogsBySubdomain retrieves the latest request logs for a subdomain.
func (r *MongoRequestLogRepository) GetLogsBySubdomain(ctx context.Context, subdomain string, limit int) ([]*models.RequestLog, error) {
	if limit <= 0 {
		limit = 50
	}

	filter := bson.M{"subdomain": subdomain}
	opts := options.Find().
		SetSort(bson.D{{Key: "createdAt", Value: -1}}).
		SetLimit(int64(limit))

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, fmt.Errorf("failed to find request logs: %w", err)
	}
	defer cursor.Close(ctx)

	var logs []*models.RequestLog
	if err := cursor.All(ctx, &logs); err != nil {
		return nil, fmt.Errorf("failed to decode request logs: %w", err)
	}

	if logs == nil {
		logs = []*models.RequestLog{}
	}
	return logs, nil
}

// GetLogByID fetches a single request log by ID.
func (r *MongoRequestLogRepository) GetLogByID(ctx context.Context, id string) (*models.RequestLog, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, fmt.Errorf("invalid log ID format: %w", err)
	}

	var log models.RequestLog
	err = r.collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&log)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("request log not found")
		}
		return nil, fmt.Errorf("failed to fetch request log: %w", err)
	}

	return &log, nil
}
