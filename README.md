# 📅 Calendar-Integrated To-Do App

A lightweight, persistent to-do application with calendar integration that runs on system startup.

## ✨ Features

- **Task Management**: Create, update, and delete tasks with unique serial numbers
- **Status Tracking**: Not Started, In Progress, Completed
- **Calendar Integration**: Organize tasks by date with week/day view
- **Persistent Storage**: Local CouchDB storage that persists across reboots
- **Auto-Startup**: Automatically starts with your system
- **System Tray**: Runs in background as system tray application
- **Modern UI**: Built with React and responsive design

## 🏗️ Tech Stack

- **Frontend**: React + Vite
- **Backend**: FastAPI
- **Database**: CouchDB
- **Platform**: Windows (with cross-platform potential)

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- CouchDB (local installation)

**Note**: The backend uses a Python virtual environment for dependency isolation.

### Installation

1. Clone and install dependencies:
```bash
npm install
npm run install:all
```

2. Start CouchDB service on your system

3. Run the application:
```bash
npm run dev
```

### URLs

- Frontend: http://localhost:7008
- Backend API: http://localhost:7005
- API Documentation: http://localhost:7005/docs

## 📱 Usage

1. **Add Tasks**: Create new to-do items with descriptions and optional comments
2. **Calendar View**: Select dates and view tasks organized by day
3. **Status Management**: Update task status as you progress
4. **Persistence**: All data is automatically saved and restored on restart

## 🔧 Project Structure

```
├── backend/           # FastAPI backend
│   ├── main.py       # Main FastAPI application
│   ├── models/       # Data models
│   ├── routes/       # API routes
│   └── database/     # CouchDB integration
├── frontend/         # React frontend
│   ├── src/          # Source code
│   ├── components/   # React components
│   └── pages/        # Application pages
└── system/           # System integration scripts
```

## 🔄 Auto-Startup Configuration

The app includes Windows auto-startup configuration to run on system boot as a background service.

## 📄 License

MIT License 