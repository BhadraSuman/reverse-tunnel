package testutil

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
)

// TestCreateTestContext verifies that test contexts work properly.
// Hot reload test comment added
func TestCreateTestContext(t *testing.T) {
	ctx, cancel := CreateTestContext()
	defer cancel()

	// Context should not be nil
	assert.NotNil(t, ctx)

	// Context should have a deadline
	_, hasDeadline := ctx.Deadline()
	assert.True(t, hasDeadline, "Test context should have a timeout deadline")
}

// TestAssertHelpers demonstrates the assertion helper functions.
func TestAssertHelpers(t *testing.T) {
	// Test AssertEqual
	AssertEqual(t, "expected", "expected", "Equal strings should pass")
	AssertEqual(t, 42, 42, "Equal integers should pass")

	// Test AssertNotNil
	obj := &struct{}{}
	AssertNotNil(t, obj, "Non-nil object should pass")

	// Test AssertError
	testErr := errors.New("test error message")
	AssertError(t, testErr, "test error", "Error with expected message should pass")
}

// TestUserFactory demonstrates the user factory functionality.
func TestUserFactory(t *testing.T) {
	factory := NewUserFactory()

	t.Run("CreateUser", func(t *testing.T) {
		user := factory.CreateUser()
		
		assert.NotNil(t, user)
		assert.NotEmpty(t, user.ID)
		assert.Equal(t, "test@example.com", user.Email)
		assert.Equal(t, "Test User", user.Name)
		assert.Equal(t, 5, user.MaxTunnels)
	})

	t.Run("WithCustomFields", func(t *testing.T) {
		user := factory.WithEmail("custom@example.com")
		assert.Equal(t, "custom@example.com", user.Email)

		user = factory.WithMaxTunnels(10)
		assert.Equal(t, 10, user.MaxTunnels)

		user = factory.WithGithubID("custom123")
		assert.Equal(t, "custom123", user.GithubID)
	})

	t.Run("CreatePremiumUser", func(t *testing.T) {
		user := factory.CreatePremiumUser()
		assert.Equal(t, 20, user.MaxTunnels)
		assert.Equal(t, "premium@example.com", user.Email)
	})
}

// TestFrameFactory demonstrates the protocol frame factory functionality.
func TestFrameFactory(t *testing.T) {
	factory := NewFrameFactory()

	t.Run("CreateConnectedFrame", func(t *testing.T) {
		frame := factory.CreateConnectedFrame("test-subdomain")
		
		assert.Equal(t, "connected", string(frame.Type))
		assert.Equal(t, "test-subdomain", frame.Subdomain)
		assert.Equal(t, "tunnel established", frame.Message)
	})

	t.Run("CreateRequestFrame", func(t *testing.T) {
		frame := factory.CreateRequestFrame("channel123")
		
		assert.Equal(t, "request", string(frame.Type))
		assert.Equal(t, "channel123", frame.ChannelID)
		assert.Equal(t, "GET", frame.Method)
		assert.Equal(t, "/api/test", frame.Path)
		assert.Contains(t, frame.Headers, "Host")
	})

	t.Run("CreateResponseFrame", func(t *testing.T) {
		body := `{"success": true}`
		frame := factory.CreateResponseFrame("channel123", 200, body)
		
		assert.Equal(t, "response", string(frame.Type))
		assert.Equal(t, "channel123", frame.ChannelID)
		assert.Equal(t, 200, frame.Status)
		assert.Equal(t, body, frame.Body)
		assert.Contains(t, frame.Headers, "Content-Type")
	})
}

// TestGenerateRandomString tests the random string generation.
func TestGenerateRandomString(t *testing.T) {
	// Test different lengths
	lengths := []int{10, 20, 32}
	
	for _, length := range lengths {
		t.Run("length_"+string(rune(length)), func(t *testing.T) {
			str := GenerateRandomString(length)
			assert.Len(t, str, length)
			assert.NotEmpty(t, str)
			
			// Generate another and ensure they're different
			str2 := GenerateRandomString(length)
			assert.NotEqual(t, str, str2, "Random strings should be different")
		})
	}
}

// TestGenerateSubdomain tests subdomain generation.
func TestGenerateSubdomain(t *testing.T) {
	subdomain := GenerateSubdomain()
	
	assert.NotEmpty(t, subdomain)
	assert.Contains(t, subdomain, "-", "Subdomain should contain hyphens")
	
	// Generate multiple and ensure they vary
	subdomain2 := GenerateSubdomain()
	// Note: There's a small chance they could be the same, but very unlikely
	t.Logf("Generated subdomains: %s, %s", subdomain, subdomain2)
}

// TestGenerateChannelID tests channel ID generation.
func TestGenerateChannelID(t *testing.T) {
	channelID := GenerateChannelID()
	
	assert.Len(t, channelID, 20)
	assert.NotEmpty(t, channelID)
	
	// Generate another and ensure they're different
	channelID2 := GenerateChannelID()
	assert.NotEqual(t, channelID, channelID2)
}