package repository

import (
	"testing"

	"github.com/bhadrasuman/reverse-tunnel/internal/testutil"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// MongoRepositoryIntegrationTestSuite tests the MongoDB repository with a real database.
type MongoRepositoryIntegrationTestSuite struct {
	suite.Suite
	mongoHelper *testutil.MongoTestHelper
	repo        UserRepository
	userFactory *testutil.UserFactory
}

// SetupSuite runs once before all tests in the suite.
func (suite *MongoRepositoryIntegrationTestSuite) SetupSuite() {
	// Skip if MongoDB is not available
	testutil.SkipIfMongoUnavailable(suite.T())
	
	// Setup MongoDB test helper
	suite.mongoHelper = testutil.NewMongoTestHelper(suite.T(), nil)
	if suite.mongoHelper == nil {
		suite.T().Skip("MongoDB not available for integration tests")
		return
	}
	
	// Create indexes for testing
	suite.mongoHelper.CreateIndexes(suite.T())
	
	// Create repository with test database
	usersCollection := suite.mongoHelper.GetCollection("users")
	suite.repo = NewMongoUserRepository(usersCollection)
	
	// Create user factory for test data
	suite.userFactory = testutil.NewUserFactory()
}

// TearDownSuite runs once after all tests in the suite.
func (suite *MongoRepositoryIntegrationTestSuite) TearDownSuite() {
	if suite.mongoHelper != nil {
		suite.mongoHelper.Cleanup(suite.T())
	}
}

// TestFindByKeyHash_Success tests successful user lookup by API key hash.
func (suite *MongoRepositoryIntegrationTestSuite) TestFindByKeyHash_Success() {
	// Arrange
	testUser := suite.userFactory.WithAPIKey("test_hash_success", "rt_success")
	testUser.GithubID = testutil.GenerateRandomString(10) // Unique GitHub ID
	testUser.Email = "success@" + testutil.GenerateRandomString(8) + ".com"
	suite.mongoHelper.InsertTestUser(suite.T(), testUser)
	
	ctx, cancel := testutil.CreateTestContext()
	defer cancel()
	
	// Act
	result, err := suite.repo.FindByKeyHash(ctx, "test_hash_success")
	
	// Assert
	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), result)
	assert.Equal(suite.T(), testUser.Email, result.Email)
	assert.Equal(suite.T(), testUser.APIKeyHash, result.APIKeyHash)
}

// TestFindByKeyHash_NotFound tests user lookup when key doesn't exist.
func (suite *MongoRepositoryIntegrationTestSuite) TestFindByKeyHash_NotFound() {
	ctx, cancel := testutil.CreateTestContext()
	defer cancel()
	
	// Act
	result, err := suite.repo.FindByKeyHash(ctx, "nonexistent_hash")
	
	// Assert
	assert.Error(suite.T(), err)
	assert.Equal(suite.T(), ErrUserNotFound, err)
	assert.Nil(suite.T(), result)
}

// TestCreateUser tests user creation in the database.
func (suite *MongoRepositoryIntegrationTestSuite) TestCreateUser() {
	// Arrange
	uniqueId := testutil.GenerateRandomString(10)
	testUser := suite.userFactory.WithEmail("create" + uniqueId + "@example.com")
	testUser.GithubID = "github" + uniqueId
	testUser.ID = [12]byte{} // Reset ID so MongoDB generates it
	
	ctx, cancel := testutil.CreateTestContext()
	defer cancel()
	
	// Act
	result, err := suite.repo.CreateUser(ctx, testUser)
	
	// Assert
	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), result)
	assert.NotEmpty(suite.T(), result.ID) // MongoDB should have assigned an ID
	assert.Equal(suite.T(), testUser.Email, result.Email)
	
	// Verify it was actually inserted
	count := suite.mongoHelper.CountDocuments(suite.T(), "users", map[string]interface{}{
		"email": testUser.Email,
	})
	assert.Equal(suite.T(), int64(1), count)
}

// TestFindByGithubID tests finding users by their GitHub ID.
func (suite *MongoRepositoryIntegrationTestSuite) TestFindByGithubID() {
	// Arrange
	uniqueGithubID := "github" + testutil.GenerateRandomString(10)
	testUser := suite.userFactory.WithGithubID(uniqueGithubID)
	testUser.Email = "github@" + testutil.GenerateRandomString(8) + ".com"
	suite.mongoHelper.InsertTestUser(suite.T(), testUser)
	
	ctx, cancel := testutil.CreateTestContext()
	defer cancel()
	
	// Act
	result, err := suite.repo.FindByGithubID(ctx, uniqueGithubID)
	
	// Assert
	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), result)
	assert.Equal(suite.T(), uniqueGithubID, result.GithubID)
}

// TestUpdateUser tests updating an existing user.
func (suite *MongoRepositoryIntegrationTestSuite) TestUpdateUser() {
	// Arrange - insert a user first
	uniqueId := testutil.GenerateRandomString(10)
	testUser := suite.userFactory.WithEmail("update" + uniqueId + "@example.com")
	testUser.GithubID = "github" + uniqueId
	insertResult := suite.mongoHelper.InsertTestUser(suite.T(), testUser)
	testUser.ID = insertResult.InsertedID.(primitive.ObjectID)
	
	// Update the user's email
	testUser.Email = "updated" + uniqueId + "@example.com"
	
	ctx, cancel := testutil.CreateTestContext()
	defer cancel()
	
	// Act
	result, err := suite.repo.UpdateUser(ctx, testUser)
	
	// Assert
	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), result)
	assert.Equal(suite.T(), testUser.Email, result.Email)
}

// TestDeleteUser tests user deletion.
func (suite *MongoRepositoryIntegrationTestSuite) TestDeleteUser() {
	// Arrange - insert a user first
	uniqueId := testutil.GenerateRandomString(10)
	testUser := suite.userFactory.WithEmail("delete" + uniqueId + "@example.com")
	testUser.GithubID = "github" + uniqueId
	insertResult := suite.mongoHelper.InsertTestUser(suite.T(), testUser)
	userID := insertResult.InsertedID.(primitive.ObjectID).Hex()
	
	ctx, cancel := testutil.CreateTestContext()
	defer cancel()
	
	// Act
	err := suite.repo.DeleteUser(ctx, userID)
	
	// Assert
	assert.NoError(suite.T(), err)
	
	// Verify user was deleted
	count := suite.mongoHelper.CountDocuments(suite.T(), "users", map[string]interface{}{
		"email": testUser.Email,
	})
	assert.Equal(suite.T(), int64(0), count)
}

// TestMongoRepositoryIntegrationTestSuite runs the integration test suite.
// These tests require a running MongoDB instance.
func TestMongoRepositoryIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(MongoRepositoryIntegrationTestSuite))
}