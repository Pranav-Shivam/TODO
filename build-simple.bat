@echo off
echo Building Todo Calendar Desktop Executable (Simple)...
echo.

REM Check if we're in the right directory
if not exist "desktop" (
    echo Error: desktop directory not found
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

REM Navigate to desktop directory and run simple build
cd desktop
npm run build:simple

if %errorlevel% equ 0 (
    echo.
    echo ✅ Build completed successfully!
    echo 📁 Check the desktop/dist/ directory for your executable files
    echo 📦 You can now distribute the .exe file to users
) else (
    echo.
    echo ❌ Build failed!
    echo Please check the error messages above
)

pause 