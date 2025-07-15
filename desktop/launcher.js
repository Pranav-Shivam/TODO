const { spawn } = require('child_process');
const { app, BrowserWindow } = require('electron');
const path = require('path');

let backendProcess;
let frontendProcess;
let mainWindow;

function startBackend() {
  return new Promise((resolve, reject) => {
    console.log('Starting backend...');
    
    backendProcess = spawn('python', ['main.py'], {
      cwd: path.join(__dirname, '..', 'backend'),
      stdio: 'pipe',
      shell: true
    });

    backendProcess.stdout.on('data', (data) => {
      console.log('Backend:', data.toString());
      if (data.toString().includes('Uvicorn running')) {
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

    setTimeout(() => {
      console.log('Backend startup timeout, continuing...');
      resolve();
    }, 10000);
  });
}

function startFrontend() {
  return new Promise((resolve, reject) => {
    console.log('Starting frontend...');
    
    frontendProcess = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, '..', 'frontend'),
      stdio: 'pipe',
      shell: true
    });

    frontendProcess.stdout.on('data', (data) => {
      console.log('Frontend:', data.toString());
      if (data.toString().includes('Local:')) {
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

    setTimeout(() => {
      console.log('Frontend startup timeout, continuing...');
      resolve();
    }, 10000);
  });
}

function createWindow() {
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
    show: false,
    title: 'Todo Calendar'
  });

  mainWindow.loadURL('http://localhost:7008');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.on('did-fail-load', () => {
    console.log('Failed to load frontend, showing error page...');
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Todo Calendar - Starting...</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
            .loading { color: #2196f3; margin: 20px 0; }
            .instructions { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <h1>Todo Calendar</h1>
          <div class="loading">
            <h2>Starting Services...</h2>
            <p>Please wait while the backend and frontend services start.</p>
          </div>
          <div class="instructions">
            <h3>If the app doesn't load automatically:</h3>
            <p>1. Make sure CouchDB is running</p>
            <p>2. Try refreshing this page (Ctrl+R)</p>
            <p>3. Or open <a href="http://localhost:7008">http://localhost:7008</a> in your browser</p>
          </div>
          <script>
            setTimeout(() => {
              location.reload();
            }, 5000);
          </script>
        </body>
      </html>
    `;
    
    mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(errorHtml));
  });
}

app.whenReady().then(async () => {
  try {
    await startBackend();
    await startFrontend();
    createWindow();
  } catch (error) {
    console.error('Failed to start services:', error);
    createWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (backendProcess) backendProcess.kill();
    if (frontendProcess) frontendProcess.kill();
    app.quit();
  }
});

app.on('before-quit', () => {
  if (backendProcess) backendProcess.kill();
  if (frontendProcess) frontendProcess.kill();
}); 