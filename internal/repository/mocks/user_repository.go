// Package mocks provides mock implementations of repository interfaces for testing.
// This file contains generated mocks using testify/mock for the UserRepository interface.
package mocks

import (
	"context"

	"github.com/bhadrasuman/reverse-tunnel/internal/models"
	"github.com/stretchr/testify/mock"
)

// MockUserRepository is a mock implementation of repository.UserRepository interface.
// It uses testify/mock to provide programmable behavior for unit tests.
// 
// Usage example:
//   mockRepo := &MockUserRepository{}
//   mockRepo.On("FindByKeyHash", mock.Anything, "test_hash").Return(&models.User{}, nil)
//   // ... run your test code that calls FindByKeyHash
//   mockRepo.AssertExpectations(t)
type MockUserRepository struct {
	mock.Mock
}

// FindByKeyHash mocks the FindByKeyHash method.
func (m *MockUserRepository) FindByKeyHash(ctx context.Context, keyHash string) (*models.User, error) {
	args := m.Called(ctx, keyHash)
	// Handle nil return for *models.User (first return value)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.User), args.Error(1)
}

// CreateUser mocks the CreateUser method.
func (m *MockUserRepository) CreateUser(ctx context.Context, user *models.User) (*models.User, error) {
	args := m.Called(ctx, user)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.User), args.Error(1)
}

// FindByGithubID mocks the FindByGithubID method.
func (m *MockUserRepository) FindByGithubID(ctx context.Context, githubID string) (*models.User, error) {
	args := m.Called(ctx, githubID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.User), args.Error(1)
}

// UpdateUser mocks the UpdateUser method.
func (m *MockUserRepository) UpdateUser(ctx context.Context, user *models.User) (*models.User, error) {
	args := m.Called(ctx, user)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.User), args.Error(1)
}

// DeleteUser mocks the DeleteUser method.
func (m *MockUserRepository) DeleteUser(ctx context.Context, userID string) error {
	args := m.Called(ctx, userID)
	return args.Error(0)
}

// NewMockUserRepository creates a new MockUserRepository instance.
// This is a convenience constructor for tests.
func NewMockUserRepository() *MockUserRepository {
	return &MockUserRepository{}
}