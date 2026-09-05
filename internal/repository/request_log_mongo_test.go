package repository_test

import (
	"context"
	"testing"
	"time"

	"github.com/bhadrasuman/reverse-tunnel/internal/models"
	"github.com/bhadrasuman/reverse-tunnel/internal/repository"
	"github.com/bhadrasuman/reverse-tunnel/internal/testutil"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestMongoRequestLogRepository(t *testing.T) {
	testutil.SkipIfMongoUnavailable(t)

	helper := testutil.NewMongoTestHelper(t, nil)
	require.NotNil(t, helper)
	defer helper.Cleanup(t)

	logRepo, err := repository.NewMongoRequestLogRepository(helper.Database)
	require.NoError(t, err)

	ctx := context.Background()

	t.Run("CreateLog and GetLogsBySubdomain", func(t *testing.T) {
		logEntry := &models.RequestLog{
			ChannelID:       "ch_test_123",
			Subdomain:       "test-tunnel-app",
			Method:          "GET",
			Path:            "/api/v1/users",
			Query:           "page=1&limit=10",
			RequestHeaders:  map[string]string{"User-Agent": "Go-test"},
			ResponseStatus:  200,
			ResponseHeaders: map[string]string{"Content-Type": "application/json"},
			ResponseBody:    `{"status":"ok"}`,
			DurationMs:      45,
			ClientIP:        "127.0.0.1",
			CreatedAt:       time.Now(),
		}

		err := logRepo.CreateLog(ctx, logEntry)
		assert.NoError(t, err)
		assert.False(t, logEntry.ID.IsZero())

		// Retrieve logs for subdomain
		logs, err := logRepo.GetLogsBySubdomain(ctx, "test-tunnel-app", 10)
		assert.NoError(t, err)
		require.Len(t, logs, 1)

		assert.Equal(t, "GET", logs[0].Method)
		assert.Equal(t, "/api/v1/users", logs[0].Path)
		assert.Equal(t, 200, logs[0].ResponseStatus)
		assert.Equal(t, int64(45), logs[0].DurationMs)

		// Get log by ID
		fetchedLog, err := logRepo.GetLogByID(ctx, logEntry.ID.Hex())
		assert.NoError(t, err)
		assert.Equal(t, logEntry.ChannelID, fetchedLog.ChannelID)
	})

	t.Run("GetLogsBySubdomain empty", func(t *testing.T) {
		logs, err := logRepo.GetLogsBySubdomain(ctx, "non-existent-subdomain", 10)
		assert.NoError(t, err)
		assert.Empty(t, logs)
	})
}
