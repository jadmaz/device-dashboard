#!/bin/bash

# Function to cleanup processes
cleanup() {
    echo "Cleaning up processes..."
    pkill -f "python3.*app.py"
    exit 0
}

# Clean up on script exit
trap cleanup EXIT
trap cleanup INT TERM

# Change to project directory
cd "$(dirname "$0")"

# Kill any existing Flask processes
echo "Checking for existing Flask processes..."
pkill -f "python3.*app.py"

# Start backend
echo "Starting backend server..."
source .venv/bin/activate
export FLASK_APP=backend/app.py
export FLASK_ENV=development
cd backend
nohup python3 app.py >/dev/null 2>&1 &

# Wait for backend to initialize
sleep 2

# Start frontend
echo "Starting frontend..."
cd ../frontend
nohup npm start >/dev/null 2>&1 &

# Exit immediately since we're running in background
exit 0