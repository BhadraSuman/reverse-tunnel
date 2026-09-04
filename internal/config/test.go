// Package config provides configuration management for different environments.
package config

import (
	"os"
	"strconv"
	"time"
)

// TestConfig holds configuration specific to test environment.
type TestConfig struct {
	MongoDB    TestMongoConfig
	Server     TestServerConfig  
	Domain     string
	LogLevel   string
	Timeouts   TestTimeoutConfig
	Integration TestIntegrationConfig
}

// TestMongoConfig holds MongoDB settings for tests.
type TestMongoConfig struct {
	URI      string
	Database string
	Timeout  time.Duration
}

// TestServerConfig holds server port settings for tests.
type TestServerConfig struct {
	ControlPort int
	ProxyPort   int
	APIPort     int
}

// TestTimeoutConfig holds timeout settings for tests.
type TestTimeoutConfig struct {
	Default  time.Duration
	Database time.Duration
}

// TestIntegrationConfig holds integration test settings.
type TestIntegrationConfig struct {
	Enabled   bool
	SkipSlow  bool
}

// LoadTestConfig loads configuration for test environment.
// It reads from environment variables with test-specific defaults.
func LoadTestConfig() *TestConfig {
	return &TestConfig{
		MongoDB: TestMongoConfig{
			URI:      getEnv("MONGODB_URI", "mongodb://localhost:27017"),
			Database: getEnv("MONGODB_TEST_DATABASE", "tunnel_test"),
			Timeout:  parseDuration("TEST_DB_TIMEOUT", "5s"),
		},
		Server: TestServerConfig{
			ControlPort: parseInt("PORT_CONTROL_TEST", 3011),
			ProxyPort:   parseInt("PORT_PROXY_TEST", 4010),
			APIPort:     parseInt("PORT_API_TEST", 3012),
		},
		Domain:   getEnv("DOMAIN_TEST", "test.localhost"),
		LogLevel: getEnv("LOG_LEVEL_TEST", "error"),
		Timeouts: TestTimeoutConfig{
			Default:  parseDuration("TEST_TIMEOUT", "10s"),
			Database: parseDuration("TEST_DB_TIMEOUT", "5s"),
		},
		Integration: TestIntegrationConfig{
			Enabled:  parseBool("INTEGRATION_TEST_ENABLED", true),
			SkipSlow: parseBool("SKIP_SLOW_TESTS", false),
		},
	}
}

// getEnv gets an environment variable with a default fallback.
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// parseInt parses an integer from environment variable with default fallback.
func parseInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if parsed, err := strconv.Atoi(value); err == nil {
			return parsed
		}
	}
	return defaultValue
}

// parseBool parses a boolean from environment variable with default fallback.
func parseBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if parsed, err := strconv.ParseBool(value); err == nil {
			return parsed
		}
	}
	return defaultValue
}

// parseDuration parses a duration from environment variable with default fallback.
func parseDuration(key, defaultValue string) time.Duration {
	if value := os.Getenv(key); value != "" {
		if parsed, err := time.ParseDuration(value); err == nil {
			return parsed
		}
	}
	// Parse the default value
	parsed, err := time.ParseDuration(defaultValue)
	if err != nil {
		// If default is invalid, return a reasonable fallback
		return 5 * time.Second
	}
	return parsed
}