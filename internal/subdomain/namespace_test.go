package subdomain

import "testing"

func TestNormalizeHandle(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"BhadraSuman", "bhadrasuman"},
		{"John_Doe-123!", "john-doe-123"},
		{"   cool--app--   ", "cool-app"},
		{"", "user"},
	}

	for _, tt := range tests {
		got := NormalizeHandle(tt.input)
		if got != tt.expected {
			t.Errorf("NormalizeHandle(%q) = %q; want %q", tt.input, got, tt.expected)
		}
	}
}

func TestIsSystemReserved(t *testing.T) {
	// Test reserved
	if !IsSystemReserved("dashboard") {
		t.Errorf("expected dashboard to be reserved")
	}
	if !IsSystemReserved("ADMIN") {
		t.Errorf("expected ADMIN to be reserved")
	}
	// Test unreserved
	if IsSystemReserved("bhadrasuman-3000") {
		t.Errorf("expected bhadrasuman-3000 to be unreserved")
	}
}

func TestBuildScopedSubdomain(t *testing.T) {
	got := BuildScopedSubdomain("BhadraSuman", "3000")
	expected := "bhadrasuman-3000"
	if got != expected {
		t.Errorf("BuildScopedSubdomain = %q; want %q", got, expected)
	}

	gotCustom := BuildScopedSubdomain("BhadraSuman", "billing-api")
	expectedCustom := "bhadrasuman-billing-api"
	if gotCustom != expectedCustom {
		t.Errorf("BuildScopedSubdomain = %q; want %q", gotCustom, expectedCustom)
	}
}
