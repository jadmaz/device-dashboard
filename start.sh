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
python3 app.py &

# Wait for backend to initialize
sleep 2

# Start frontend
echo "Starting frontend..."
cd ../frontend
npm install
npm start &

# Keep script running
wait