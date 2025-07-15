#!/bin/bash

echo "Setting up Todo Calendar Desktop App..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed or not in PATH"
    echo "Please install Python from https://python.org/"
    exit 1
fi

echo "Installing desktop dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "Error: Failed to install dependencies"
    exit 1
fi

echo
echo "Desktop app setup complete!"
echo
echo "To run the desktop app in development mode:"
echo "  npm run dev"
echo
echo "To run the desktop app in production mode:"
echo "  npm start"
echo 