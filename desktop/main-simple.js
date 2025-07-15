const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const Store = require('electron-store');

// Initialize store for app settings
const store = new Store();

let mainWindow;
let isDev = process.argv.includes('--dev');

// Configuration
const FRONTEND_URL = 'http://localhost:7008';
const BACKEND_URL = 'http://localhost:7005';

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'default',
    show: false, // Don't show until ready
    title: 'Todo Calendar'
  });

  // Load the app
  if (isDev) {
    // In development, load from the frontend dev server
    mainWindow.loadURL(FRONTEND_URL);
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the embedded frontend
    const frontendPath = path.join(process.resourcesPath, 'frontend', 'dist', 'index.html');
    if (require('fs').existsSync(frontendPath)) {
      mainWindow.loadFile(frontendPath);
    } else {
      // Fallback to loading from localhost if embedded files not found
      console.log('Embedded frontend not found, trying localhost...');
      mainWindow.loadURL(FRONTEND_URL);
    }
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Handle load failures
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorDescription);
    
    // Show a helpful error page
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Todo Calendar - Connection Error</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
            .error { color: #d32f2f; margin: 20px 0; }
            .instructions { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { background: #2196f3; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; }
          </style>
        </head>
        <body>
          <h1>Todo Calendar</h1>
          <div class="error">
            <h2>Connection Error</h2>
            <p>The app couldn't connect to the backend services.</p>
          </div>
          <div class="instructions">
            <h3>To run the app:</h3>
            <p><strong>Option 1:</strong> Start the backend and frontend manually:</p>
            <ol style="text-align: left; max-width: 500px; margin: 0 auto;">
              <li>Open a terminal and run: <code>cd backend && python main.py</code></li>
              <li>Open another terminal and run: <code>cd frontend && npm run dev</code></li>
              <li>Refresh this page</li>
            </ol>
            <p><strong>Option 2:</strong> Use the web version at <a href="http://localhost:7008">http://localhost:7008</a></p>
          </div>
          <button class="button" onclick="location.reload()">Retry Connection</button>
        </body>
      </html>
    `;
    
    mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(errorHtml));
  });
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Task',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('new-task');
          }
        },
        { type: 'separator' },
        {
          label: 'Refresh',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Todo Calendar',
          click: () => {
            mainWindow.webContents.send('show-about');
          }
        },
        {
          label: 'Open Web Version',
          click: () => {
            shell.openExternal('http://localhost:7008');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createMenu();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-backend-url', () => {
  return BACKEND_URL;
});

ipcMain.handle('get-frontend-url', () => {
  return FRONTEND_URL;
});

ipcMain.handle('is-development', () => {
  return isDev;
}); 