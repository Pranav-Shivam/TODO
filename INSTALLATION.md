# 📅 Todo Calendar App - Installation Guide

## Prerequisites

Before installing the Todo Calendar App, make sure you have the following installed:

### Required Software

1. **Node.js** (v16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **Python** (v3.8 or higher)
   - Download from: https://python.org/
   - Verify installation: `python --version`

3. **CouchDB** (for data persistence)
   - Download from: https://couchdb.apache.org/
   - Will be available at: http://localhost:5984

## Quick Installation

### Option 1: Automatic Setup (Recommended)

1. **Clone or download** the project to your computer
2. **Run the master setup script**:
   ```bash
   setup.bat
   ```
3. **Install CouchDB**:
   ```powershell
   powershell -ExecutionPolicy Bypass -File system\setup_couchdb.ps1
   ```

### Option 2: Manual Installation

1. **Install root dependencies**:
   ```bash
   npm install
   ```

2. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. **Install backend dependencies** (with virtual environment):
   ```bash
   cd backend
   python -m venv venv
   call venv\Scripts\activate
   pip install --upgrade pip
   pip install -r requirements.txt
   cd ..
   ```

4. **Install and start CouchDB** (see CouchDB Setup section below)

## Virtual Environment

The backend uses a Python virtual environment to isolate dependencies. This is automatically created during setup, but you can also manage it manually:

### Activating the Virtual Environment
```bash
cd backend
call venv\Scripts\activate
```

Or use the provided script:
```bash
cd backend
activate_venv.bat
```

### Working with the Virtual Environment
- All Python dependencies are installed in the virtual environment
- The system tray app automatically uses the virtual environment
- To deactivate: type `deactivate` in the terminal

## CouchDB Setup

### Automatic Setup
Run the CouchDB setup script:
```powershell
powershell -ExecutionPolicy Bypass -File system\setup_couchdb.ps1
```

### Manual Setup
1. Download CouchDB from https://couchdb.apache.org/#download
2. Install with default settings
3. Verify it's running at http://localhost:5984
4. No additional configuration needed - the app will create the database automatically

## Running the Application

### Development Mode
Start both backend and frontend in development mode:
```bash
npm run dev
```

This will start:
- Backend API at: http://localhost:7005
- Frontend app at: http://localhost:7008

### System Tray Mode (Auto-startup)
Run as a background system tray application:

**Option 1 - Using helper script (easiest):**
```bash
run_system_tray.bat
```

**Option 2 - Manual:**
```bash
cd backend
python system_tray.py
```

**Note**: The `system_tray.py` file is located in the `backend` directory, not the `system` directory.

## Auto-Startup Configuration

To make the app start automatically with Windows:

1. **Run the startup configuration script**:
   ```bash
   system\setup_startup.bat
   ```

2. **Choose option 1** to add to Windows startup

3. **Alternatively**, use the command line:
   ```bash
   python backend\system_tray.py --add-startup
   ```

## Usage

### Accessing the App
- **Development**: http://localhost:7008
- **System Tray**: Right-click the calendar icon and select "Open Todo App"

### Features

#### Task Management
- **Create Tasks**: Click "New Task" or use the calendar
- **Edit Tasks**: Click the edit icon on any task
- **Delete Tasks**: Click the trash icon
- **Change Status**: Use the dropdown menu (Not Started → In Progress → Completed)

#### Calendar Integration
- **Calendar View**: Switch between Tasks and Calendar views
- **Date Selection**: Click on dates to filter tasks
- **Quick Date**: Use the sidebar for quick navigation

#### Data Persistence
- All data is automatically saved to CouchDB
- Data persists across app restarts and system reboots
- No manual saving required

### System Tray Functions
- **Open App**: Launch the web interface
- **Start/Stop Services**: Control backend and frontend
- **Status**: Check if services are running
- **Quit**: Stop all services and exit

## Troubleshooting

### Common Issues

#### "Cannot connect to backend"
1. Check if backend is running on port 7005
2. Restart the backend: `npm run dev:backend`
3. Check CouchDB is running at http://localhost:5984

#### "CouchDB connection failed"
1. Ensure CouchDB service is started
2. Run: `powershell -File system\setup_couchdb.ps1`
3. Manually start Apache CouchDB service in Windows Services

#### "Frontend not loading"
1. Check if frontend is running on port 7008
2. Restart the frontend: `npm run dev:frontend`
3. Clear browser cache and reload

#### "Dependencies not found"
1. Re-run the setup: `setup.bat`
2. Check Node.js and Python are in your PATH
3. Ensure virtual environment is activated: `cd backend && call venv\Scripts\activate`
4. Try installing dependencies manually in the virtual environment

### Port Configuration
If you need to change default ports:
- **Backend**: Edit `backend/main.py` (port 7005)
- **Frontend**: Edit `frontend/vite.config.ts` (port 7008)
- **CouchDB**: Default is 5984, configurable in CouchDB settings

### Logs and Debugging
- **Backend logs**: Check terminal where backend is running
- **Frontend logs**: Check browser console (F12)
- **System tray logs**: Check terminal where system_tray.py is running

## Uninstalling

### Remove from Startup
```bash
python backend\system_tray.py --remove-startup
```

### Remove Application
1. Remove from Windows startup (if configured)
2. Stop any running services
3. Delete the application folder
4. Optionally uninstall CouchDB

## Support

For issues or questions:
1. Check this installation guide
2. Review the main README.md
3. Check the troubleshooting section above

## API Documentation

When the backend is running, visit http://localhost:7005/docs for interactive API documentation.

---

**Enjoy your new Todo Calendar App! 📅✅** 