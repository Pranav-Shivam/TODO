@echo off
echo ========================================
echo    Todo Calendar App Launcher
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "backend" (
    echo Error: backend directory not found
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

if not exist "frontend" (
    echo Error: frontend directory not found
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

REM Check if Python is available
echo Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Python is not installed or not in PATH
    echo Please install Python from https://python.org/
    pause
    exit /b 1
)
echo ✅ Python found

REM Check if Node.js is available
echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js found

REM Check if CouchDB is running
echo Checking CouchDB...
netstat -an | findstr :5984 >nul
if %errorlevel% neq 0 (
    echo ⚠️  Warning: CouchDB doesn't seem to be running on port 5984
    echo Please start CouchDB service or install it from https://couchdb.apache.org/
    echo.
)

echo.
echo 🚀 Starting Todo Calendar App...
echo.

REM Start backend
echo Starting backend...
start "Todo Calendar Backend" cmd /k "cd /d %~dp0backend && python main.py"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

REM Start frontend
echo Starting frontend...
start "Todo Calendar Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo Waiting for frontend to start...
timeout /t 8 /nobreak >nul

echo.
echo ========================================
echo ✅ Services started successfully!
echo ========================================
echo.
echo 🌐 Web App: http://localhost:7008
echo 📊 API Docs: http://localhost:7005/docs
echo.
echo 💡 Desktop App: cd desktop && npm run dev
echo.
echo Press any key to open the web app...
pause >nul

start http://localhost:7008

echo.
echo 🎉 Todo Calendar App is now running!
echo.
echo 📝 Instructions:
echo - Keep the terminal windows open while using the app
echo - The web app will open automatically in your browser
echo - To stop the app, close the terminal windows
echo.
pause 