# Desktop App Debug Script
# This script helps diagnose issues with the desktop app

Write-Host "=== Desktop App Debug Script ===" -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
$currentDir = Get-Location
Write-Host "Current directory: $currentDir" -ForegroundColor Yellow

# Check if package.json exists
if (Test-Path "package.json") {
    Write-Host "✓ package.json found" -ForegroundColor Green
} else {
    Write-Host "✗ package.json not found" -ForegroundColor Red
    Write-Host "Please run this script from the desktop directory" -ForegroundColor Red
    exit 1
}

# Check if main.js exists
if (Test-Path "main.js") {
    Write-Host "✓ main.js found" -ForegroundColor Green
} else {
    Write-Host "✗ main.js not found" -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (Test-Path "node_modules") {
    Write-Host "✓ node_modules found" -ForegroundColor Green
} else {
    Write-Host "✗ node_modules not found" -ForegroundColor Red
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if backend directory exists
$backendPath = "..\backend"
if (Test-Path $backendPath) {
    Write-Host "✓ Backend directory found" -ForegroundColor Green
} else {
    Write-Host "✗ Backend directory not found" -ForegroundColor Red
    Write-Host "Backend path: $backendPath" -ForegroundColor Yellow
}

# Check if frontend directory exists
$frontendPath = "..\frontend"
if (Test-Path $frontendPath) {
    Write-Host "✓ Frontend directory found" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend directory not found" -ForegroundColor Red
    Write-Host "Frontend path: $frontendPath" -ForegroundColor Yellow
}

# Check if frontend is built
$frontendDistPath = "..\frontend\dist"
if (Test-Path $frontendDistPath) {
    Write-Host "✓ Frontend dist directory found" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend dist directory not found" -ForegroundColor Red
    Write-Host "Frontend needs to be built first" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Testing Desktop App ===" -ForegroundColor Green

# Try to start the app in development mode
Write-Host "Starting desktop app in development mode..." -ForegroundColor Yellow
Write-Host "This will open the Electron app window" -ForegroundColor Yellow
Write-Host ""

try {
    # Start the app
    $process = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -NoNewWindow
    
    Write-Host "Desktop app started with PID: $($process.Id)" -ForegroundColor Green
    Write-Host "Check for the Electron window to appear..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "If the window doesn't appear, check the console output above" -ForegroundColor Cyan
    Write-Host "Common issues:" -ForegroundColor Cyan
    Write-Host "1. Backend not starting (check Python/venv)" -ForegroundColor Cyan
    Write-Host "2. Frontend not built (run 'npm run build' in frontend directory)" -ForegroundColor Cyan
    Write-Host "3. Port conflicts (check if ports 7005/7008 are in use)" -ForegroundColor Cyan
    
    # Wait a bit and check if process is still running
    Start-Sleep -Seconds 5
    if ($process.HasExited) {
        Write-Host "✗ Desktop app process exited unexpectedly" -ForegroundColor Red
    } else {
        Write-Host "✓ Desktop app process is still running" -ForegroundColor Green
    }
    
} catch {
    Write-Host "✗ Failed to start desktop app: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Alternative: Try the built executable ===" -ForegroundColor Green
if (Test-Path "dist\Todo Calendar 1.0.0.exe") {
    Write-Host "✓ Built executable found" -ForegroundColor Green
    Write-Host "You can also try running: .\dist\Todo Calendar 1.0.0.exe" -ForegroundColor Yellow
} else {
    Write-Host "✗ Built executable not found" -ForegroundColor Red
    Write-Host "Build it with: npm run build:simple" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Manual Testing Steps ===" -ForegroundColor Green
Write-Host "1. Open a new PowerShell window" -ForegroundColor Cyan
Write-Host "2. Navigate to the desktop directory: cd E:\Work\Product\TODO\desktop" -ForegroundColor Cyan
Write-Host "3. Run: npm run dev" -ForegroundColor Cyan
Write-Host "4. Look for any error messages in the console" -ForegroundColor Cyan
Write-Host "5. Check if an Electron window appears" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you see errors, please share them for further troubleshooting" -ForegroundColor Yellow 