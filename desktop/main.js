const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const Store = require('electron-store');

// Initialize store for app settings
const store = new Store();

let mainWindow;
let backendProcess;
let frontendProcess;
let isDev = process.argv.includes('--dev');

// Backend configuration
const BACKEND_PORT = 7005;
let FRONTEND_PORT = 7008; // Will be updated dynamically
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;
let FRONTEND_URL = `http://localhost:${FRONTEND_PORT}`;

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
    
    // Handle load failures
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Failed to load frontend:', errorDescription);
      console.log('Trying alternative ports...');
      
      // Try alternative ports
      const alternativePorts = [7009, 7010, 7011, 7012];
      let currentPortIndex = 0;
      
      const tryNextPort = () => {
        if (currentPortIndex < alternativePorts.length) {
          const port = alternativePorts[currentPortIndex];
          const url = `http://localhost:${port}`;
          console.log(`Trying port ${port}...`);
          mainWindow.loadURL(url);
          currentPortIndex++;
        } else {
          // Try to load the built frontend as fallback
          const fallbackPath = path.join(__dirname, '..', 'frontend', 'dist', 'index.html');
          if (require('fs').existsSync(fallbackPath)) {
            console.log('Loading built frontend as fallback...');
            mainWindow.loadFile(fallbackPath);
          } else {
            console.error('No fallback frontend available');
            mainWindow.loadURL('data:text/html,<h1>Error</h1><p>Frontend not available</p>');
          }
        }
      };
      
      mainWindow.webContents.once('did-fail-load', tryNextPort);
      tryNextPort();
    });
  } else {
    // In production, load the embedded frontend
    const frontendPath = path.join(process.resourcesPath, 'frontend', 'dist', 'index.html');
    if (require('fs').existsSync(frontendPath)) {
      mainWindow.loadFile(frontendPath);
    } else {
      console.error('Embedded frontend not found:', frontendPath);
      // Show error page
      mainWindow.loadURL('data:text/html,<h1>Error</h1><p>Frontend files not found</p>');
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
}

function startBackend() {
  return new Promise((resolve, reject) => {
    // In production, backend is embedded in the app
    const backendPath = isDev 
      ? path.join(__dirname, '..', 'backend')
      : path.join(process.resourcesPath, 'backend');
    console.log('Backend path:', backendPath);
    
    // Check if backend directory exists
    if (!require('fs').existsSync(backendPath)) {
      reject(new Error(`Backend directory not found: ${backendPath}`));
      return;
    }

    // Check if virtual environment exists
    const venvPath = path.join(backendPath, 'venv');
    const venvScriptsPath = path.join(venvPath, 'Scripts');
    const venvBinPath = path.join(venvPath, 'bin');
    
    if (!require('fs').existsSync(venvPath)) {
      console.log('Virtual environment not found, creating...');
      // Create virtual environment if it doesn't exist
      const createVenv = spawn('python', ['-m', 'venv', 'venv'], {
        cwd: backendPath,
        stdio: 'pipe',
        shell: true
      });
      
      createVenv.on('close', (code) => {
        if (code === 0) {
          console.log('Virtual environment created successfully');
          installDependenciesAndStart();
        } else {
          reject(new Error('Failed to create virtual environment'));
        }
      });
    } else {
      installDependenciesAndStart();
    }

    function installDependenciesAndStart() {
      // Install dependencies
      const pipPath = process.platform === 'win32' 
        ? path.join(venvScriptsPath, 'pip.exe')
        : path.join(venvBinPath, 'pip');
      
      const installProcess = spawn(pipPath, ['install', '-r', 'requirements.txt'], {
        cwd: backendPath,
        stdio: 'pipe',
        shell: true
      });

      installProcess.on('close', (code) => {
        if (code === 0) {
          console.log('Dependencies installed successfully');
          startPythonBackend();
        } else {
          reject(new Error('Failed to install dependencies'));
        }
      });
    }

    function startPythonBackend() {
      // Start the Python backend
      const pythonPath = process.platform === 'win32' 
        ? path.join(venvScriptsPath, 'python.exe')
        : path.join(venvBinPath, 'python');
      
      console.log('Starting backend with Python:', pythonPath);
      
      backendProcess = spawn(pythonPath, ['main.py'], {
        cwd: backendPath,
        stdio: 'pipe',
        shell: true
      });

      backendProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('Backend:', output);
        if (output.includes('Uvicorn running') || output.includes('Application startup complete')) {
          resolve();
        }
      });

      backendProcess.stderr.on('data', (data) => {
        console.error('Backend Error:', data.toString());
      });

      backendProcess.on('error', (error) => {
        console.error('Failed to start backend:', error);
        reject(error);
      });

      // Timeout after 15 seconds
      setTimeout(() => {
        reject(new Error('Backend startup timeout'));
      }, 15000);
    }
  });
}

