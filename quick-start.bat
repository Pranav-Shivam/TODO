@echo off
echo ========================================
echo    Todo Calendar Quick Start
echo ========================================
echo.

echo 🚀 Starting Todo Calendar App...
echo.

echo 1. Starting backend...
start "Backend" cmd /k "cd backend && python main.py"

echo 2. Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo 3. Starting frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo 4. Waiting for frontend to start...
timeout /t 8 /nobreak >nul

echo.
echo ========================================
echo ✅ App is starting up!
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
echo 🎉 Your Todo Calendar App should now be running!
echo.
echo 📝 Keep the terminal windows open while using the app.
echo.
pause 