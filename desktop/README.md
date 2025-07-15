# 🖥️ Todo Calendar Desktop App

Desktop version of the Todo Calendar App built with Electron.

## Features

- **Native Desktop Experience**: Runs as a native desktop application
- **Automatic Backend Management**: Automatically starts and manages the FastAPI backend
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Native Menus**: Desktop-native menus with keyboard shortcuts
- **Auto-Startup**: Can be configured to start with the system
- **Offline Capable**: Works offline with local CouchDB storage

## Prerequisites

Before running the desktop app, ensure you have:

1. **Node.js** (v16 or higher)
2. **Python** (v3.8 or higher)
3. **CouchDB** installed and running
4. **Frontend and Backend** dependencies installed

## Installation

### 1. Install Desktop Dependencies

```bash
cd desktop
npm install
```

### 2. Build Frontend for Production (Optional)

If you want to run the desktop app in production mode:

```bash
cd ../frontend
npm run build
```

## Development

### Running in Development Mode

```bash
cd desktop
npm run dev
```

This will:
- Start the FastAPI backend automatically
- Start the frontend development server
- Launch the Electron app
- Open DevTools for debugging

### Running in Production Mode

```bash
cd desktop
npm start
```

This will:
- Load the built frontend from `../frontend/dist`
- Start the backend automatically
- Launch the Electron app

## Building Distributables

### Windows

```bash
npm run build:win
```

### macOS

```bash
npm run build:mac
```

### Linux

```bash
npm run build:linux
```

### All Platforms

```bash
npm run build
```

## Configuration

### Backend Settings

The desktop app automatically manages the backend. You can modify the backend configuration in `main.js`:

```javascript
const BACKEND_PORT = 7005;
const FRONTEND_PORT = 7008;
```

### App Settings

The app uses `electron-store` for persistent settings. Settings are stored in:

- **Windows**: `%APPDATA%/todo-calendar-desktop/config.json`
- **macOS**: `~/Library/Application Support/todo-calendar-desktop/config.json`
- **Linux**: `~/.config/todo-calendar-desktop/config.json`

## Keyboard Shortcuts

- `Ctrl+N` (Windows/Linux) / `Cmd+N` (macOS): New Task
- `Ctrl+Q` (Windows/Linux) / `Cmd+Q` (macOS): Quit App
- `F12`: Toggle DevTools (development mode)

## Troubleshooting

### Backend Won't Start

1. Ensure Python virtual environment exists:
   ```bash
   cd ../backend
   python -m venv venv
   ```

2. Install backend dependencies:
   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

3. Check CouchDB is running:
   - Windows: Check Services for "Apache CouchDB"
   - macOS/Linux: `brew services list` or `systemctl status couchdb`

### Frontend Won't Load

1. Ensure frontend dependencies are installed:
   ```bash
   cd ../frontend
   npm install
   ```

2. Check if frontend dev server is running on port 7008

### App Won't Launch

1. Check Node.js version: `node --version`
2. Reinstall dependencies: `npm install`
3. Clear Electron cache: Delete `%APPDATA%/todo-calendar-desktop` (Windows) or equivalent

## Development Notes

### Architecture

- **Main Process**: Manages app lifecycle, backend processes, and native menus
- **Renderer Process**: Runs the React frontend
- **Preload Script**: Provides secure communication between processes

### File Structure

```
desktop/
├── main.js           # Main Electron process
├── preload.js        # Preload script for renderer
├── package.json      # Desktop app configuration
├── assets/           # App icons and resources
└── README.md         # This file
```

### Adding Features

To add new desktop features:

1. **Main Process** (`main.js`): Add IPC handlers and menu items
2. **Preload Script** (`preload.js`): Expose new APIs to renderer
3. **Frontend**: Use `window.electronAPI` to access desktop features

## License

MIT License 