function startFrontend() {
  return new Promise((resolve, reject) => {
    const frontendPath = path.join(__dirname, '..', 'frontend');
    console.log('Frontend path:', frontendPath);
    
    // Check if frontend directory exists
    if (!require('fs').existsSync(frontendPath)) {
      reject(new Error(`Frontend directory not found: ${frontendPath}`));
      return;
    }

    // Check if node_modules exists, if not install dependencies
    const nodeModulesPath = path.join(frontendPath, 'node_modules');
    if (!require('fs').existsSync(nodeModulesPath)) {
      console.log('Frontend dependencies not found, installing...');
      const installProcess = spawn('npm', ['install'], {
        cwd: frontendPath,
        stdio: 'pipe',
        shell: true
      });

      installProcess.on('close', (code) => {
        if (code === 0) {
          console.log('Frontend dependencies installed successfully');
          startFrontendDev();
        } else {
          reject(new Error('Failed to install frontend dependencies'));
        }
      });
    } else {
      startFrontendDev();
    }

    function startFrontendDev() {
      console.log('Starting frontend development server...');
      
      frontendProcess = spawn('npm', ['run', 'dev'], {
        cwd: frontendPath,
        stdio: 'pipe',
        shell: true
      });

      frontendProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('Frontend:', output);
        
        // Extract port from Vite output
        const portMatch = output.match(/Local:\s*http:\/\/localhost:(\d+)/);
        if (portMatch) {
          const detectedPort = parseInt(portMatch[1]);
          FRONTEND_PORT = detectedPort;
          FRONTEND_URL = `http://localhost:${detectedPort}`;
          console.log(`Frontend detected on port ${detectedPort}`);
          resolve();
        } else if (output.includes('ready in')) {
          // If we can't detect the port, assume it's running
          resolve();
        }
      });

      frontendProcess.stderr.on('data', (data) => {
        console.error('Frontend Error:', data.toString());
      });

      frontendProcess.on('error', (error) => {
        console.error('Failed to start frontend:', error);
        reject(error);
      });

      // Timeout after 15 seconds
      setTimeout(() => {
        reject(new Error('Frontend startup timeout'));
      }, 15000);
    }
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
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(async () => {
  try {
    if (isDev) {
      console.log('Starting backend...');
      try {
        await startBackend();
        console.log('Backend started successfully');
      } catch (backendError) {
        console.error('Failed to start backend:', backendError.message);
        console.log('Continuing without backend...');
      }
      
      console.log('Starting frontend...');
      try {
        await startFrontend();
        console.log('Frontend started successfully');
      } catch (frontendError) {
        console.error('Failed to start frontend:', frontendError.message);
        console.log('Continuing without frontend dev server...');
      }
    }
    
    createWindow();
    createMenu();
  } catch (error) {
    console.error('Failed to start app:', error);
    // Don't quit the app, let it start anyway
    createWindow();
    createMenu();
  }
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

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  if (frontendProcess) {
    frontendProcess.kill();
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