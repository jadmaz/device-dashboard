#!/bin/bash

set -e  # Exit on any error

echo "Setting up Device Dashboard..."

# Check for Python
if ! command -v python3 &>/dev/null; then
    echo "Python 3.9+ not found. Please install Python 3.9+ from https://www.python.org/downloads/"
    xdg-open "https://www.python.org/downloads/"
    exit 1
fi

# Check for Node.js
if ! command -v node &>/dev/null; then
    echo "Node.js not found. Please install Node.js from https://nodejs.org/"
    xdg-open "https://nodejs.org/"
    exit 1
fi

# Check for Firefox
if ! command -v firefox &>/dev/null; then
    echo "Firefox not found. Please install Firefox from https://www.mozilla.org/firefox/"
    xdg-open "https://www.mozilla.org/firefox/"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
cd backend
pip install -r requirements.txt || { echo "Failed to install Python dependencies"; exit 1; }
cd ..

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
cd frontend
npm install || { echo "Failed to install Node.js dependencies"; exit 1; }
cd ..

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating default .env file..."
    cat > .env <<EOL
DEVICE_USERNAME=admin
DEVICE_PASSWORD=password
EOL
    echo "Please update the .env file with your credentials."
fi

echo "Setup complete! You can now run start.sh or npm start and python app.py as needed."
