#!/bin/bash

echo "Setting up Device Dashboard..."

# OS Detection
OS=""
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    # Specific Linux distribution detection (optional, but good for apt vs yum etc.)
    if command -v apt-get &> /dev/null; then
        PKG_MANAGER="apt"
    elif command -v yum &> /dev/null; then
        PKG_MANAGER="yum" # Example for Fedora/CentOS
    else
        echo "Unsupported Linux package manager. Please install dependencies manually."
        # exit 1 # Or try to proceed with common commands
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
    if ! command -v brew &> /dev/null; then
        echo "Homebrew not found. Please install Homebrew first: https://brew.sh/"
        exit 1
    fi
else
    echo "Unsupported OS: $OSTYPE. Please install dependencies manually."
    exit 1
fi

echo "Detected OS: $OS"

# --- OS-specific installations ---

if [[ "$OS" == "linux" ]]; then
    echo "Running Linux (Debian/Ubuntu) setup..."
    if [[ "$PKG_MANAGER" == "apt" ]]; then
        sudo apt update

        # Install Python if not present
        if ! command -v python3 &> /dev/null || ! command -v pip3 &> /dev/null || ! python3 -m venv --help &> /dev/null; then
            echo "Installing Python3, pip3, and venv..."
            sudo apt install -y python3 python3-pip python3-venv
        else
            echo "Python3, pip3, and venv seem to be installed."
        fi

        # Install Node.js and npm if not present
        if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
            echo "Installing Node.js and npm..."
            sudo apt install -y nodejs npm
        else
            echo "Node.js and npm seem to be installed."
        fi

        # Install Firefox if not present
        if ! command -v firefox &> /dev/null; then
            echo "Installing Firefox..."
            sudo apt install -y firefox
        else
            echo "Firefox already installed."
        fi
    else
        echo "Skipping Linux package installation due to unsupported package manager: $PKG_MANAGER"
    fi

elif [[ "$OS" == "macos" ]]; then
    echo "Running macOS setup..."
    # Install Python if not present (or ensure pip and venv are there)
    if ! command -v python3 &> /dev/null || ! command -v pip3 &> /dev/null; then
        echo "Installing Python3..."
        brew install python@3 # Or specific version like python@3.9
    else
        echo "Python3 seems to be installed."
    fi
    # Ensure pip and venv are available with the brew-installed Python

    # Install Node.js and npm if not present
    if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
        echo "Installing Node.js..."
        brew install node
    else
        echo "Node.js and npm seem to be installed."
    fi

    # Install Firefox if not present
    if ! [ -d "/Applications/Firefox.app" ]; then
        echo "Installing Firefox..."
        brew install --cask firefox
    else
        echo "Firefox already installed."
    fi
fi

# --- Common setup steps ---

# Create Python virtual environment
echo "Creating virtual environment..."
python3 -m venv .venv
source .venv/bin/activate

# Install backend dependencies
echo "Installing Python dependencies..."
cd backend
pip install -r requirements.txt
cd ..

# Install frontend dependencies
echo "Installing Node.js dependencies..."
cd frontend
npm install
cd ..

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating default .env file..."
    cat > .env << EOL
DEVICE_USERNAME=admin
DEVICE_PASSWORD=password
EOL
    echo "Please update .env with your credentials"
fi

# Make start script executable
if [ -f "./start.sh" ]; then
    chmod +x ./start.sh
fi

echo "Setup complete! You can now run ./start.sh (if it exists)."