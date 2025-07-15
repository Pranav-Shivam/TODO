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
2. **Install all dependencies**:
   ```bash
   npm install
   npm run install:all
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

### Working with the Virtual Environment
- All Python dependencies are installed in the virtual environment
- To deactivate: type `deactivate` in the terminal

## CouchDB Setup

### Manual Setup
1. Download CouchDB from https://couchdb.apache.org/#download
2. Install with default settings
3. Verify it's running at http://localhost:5984
4. No additional configuration needed - the app will create the database automatically

### Starting CouchDB Service
On Windows, you can start CouchDB service through:
1. Windows Services (services.msc)
2. Look for "Apache CouchDB" service
3. Start the service if it's not running

## Running the Application

### Development Mode
Start both backend and frontend in development mode:
```bash
npm run dev
```

This will start:
- Backend API at: http://localhost:7005
- Frontend app at: http://localhost:7008

### Individual Services

**Start Backend Only:**
```bash
cd backend
python main.py
```

**Start Frontend Only:**
```bash
cd frontend
npm run dev
```

## Usage

### Accessing the App
- **Development**: http://localhost:7008
- **API Documentation**: http://localhost:7005/docs

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

## Troubleshooting

### Common Issues

#### "Cannot connect to backend"
1. Check if backend is running on port 7005
2. Restart the backend: `cd backend && python main.py`
3. Check CouchDB is running at http://localhost:5984

#### "CouchDB connection failed"
1. Ensure CouchDB service is started
2. Manually start Apache CouchDB service in Windows Services
3. Verify CouchDB is accessible at http://localhost:5984

#### "Frontend not loading"
1. Check if frontend is running on port 7008
2. Restart the frontend: `cd frontend && npm run dev`
3. Clear browser cache and reload

#### "Dependencies not found"
1. Re-run the installation: `npm install && npm run install:all`
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

## Uninstalling

### Remove Application
1. Stop any running services
2. Delete the application folder
3. Optionally uninstall CouchDB

## Support

For issues or questions:
1. Check this installation guide
2. Review the main README.md
3. Check the troubleshooting section above

## API Documentation

When the backend is running, visit http://localhost:7005/docs for interactive API documentation.

---

**Enjoy your new Todo Calendar App! 📅✅** 