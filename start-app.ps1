Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Todo Calendar App Launcher" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "backend")) {
    Write-Host "❌ Error: backend directory not found" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

if (-not (Test-Path "frontend")) {
    Write-Host "❌ Error: frontend directory not found" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Python is available
Write-Host "Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python from https://python.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Node.js is available
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if CouchDB is running
Write-Host "Checking CouchDB..." -ForegroundColor Yellow
$couchdbRunning = netstat -an | Select-String ":5984" | Select-String "LISTENING"
if ($couchdbRunning) {
    Write-Host "✅ CouchDB is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: CouchDB doesn't seem to be running on port 5984" -ForegroundColor Yellow
    Write-Host "Please start CouchDB service or install it from https://couchdb.apache.org/" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host ""
Write-Host "🚀 Starting Todo Calendar App..." -ForegroundColor Cyan
Write-Host ""

# Start backend
Write-Host "1. Starting backend..." -ForegroundColor Yellow
$backendProcess = Start-Process -FilePath "cmd" -ArgumentList "/k", "cd backend && python main.py" -WindowStyle Normal -PassThru

Write-Host "2. Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start frontend
Write-Host "3. Starting frontend..." -ForegroundColor Yellow
$frontendProcess = Start-Process -FilePath "cmd" -ArgumentList "/k", "cd frontend && npm run dev" -WindowStyle Normal -PassThru

Write-Host "4. Waiting for frontend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ App is starting up!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Web App: http://localhost:7008" -ForegroundColor Blue
Write-Host "📊 API Docs: http://localhost:7005/docs" -ForegroundColor Blue
Write-Host ""
Write-Host "💡 Desktop App: cd desktop && npm run dev" -ForegroundColor Magenta
Write-Host ""

$response = Read-Host "Press Enter to open the web app, or 'n' to skip"
if ($response -ne "n") {
    Start-Process "http://localhost:7008"
}

Write-Host ""
Write-Host "🎉 Your Todo Calendar App should now be running!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Keep the terminal windows open while using the app." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit" 