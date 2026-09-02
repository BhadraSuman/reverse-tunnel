// Package subdomain generates human-readable, random subdomain names
// in the format "adjective-noun-N" (e.g. "brave-wolf-42").
// This is similar to how Docker names containers or Heroku names apps.
package subdomain

import (
	"fmt"
	"math/rand"
)

// adjectives is a package-level slice of words used as the first segment.
// In Go, package-level variables are initialized once when the package is first
// imported — equivalent to module-level constants in TypeScript/Node.
var adjectives = []string{
	"amber", "blue", "bold", "brave", "calm", "coral", "crisp", "dark",
	"deft", "dusty", "eager", "epic", "fancy", "fuzzy", "glad", "gold",
	"grey", "happy", "icy", "jade", "jolly", "just", "keen", "kind",
	"lazy", "lean", "lively", "merry", "mint", "neat", "nice", "open",
	"pink", "pure", "quick", "rapid", "rich", "rosy", "safe", "slow",
	"teal", "tiny", "true", "vast", "vivid", "warm", "wild", "wise",
	"witty", "zesty", "airy", "breezy", "cloudy", "deep", "early",
}

// nouns is a package-level slice of animal names used as the second segment.
var nouns = []string{
	"bear", "bison", "clam", "cobra", "crane", "deer", "dingo", "eagle",
	"falcon", "finch", "fox", "gator", "goat", "hawk", "heron", "hippo",
	"ibis", "iguana", "jackal", "jaguar", "kite", "koala", "lark", "lemur",
	"lynx", "mink", "moose", "narwhal", "newt", "orca", "otter", "owl",
	"panda", "parrot", "puma", "quail", "quokka", "raven", "rhino", "robin",
	"seal", "shark", "sloth", "tapir", "tiger", "toad", "urial", "viper",
	"vole", "wasp", "wolf", "wren", "yak", "zebra", "crane", "finch",
}

// Generate returns a random subdomain like "brave-wolf-42".
//
// rand.Intn is safe to call without seeding in Go 1.20+ — the global source
// is automatically seeded with a random value at program startup.
// The modulo operation (%) gives us an index within the slice bounds.
func Generate() string {
	adj := adjectives[rand.Intn(len(adjectives))]
	noun := nouns[rand.Intn(len(nouns))]
	n := rand.Intn(100)

	// fmt.Sprintf works like template literals in JS: `${adj}-${noun}-${n}`
	return fmt.Sprintf("%s-%s-%d", adj, noun, n)
}
