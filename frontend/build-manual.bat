@echo off
echo Testing frontend build...
echo.

REM Clean previous build
if exist "dist" (
    echo Cleaning previous build...
    rmdir /s /q dist
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Try to install terser
echo Installing terser for better build compatibility...
npm install terser@^5.24.0

REM Try build
echo Building frontend...
npm run build

if %errorlevel% equ 0 (
    echo ✅ Build successful!
) else (
    echo ❌ Build failed!
    echo.
    echo Trying with simplified config...
    
    REM Backup current config
    copy vite.config.ts vite.config.ts.backup
    
    REM Use simplified config
    copy vite.config.simple.ts vite.config.ts
    
    REM Try build again
    npm run build
    
    if %errorlevel% equ 0 (
        echo ✅ Build successful with simplified config!
    ) else (
        echo ❌ Build still failed!
    )
    
    REM Restore original config
    copy vite.config.ts.backup vite.config.ts
    del vite.config.ts.backup
)

pause 