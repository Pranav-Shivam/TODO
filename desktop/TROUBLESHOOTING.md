# Desktop App Troubleshooting Guide

## Quick Start

1. **Navigate to desktop directory:**
   ```bash
   cd desktop
   ```

2. **Run the desktop app:**
   ```bash
   npm run dev
   ```
   
   Or use the batch file:
   ```bash
   run-desktop.bat
   ```

## Common Issues and Solutions

### 1. Desktop App Window Doesn't Appear

**Symptoms:** Running `npm run dev` shows no errors but no window appears.

**Solutions:**
- Check if Electron processes are running: `tasklist | findstr electron`
- Try the simple test: `npm run test` (should open a test window)
- Check Windows Task Manager for hidden Electron processes
- Restart your computer if processes are stuck

### 2. Backend Connection Issues

**Symptoms:** App loads but shows "Cannot connect to backend" errors.

**Solutions:**
- Check if Python is installed: `python --version`
- Check if backend directory exists: `..\backend`
- Check if virtual environment exists: `..\backend\venv`
- Manually start backend: `cd ..\backend && python main.py`

### 3. Frontend Connection Issues

**Symptoms:** App loads but shows "Cannot connect to frontend" errors.

**Solutions:**
- Check if frontend is built: `..\frontend\dist`
- Build frontend: `cd ..\frontend && npm run build`
- Check if ports are in use: `netstat -an | findstr 7008`
- Kill conflicting processes: `taskkill /f /im node.exe`

### 4. Port Conflicts

**Symptoms:** "Port 7008 is in use" or similar messages.

**Solutions:**
- The app now automatically detects alternative ports (7009, 7010, etc.)
- Check what's using the port: `netstat -ano | findstr 7008`
- Kill the process using the port
- Or simply let the app use the next available port

### 5. Dependencies Issues

**Symptoms:** "Module not found" or "Cannot find module" errors.

**Solutions:**
- Install desktop dependencies: `npm install`
- Install frontend dependencies: `cd ..\frontend && npm install`
- Install backend dependencies: `cd ..\backend && pip install -r requirements.txt`

### 6. Built Executable Issues

**Symptoms:** Double-clicking the .exe file shows no response.

**Solutions:**
- Run from command line to see errors: `.\dist\Todo Calendar 1.0.0.exe`
- Check if all files are included in the build
- Rebuild the executable: `npm run build:simple`
- Use development mode instead: `npm run dev`

## Step-by-Step Debugging

### Step 1: Test Basic Electron
```bash
npm run test
```
This should open a simple test window. If it doesn't work, Electron installation is the issue.

### Step 2: Check Dependencies
```bash
npm install
cd ..\frontend && npm install
cd ..\backend && pip install -r requirements.txt
```

### Step 3: Test Backend
```bash
cd ..\backend
python main.py
```
Should show "Uvicorn running on http://0.0.0.0:7005"

### Step 4: Test Frontend
```bash
cd ..\frontend
npm run dev
```
Should show "Local: http://localhost:7008" (or next available port)

### Step 5: Test Desktop App
```bash
cd ..\desktop
npm run dev
```

## Manual Testing

If the desktop app still doesn't work, try these manual steps:

1. **Start Backend Manually:**
   ```bash
   cd backend
   python main.py
   ```

2. **Start Frontend Manually:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open Browser:**
   Navigate to `http://localhost:7008` (or the port shown)

4. **If Browser Works:**
   The issue is with Electron integration, not the app itself.

## Alternative: Use Built Executable

If development mode doesn't work, try the built executable:

1. **Build the app:**
   ```bash
   npm run build:simple
   ```

2. **Run the executable:**
   ```bash
   .\dist\Todo Calendar 1.0.0.exe
   ```

## Getting Help

If none of these solutions work:

1. **Check the console output** for specific error messages
2. **Share the error messages** for further troubleshooting
3. **Try running in a clean environment** (new terminal, restart computer)
4. **Check Windows Event Viewer** for system-level errors

## System Requirements

- Windows 10 or later
- Node.js 16+ 
- Python 3.8+
- At least 4GB RAM
- 1GB free disk space

## Known Issues

- **Windows Defender:** May block the executable. Add exception or run as administrator.
- **Antivirus Software:** May flag Electron apps. Add to exclusions.
- **Firewall:** May block local connections. Allow the app through firewall.
- **UAC (User Account Control):** May require administrator privileges. 