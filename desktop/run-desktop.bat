@echo off
echo Starting Todo Calendar Desktop App...
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo Error: package.json not found
    echo Please run this script from the desktop directory
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Start the desktop app
echo Starting desktop app in development mode...
echo This will open the Electron window
echo.
echo If the window doesn't appear, check the console for errors
echo.

npm run dev

echo.
echo Desktop app has been closed.
pause 