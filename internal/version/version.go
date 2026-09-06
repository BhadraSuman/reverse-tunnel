// Package version holds version metadata and version comparison logic for Reverse Tunnel.
package version

import (
	"fmt"
	"runtime"
	"strconv"
	"strings"
)

var (
	// Version is the current version string. Injected at build time via -ldflags.
	Version = "v0.1.0"

	// Commit is the Git commit short SHA. Injected at build time via -ldflags.
	Commit = "dev"

	// BuildDate is the UTC build timestamp. Injected at build time via -ldflags.
	BuildDate = "unknown"
)

// Info returns formatted version string with build metadata.
func Info() string {
	return fmt.Sprintf("tunnel %s (%s/%s) commit:%s built:%s", Version, runtime.GOOS, runtime.GOARCH, Commit, BuildDate)
}

// ParseSemver parses a version string like "v1.2.3" or "1.2.3" into [major, minor, patch].
func ParseSemver(v string) (int, int, int) {
	v = strings.TrimPrefix(v, "v")
	v = strings.Split(v, "-")[0] // Strip prerelease tags like -beta.1
	parts := strings.Split(v, ".")
	if len(parts) < 3 {
		return 0, 0, 0
	}
	major, _ := strconv.Atoi(parts[0])
	minor, _ := strconv.Atoi(parts[1])
	patch, _ := strconv.Atoi(parts[2])
	return major, minor, patch
}

// Compare returns -1 if v1 < v2, 0 if v1 == v2, and 1 if v1 > v2.
func Compare(v1, v2 string) int {
	maj1, min1, pat1 := ParseSemver(v1)
	maj2, min2, pat2 := ParseSemver(v2)

	if maj1 != maj2 {
		if maj1 < maj2 {
			return -1
		}
		return 1
	}
	if min1 != min2 {
		if min1 < min2 {
			return -1
		}
		return 1
	}
	if pat1 != pat2 {
		if pat1 < pat2 {
			return -1
		}
		return 1
	}
	return 0
}

// IsOutdated returns true if current < target.
func IsOutdated(current, target string) bool {
	if current == "" || target == "" {
		return false
	}
	return Compare(current, target) < 0
}

// IsBelowMinimum returns true if current < minimum.
func IsBelowMinimum(current, minimum string) bool {
	if current == "" || minimum == "" {
		return false
	}
	return Compare(current, minimum) < 0
}
