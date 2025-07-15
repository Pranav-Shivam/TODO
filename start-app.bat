@echo off
echo Starting Todo Calendar App...
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python from https://python.org/
    pause
    exit /b 1
)

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if CouchDB is running
netstat -an | findstr :5984 >nul
if %errorlevel% neq 0 (
    echo Warning: CouchDB doesn't seem to be running on port 5984
    echo Please start CouchDB service
    echo.
)

echo Starting backend...
start "Todo Calendar Backend" cmd /k "cd backend && python main.py"

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo Starting frontend...
start "Todo Calendar Frontend" cmd /k "cd frontend && npm run dev"

echo Waiting for frontend to start...
timeout /t 5 /nobreak >nul

echo.
echo ✅ Services started!
echo.
echo 🌐 Web App: http://localhost:7008
echo 📊 API Docs: http://localhost:7005/docs
echo.
echo 💡 Tip: You can also run the desktop app now:
echo    cd desktop && npm run dev
echo.
echo Press any key to open the web app...
pause >nul

start http://localhost:7008

echo.
echo 🎉 Todo Calendar App is now running!
echo Keep these terminal windows open while using the app.
echo.
pause 