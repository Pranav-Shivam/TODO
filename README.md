# 📅 Calendar-Integrated To-Do App

A lightweight, persistent to-do application with calendar integration built with React and FastAPI.

## ✨ Features

- **Task Management**: Create, update, and delete tasks with unique serial numbers
- **Status Tracking**: Not Started, In Progress, Completed
- **Calendar Integration**: Organize tasks by date with calendar view
- **Persistent Storage**: Local CouchDB storage that persists across reboots
- **Soft Delete**: Mark tasks as deleted while keeping them in the database
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **RESTful API**: FastAPI backend with automatic documentation

## 🏗️ Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: FastAPI + Python
- **Database**: CouchDB
- **Desktop**: Electron
- **Platform**: Cross-platform (Windows, macOS, Linux)

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- CouchDB (local installation)

**Note**: The backend uses a Python virtual environment for dependency isolation.

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd TODO
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

3. Install backend dependencies:
```bash
cd backend
python -m venv venv
# On Windows:
call venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
pip install -r requirements.txt
cd ..
```

4. Start CouchDB service on your system

5. Run the application:
```bash
# Start backend (in one terminal):
cd backend
python main.py

# Start frontend (in another terminal):
cd frontend
npm run dev
```

### URLs

- Frontend: http://localhost:7038
- Backend API: http://localhost:7035
- API Documentation: http://localhost:7035/docs

### Configuration

The application uses environment variables for configuration. See [CONFIGURATION.md](CONFIGURATION.md) for details on available options.

## 📱 Usage

### Web Version
1. **Add Tasks**: Click "New Task" to create new to-do items with descriptions and optional comments
2. **Calendar View**: Switch to calendar view to see tasks organized by date
3. **Status Management**: Update task status as you progress through your work
4. **Edit Tasks**: Click the edit icon to modify task details
5. **Delete Tasks**: Use soft delete (mark as deleted) or permanent delete
6. **Date Filtering**: Select dates to filter tasks for specific days

### Desktop Version
The desktop app provides the same functionality as the web version, plus:
- **Native Desktop Experience**: Runs as a native application
- **Automatic Backend Management**: No need to manually start services
- **Keyboard Shortcuts**: Quick access to common actions
- **System Integration**: Native menus and system tray support

## 🔧 Project Structure

```
├── backend/           # FastAPI backend
│   ├── main.py       # Main FastAPI application
│   ├── models/       # Data models (Task, TaskCreate, etc.)
│   ├── routes/       # API routes (tasks.py)
│   ├── database/     # CouchDB integration
│   └── requirements.txt
├── frontend/         # React frontend
│   ├── src/          # Source code
│   │   ├── components/   # React components
│   │   ├── services/     # API service layer
│   │   └── types/        # TypeScript type definitions
│   ├── package.json
│   └── vite.config.ts
├── desktop/          # Electron desktop app
│   ├── main.js       # Main Electron process
│   ├── preload.js    # Preload script
│   ├── package.json  # Desktop app configuration
│   └── assets/       # App icons and resources
└── INSTALLATION.md   # Detailed installation guide
```

## 🔌 API Endpoints

The backend provides a RESTful API with the following main endpoints:

- `GET /api/tasks` - Get all tasks with optional filtering
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/{id}` - Get a specific task
- `PUT /api/tasks/{id}` - Update a task
- `PATCH /api/tasks/{id}/status` - Update task status
- `PATCH /api/tasks/{id}/soft-delete` - Soft delete a task
- `DELETE /api/tasks/{id}` - Permanently delete a task
- `GET /api/tasks/by-date/{date}` - Get tasks for a specific date
- `GET /api/tasks/status/{status}` - Get tasks by status

## 🎨 Features in Detail

### Task Management
- **Serial Numbers**: Each task gets a unique serial number for easy reference
- **Status Tracking**: Three status levels: Not Started, In Progress, Completed
- **Due Dates**: Optional due dates for task scheduling
- **Comments**: Optional comments for additional task details

### Calendar Integration
- **Calendar View**: Visual calendar interface for task organization
- **Date Selection**: Click on dates to filter and view tasks
- **Date Filtering**: Filter tasks by specific dates or date ranges

### Data Persistence
- **CouchDB Storage**: All data is stored in CouchDB for reliability
- **Soft Delete**: Tasks can be marked as deleted without permanent removal
- **Automatic Saving**: All changes are automatically saved to the database

## 🛠️ Development

### Web Version

**Backend:**
```bash
cd backend
python main.py
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### Desktop Version

**Development Mode:**
```bash
cd desktop
npm install
npm run dev
```

**Production Mode:**
```bash
cd desktop
npm start
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

**Desktop App:**
```bash
cd desktop
npm run build:exe    # Windows executable (recommended)
npm run build:win    # Windows installer
npm run build:mac    # macOS
npm run build:linux  # Linux
```

**Quick Build (from project root):**
```bash
build-exe.bat        # Windows batch file
```

## 📄 License

MIT License 