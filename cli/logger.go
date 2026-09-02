// Package cli — logger.go provides terminal output helpers for the CLI client.
// We use raw ANSI escape codes for colors, which work on macOS, Linux, and
// Windows Terminal (Windows 10+). No external dependency needed.
package cli

import (
	"fmt"
	"strings"
	"time"
)

// ANSI color escape codes.
// These are the same escape sequences used by chalk/kleur in Node.js.
const (
	colorReset  = "\033[0m"
	colorGreen  = "\033[32m" // 2xx success
	colorCyan   = "\033[36m" // 3xx redirect
	colorYellow = "\033[33m" // 4xx client error
	colorRed    = "\033[31m" // 5xx server error
	colorGrey   = "\033[90m" // muted text
	colorBold   = "\033[1m"  // bold
)

// PrintBanner displays a box around the active tunnel URL.
// The box-drawing characters (╔ ║ ╚) are Unicode — supported on all modern terminals.
//
// Example output:
//
//	╔══════════════════════════════════════════╗
//	║  Tunnel active!                          ║
//	║  https://brave-wolf-42.yourdomain.com    ║
//	╚══════════════════════════════════════════╝
func PrintBanner(subdomain, domain string) {
	url := fmt.Sprintf("https://%s.%s", subdomain, domain)

	// The inner content width (excluding "║  " prefix and "  ║" suffix).
	// We pick max of the two lines so the box is always wide enough.
	line1 := "Tunnel active!"
	line2 := url
	innerWidth := len(line2) + 2 // +2 for padding spaces inside box
	if len(line1)+2 > innerWidth {
		innerWidth = len(line1) + 2
	}

	// Build the top/bottom border: "═" repeated innerWidth times.
	// strings.Repeat is like "═".repeat(n) in JS.
	border := strings.Repeat("═", innerWidth+2)

	padLine := func(text string) string {
		// Pad text to innerWidth with trailing spaces.
		padding := innerWidth - len(text)
		if padding < 0 {
			padding = 0
		}
		return "  " + text + strings.Repeat(" ", padding)
	}

	fmt.Println()
	fmt.Printf("%s╔%s╗%s\n", colorGreen+colorBold, border, colorReset)
	fmt.Printf("%s║%s║%s\n", colorGreen+colorBold, padLine(line1), colorReset)
	fmt.Printf("%s║%s║%s\n", colorGreen+colorBold, padLine(colorReset+colorCyan+line2+colorGreen+colorBold), colorReset)
	fmt.Printf("%s╚%s╝%s\n", colorGreen+colorBold, border, colorReset)
	fmt.Println()
}

// LogRequest prints a single-line log entry for each proxied HTTP request.
// Format: "  METHOD  /path/truncated...               STATUS  12ms"
//
// Status colors:
//   - 2xx → green
//   - 3xx → cyan
//   - 4xx → yellow
//   - 5xx → red
func LogRequest(method, path string, status int, duration time.Duration) {
	// Left-pad method to 6 characters for alignment.
	// fmt.Sprintf with "%-6s" left-aligns in a 6-char wide field.
	methodStr := fmt.Sprintf("%-6s", method)

	// Truncate path to 40 characters if too long.
	if len(path) > 40 {
		path = path[:37] + "..."
	}
	// Left-align path in a 40-char wide field.
	pathStr := fmt.Sprintf("%-40s", path)

	// Choose color based on HTTP status class.
	statusColor := colorReset
	switch {
	case status >= 500:
		statusColor = colorRed
	case status >= 400:
		statusColor = colorYellow
	case status >= 300:
		statusColor = colorCyan
	case status >= 200:
		statusColor = colorGreen
	}

	// Format duration: show ms if < 1s, otherwise show seconds.
	var durationStr string
	if duration < time.Second {
		durationStr = fmt.Sprintf("%dms", duration.Milliseconds())
	} else {
		durationStr = fmt.Sprintf("%.2fs", duration.Seconds())
	}

	fmt.Printf("  %s%s%s  %s  %s%d%s  %s%s%s\n",
		colorGrey, methodStr, colorReset,
		pathStr,
		statusColor, status, colorReset,
		colorGrey, durationStr, colorReset,
	)
}

// PrintConnecting prints the initial connecting message.
// ⟳ is a Unicode "clockwise open circle arrow" — indicates connecting/loading.
func PrintConnecting(url string) {
	fmt.Printf("\n  %s⟳%s  Connecting to %s%s%s...\n", colorCyan, colorReset, colorBold, url, colorReset)
}

// PrintReconnecting prints the reconnecting message with the delay.
// ⚠ is the Unicode warning sign.
func PrintReconnecting(delay time.Duration) {
	if delay == 0 {
		fmt.Printf("  %s⚠%s  Disconnected. Reconnecting...\n", colorYellow, colorReset)
		return
	}
	fmt.Printf("  %s⚠%s  Reconnecting in %s%s%s...\n",
		colorYellow, colorReset,
		colorBold, delay.String(), colorReset,
	)
}
