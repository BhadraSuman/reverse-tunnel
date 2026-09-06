package subdomain

import (
	"fmt"
	"regexp"
	"strings"
)

// ReservedSystemSubdomains contains infrastructure subdomains that cannot be claimed or used as prefixes.
var ReservedSystemSubdomains = map[string]bool{
	"dashboard": true,
	"admin":     true,
	"api":       true,
	"tunnel":    true,
	"control":   true,
	"www":       true,
	"app":       true,
	"status":    true,
	"mail":      true,
	"smtp":      true,
	"pop":       true,
	"imap":      true,
	"ftp":       true,
	"ssh":       true,
	"ns1":       true,
	"ns2":       true,
}

var validCharRegex = regexp.MustCompile(`[^a-z0-9-]+`)

// NormalizeHandle sanitizes a username or handle into a valid URL slug segment.
// It converts to lowercase, replaces non-alphanumeric chars with hyphens, and trims hyphens.
func NormalizeHandle(raw string) string {
	s := strings.ToLower(strings.TrimSpace(raw))
	s = validCharRegex.ReplaceAllString(s, "-")
	s = strings.Trim(s, "-")
	for strings.Contains(s, "--") {
		s = strings.ReplaceAll(s, "--", "-")
	}
	if s == "" {
		return "user"
	}
	return s
}

// IsSystemReserved returns true if a subdomain is reserved for infrastructure.
func IsSystemReserved(name string) bool {
	clean := strings.ToLower(strings.TrimSpace(name))
	return ReservedSystemSubdomains[clean]
}

// BuildScopedSubdomain constructs an isolated namespace subdomain: <username>-<identifier>.
// Example: BuildScopedSubdomain("bhadrasuman", "3000") -> "bhadrasuman-3000"
// Example: BuildScopedSubdomain("bhadrasuman", "billing") -> "bhadrasuman-billing"
func BuildScopedSubdomain(username, identifier string) string {
	userSlug := NormalizeHandle(username)
	identSlug := NormalizeHandle(identifier)
	return fmt.Sprintf("%s-%s", userSlug, identSlug)
}
