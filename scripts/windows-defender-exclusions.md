# Windows Defender Exclusions for Development

When developing with Go and Air, Windows Defender may trigger security notifications because:
- Go builds executable files frequently
- Air watches files and rebuilds automatically
- Development tools create temporary executables

## Add These Exclusions

### Via Windows Security App:
1. Open **Windows Security** (Windows key + type "Windows Security")
2. Go to **Virus & threat protection**
3. Click **Manage settings** under "Virus & threat protection settings"
4. Scroll down to **Exclusions** and click **Add or remove exclusions**
5. Click **Add an exclusion** and add these:

### Folder Exclusions:
- `E:\Projects\reverse-tunnel` (your project directory)
- `%USERPROFILE%\go\bin` (Go tools directory)
- `%USERPROFILE%\AppData\Local\Temp\go-build*` (Go build cache)

### Process Exclusions:
- `air.exe`
- `go.exe`
- `server.exe` (your built server)
- `tunnel.exe` (your built CLI)

### File Type Exclusions:
- `.exe` files in your project directory only (be specific)

## Alternative: Use Developer Mode

### Enable Developer Mode:
1. Open **Settings** (Windows key + I)
2. Go to **Update & Security** → **For developers**
3. Turn on **Developer Mode**

This reduces security notifications for development activities.

## PowerShell Execution Policy

If you get PowerShell execution errors:

```powershell
# Allow local scripts (run as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or temporarily for current session
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

## Temporary Workaround

If notifications persist, you can:

1. **Temporarily disable Real-time protection** while developing
2. **Use Windows Subsystem for Linux (WSL)** for development
3. **Use Docker containers** to isolate the development environment

## Safe Development Practices

- Only exclude your specific project directories
- Don't disable Windows Defender entirely
- Re-enable full protection when not actively developing
- Keep exclusions minimal and specific