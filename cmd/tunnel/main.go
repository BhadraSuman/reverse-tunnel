// Package main is the entry point for the `tunnel` CLI binary.
// It uses Cobra for command-line argument parsing — similar to Commander.js in Node.
//
// Commands:
//   - tunnel start --port 3000 --key rt_xxx
//   - tunnel config --key rt_xxx --server wss://tunnel.example.com
//   - tunnel version
package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/bhadrasuman/reverse-tunnel/cli"
	"github.com/spf13/cobra"
)

// config holds the persistent CLI configuration stored in the user's config dir.
// We read this file on startup and merge it with command-line flags
// (flags always take priority over the config file).
type config struct {
	Key    string `json:"key"`
	Server string `json:"server"`
}

// configFilePath returns the platform-appropriate config file path.
// os.UserConfigDir() returns:
//   - Windows: %AppData%\tunnel\config.json
//   - macOS:   ~/Library/Application Support/tunnel/config.json
//   - Linux:   ~/.config/tunnel/config.json
func configFilePath() (string, error) {
	dir, err := os.UserConfigDir()
	if err != nil {
		return "", fmt.Errorf("could not determine config dir: %w", err)
	}
	return filepath.Join(dir, "tunnel", "config.json"), nil
}

// loadConfig reads and parses the config file. Returns zero-value config if
// the file doesn't exist (not an error — just means no config saved yet).
func loadConfig() config {
	path, err := configFilePath()
	if err != nil {
		return config{}
	}

	// os.ReadFile reads the entire file into memory.
	// If it returns an error (file not found, permissions), we return empty config.
	data, err := os.ReadFile(path)
	if err != nil {
		return config{}
	}

	var cfg config
	if err := json.Unmarshal(data, &cfg); err != nil {
		return config{}
	}
	return cfg
}

// saveConfig writes the config struct to the config file as JSON.
// os.MkdirAll creates parent directories if they don't exist — like mkdir -p.
func saveConfig(cfg config) error {
	path, err := configFilePath()
	if err != nil {
		return err
	}

	// Create the directory tree if it doesn't exist.
	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		return fmt.Errorf("failed to create config dir: %w", err)
	}

	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal config: %w", err)
	}

	// 0600 = user read+write only — appropriate for files containing secrets.
	if err := os.WriteFile(path, data, 0600); err != nil {
		return fmt.Errorf("failed to write config: %w", err)
	}

	return nil
}

func main() {
	// rootCmd is the top-level command — just "tunnel" with no subcommand.
	// Cobra uses a tree structure: rootCmd → [startCmd, configCmd, versionCmd]
	rootCmd := &cobra.Command{
		Use:   "tunnel",
		Short: "Expose localhost to the internet via a reverse tunnel",
	}

	// -------------------------------------------------------------------------
	// tunnel start
	// -------------------------------------------------------------------------

	var (
		startPort   int
		startKey    string
		startServer string
	)

	startCmd := &cobra.Command{
		Use:   "start",
		Short: "Start a tunnel to expose a local port",
		// RunE is like Run but returns an error. Cobra prints the error
		// and exits with code 1 if RunE returns non-nil.
		RunE: func(cmd *cobra.Command, args []string) error {
			cfg := loadConfig()

			// Merge: flag > config file > default
			// cmd.Flags().Changed("key") tells us if the user explicitly set --key
			key := startKey
			if key == "" {
				key = cfg.Key
			}
			if key == "" {
				return fmt.Errorf("API key required: set --key flag or run 'tunnel config --key <key>'")
			}

			server := startServer
			if server == "" {
				server = cfg.Server
			}
			if server == "" {
				server = "wss://tunnel.yourdomain.com"
			}

			if startPort == 0 {
				return fmt.Errorf("--port is required")
			}

			// cli.NewClient creates the tunnel client; Start() blocks indefinitely.
			client := cli.NewClient(server, key, startPort)
			client.Start() // never returns under normal operation
			return nil
		},
	}

	// Flags are defined using method chaining on Flags() — similar to yargs in Node.
	// The "p" in StringVarP is the short flag alias (-p).
	startCmd.Flags().IntVarP(&startPort, "port", "p", 0, "Local port to expose (required)")
	startCmd.Flags().StringVarP(&startKey, "key", "k", "", "API key (or set via config)")
	startCmd.Flags().StringVarP(&startServer, "server", "s", "", "Server WebSocket URL")
	// MarkRequired makes Cobra enforce the flag — prints a clear error if missing.
	if err := startCmd.MarkFlagRequired("port"); err != nil {
		fmt.Fprintf(os.Stderr, "failed to mark port as required: %v\n", err)
	}

	// -------------------------------------------------------------------------
	// tunnel config
	// -------------------------------------------------------------------------

	var (
		configKey    string
		configServer string
	)

	configCmd := &cobra.Command{
		Use:   "config",
		Short: "Save API key and server URL to config file",
		RunE: func(cmd *cobra.Command, args []string) error {
			// Load existing config so we can update only the fields that were set.
			cfg := loadConfig()

			if configKey != "" {
				cfg.Key = configKey
			}
			if configServer != "" {
				cfg.Server = configServer
			}

			if err := saveConfig(cfg); err != nil {
				return fmt.Errorf("failed to save config: %w", err)
			}

			// ✔ is the Unicode "heavy check mark" — gives a nice visual confirmation.
			fmt.Println("  ✔  Config saved")

			// Show where the file was saved.
			path, _ := configFilePath()
			fmt.Printf("     %s\n", path)

			return nil
		},
	}

	configCmd.Flags().StringVar(&configKey, "key", "", "API key to save")
	configCmd.Flags().StringVar(&configServer, "server", "", "Server WebSocket URL to save")

	// -------------------------------------------------------------------------
	// tunnel version
	// -------------------------------------------------------------------------

	versionCmd := &cobra.Command{
		Use:   "version",
		Short: "Print version information",
		Run: func(cmd *cobra.Command, args []string) {
			fmt.Println("tunnel v0.1.0")
		},
	}

	// Register all subcommands with the root command.
	rootCmd.AddCommand(startCmd, configCmd, versionCmd)

	// Execute parses os.Args and runs the matched command.
	// Cobra handles --help, unknown flags, and subcommand routing automatically.
	if err := rootCmd.Execute(); err != nil {
		// Cobra already prints the error message; we just exit with code 1.
		os.Exit(1)
	}
}
