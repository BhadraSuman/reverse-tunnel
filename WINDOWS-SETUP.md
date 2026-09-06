# Windows Development Setup

## IMMEDIATE ACTION REQUIRED

Windows Defender is blocking Go builds. **You must add these exclusions before development will work:**

### Step 1: Open Windows Security
1. Press `Windows + I` to open Settings
2. Go to **Update & Security** → **Windows Security** 
3. Click **Open Windows Security**

### Step 2: Add Folder Exclusions
1. Go to **Virus & threat protection**
2. Click **Manage settings** under "Virus & threat protection settings"  
3. Scroll down to **Exclusions**
4. Click **Add or remove exclusions**
5. Click **Add an exclusion** → **Folder**
6. Add these exact paths:

```
E:\Projects\reverse-tunnel
C:\Users\suman\AppData\Local\Temp
%USERPROFILE%\go
```

### Step 3: Add Process Exclusions
1. Click **Add an exclusion** → **Process**
2. Add these processes:

```
go.exe
air.exe
```

### Alternative: Quick PowerShell Command
Run PowerShell as Administrator and execute:

```powershell
# Add folder exclusions
Add-MpPreference -ExclusionPath "E:\Projects\reverse-tunnel"
Add-MpPreference -ExclusionPath "$env:USERPROFILE\AppData\Local\Temp"
Add-MpPreference -ExclusionPath "$env:USERPROFILE\go"

# Add process exclusions  
Add-MpPreference -ExclusionProcess "go.exe"
Add-MpPreference -ExclusionProcess "air.exe"
```

## After Adding Exclusions

1. **Restart your terminal/PowerShell**
2. **Test the build:**
   ```powershell
   go build -o bin/server.exe ./cmd/server
   ```
3. **If successful, test hot reload:**
   ```powershell
   air
   ```

## Verification Commands

Run these to verify setup:
```powershell
# Test basic build
go build -o bin/test.exe ./cmd/server
Remove-Item bin/test.exe

# Test Air configuration
air --version

# Test development script
.\scripts\dev.ps1 help
```

---

**Once you've added the exclusions, type "done" and I'll test the hot reload functionality.**