// Package testutil provides common utilities and helpers for testing throughout the project.
// This includes mock factories, assertion helpers, test data builders, and setup utilities.
package testutil

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

// TestTimeout is the default timeout for test operations.
// Use this for contexts in tests to ensure they don't hang indefinitely.
const TestTimeout = 5 * time.Second

// CreateTestContext creates a context with a reasonable timeout for tests.
// This prevents tests from hanging if there are issues with async operations.
func CreateTestContext() (context.Context, context.CancelFunc) {
	return context.WithTimeout(context.Background(), TestTimeout)
}

// AssertNoError is a convenience wrapper for assert.NoError with better error messages.
// It includes the test name and provides more context when assertions fail.
func AssertNoError(t *testing.T, err error, msgAndArgs ...interface{}) {
	t.Helper()
	if !assert.NoError(t, err, msgAndArgs...) {
		t.FailNow() // Stop the test immediately on error
	}
}

// AssertError ensures an error occurred and optionally checks the error message.
func AssertError(t *testing.T, err error, expectedMsg string, msgAndArgs ...interface{}) {
	t.Helper()
	assert.Error(t, err, msgAndArgs...)
	if expectedMsg != "" {
		assert.Contains(t, err.Error(), expectedMsg, msgAndArgs...)
	}
}

// AssertEqual is a convenience wrapper for assert.Equal with helper marking.
func AssertEqual[T comparable](t *testing.T, expected, actual T, msgAndArgs ...interface{}) {
	t.Helper()
	assert.Equal(t, expected, actual, msgAndArgs...)
}

// AssertNotNil is a convenience wrapper for assert.NotNil with helper marking.
func AssertNotNil(t *testing.T, object interface{}, msgAndArgs ...interface{}) {
	t.Helper()
	assert.NotNil(t, object, msgAndArgs...)
}