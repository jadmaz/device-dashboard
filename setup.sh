#!/bin/bash

echo "Setting up Device Dashboard..."

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "Python not found. Please install Python 3.9+ from your package manager"
    echo "For example: sudo apt-get install python3"
    exit 1
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Please install Node.js from https://nodejs.org/"
    xdg-open https://nodejs.org/
    exit 1
fi

# Check for Google Chrome
if ! command -v google-chrome &> /dev/null; then
    echo "Google Chrome not found. Please install Chrome from https://www.google.com/chrome/"
    xdg-open https://www.google.com/chrome/
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
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "Failed to install Python dependencies"
    exit 1
fi
cd ..

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install Node.js dependencies"
    exit 1
fi
cd ..

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating default .env file..."
    cat > .env << EOF
DEVICE_USERNAME=admin
DEVICE_PASSWORD=password
EOF
    echo "Please update the .env file with your credentials"
fi

echo "Setup complete!"