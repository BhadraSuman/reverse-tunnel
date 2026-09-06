package version

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestParseSemver(t *testing.T) {
	tests := []struct {
		input                string
		maj, min, patch int
	}{
		{"v0.1.0", 0, 1, 0},
		{"1.2.3", 1, 2, 3},
		{"v2.10.4-beta.1", 2, 10, 4},
		{"invalid", 0, 0, 0},
	}

	for _, tt := range tests {
		maj, min, pat := ParseSemver(tt.input)
		assert.Equal(t, tt.maj, maj)
		assert.Equal(t, tt.min, min)
		assert.Equal(t, tt.patch, pat)
	}
}

func TestCompare(t *testing.T) {
	assert.Equal(t, -1, Compare("v0.1.0", "v0.2.0"))
	assert.Equal(t, 0, Compare("v0.1.0", "v0.1.0"))
	assert.Equal(t, 1, Compare("v0.2.0", "v0.1.0"))
	assert.Equal(t, -1, Compare("v0.1.9", "v0.2.0"))
	assert.Equal(t, -1, Compare("v1.0.0", "v2.0.0"))
}

func TestIsOutdatedAndBelowMinimum(t *testing.T) {
	assert.True(t, IsOutdated("v0.1.0", "v0.2.0"))
	assert.False(t, IsOutdated("v0.2.0", "v0.1.0"))
	assert.False(t, IsOutdated("v0.1.0", "v0.1.0"))

	assert.True(t, IsBelowMinimum("v0.0.9", "v0.1.0"))
	assert.False(t, IsBelowMinimum("v0.1.0", "v0.1.0"))
}
