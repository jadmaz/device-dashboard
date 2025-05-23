#!/bin/bash

echo "Setting up Device Dashboard..."

# OS Detection
OS=""
PKG_MANAGER="" # For Linux

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    if command -v apt-get &> /dev/null; then
        PKG_MANAGER="apt"
        echo "Detected OS: Linux (Debian/Ubuntu-based)"
    elif command -v yum &> /dev/null; then
        PKG_MANAGER="yum" # Example for Fedora/CentOS
        echo "Detected OS: Linux (Fedora/RHEL-based)"
    elif command -v dnf &> /dev/null; then
        PKG_MANAGER="dnf" # Example for modern Fedora
        echo "Detected OS: Linux (Fedora-based with DNF)"
    else
        echo "Unsupported Linux package manager. Please install dependencies manually."
        # exit 1 # Or try to proceed with common commands
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
    echo "Detected OS: macOS"
    if ! command -v brew &> /dev/null; then
        echo "Homebrew not found. Please install Homebrew first: https://brew.sh/"
        exit 1
    fi
else
    echo "Unsupported OS: $OSTYPE. Please install dependencies manually."
    exit 1
fi

# --- OS-specific installations ---

if [[ "$OS" == "linux" ]]; then
    if [[ "$PKG_MANAGER" == "apt" ]]; then
        echo "Running Linux (Debian/Ubuntu) setup..."
        sudo apt update

        # Install Python
        if ! command -v python3 &> /dev/null || ! command -v pip3 &> /dev/null || ! python3 -m venv --help &> /dev/null; then
            echo "Installing Python3, pip3, and python3-venv..."
            sudo apt install -y python3 python3-pip python3-venv
        else
            echo "Python3, pip3, and python3-venv seem to be installed."
        fi

        # Install modern Node.js and npm from NodeSource
        echo "Ensuring modern Node.js LTS (e.g., 20.x) and npm are installed via NodeSource..."
        if ! command -v curl &> /dev/null; then
            echo "Installing curl..."
            sudo apt install -y curl
        fi
        # Node.js 20.x (LTS)
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt install -y nodejs

        # Install Firefox
        if ! command -v firefox &> /dev/null; then
            echo "Installing Firefox..."
            sudo apt install -y firefox
        else
            echo "Firefox already installed."
        fi
    elif [[ "$PKG_MANAGER" == "yum" ]] || [[ "$PKG_MANAGER" == "dnf" ]]; then
        echo "Running Linux (Fedora/RHEL-based) setup..."
        if [[ "$PKG_MANAGER" == "yum" ]]; then
            SUDO_PKG_CMD="sudo yum"
        else
            SUDO_PKG_CMD="sudo dnf"
        fi
        $SUDO_PKG_CMD update -y

        # Install Python
        if ! command -v python3 &> /dev/null || ! command -v pip3 &> /dev/null; then
            echo "Installing Python3, python3-pip, and python3-virtualenv..."
            $SUDO_PKG_CMD install -y python3 python3-pip python3-virtualenv # Adjust package names if necessary
        else
            echo "Python3 and pip3 seem to be installed."
        fi

        # Install modern Node.js and npm from NodeSource
        echo "Ensuring modern Node.js LTS (e.g., 20.x) and npm are installed via NodeSource..."
        if ! command -v curl &> /dev/null; then
            echo "Installing curl..."
            $SUDO_PKG_CMD install -y curl
        fi
        # Node.js 20.x (LTS) - For RPM based systems
        curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
        $SUDO_PKG_CMD install -y nodejs

        # Install Firefox
        if ! command -v firefox &> /dev/null; then
            echo "Installing Firefox..."
            $SUDO_PKG_CMD install -y firefox
        else
            echo "Firefox already installed."
        fi
    else
        echo "Skipping Linux package installation due to unsupported package manager: $PKG_MANAGER"
    fi

elif [[ "$OS" == "macos" ]]; then
    echo "Running macOS setup..."
    # Install Python
    if ! command -v python3 &> /dev/null || ! command -v pip3 &> /dev/null; then
        echo "Installing Python3..."
        brew install python@3.11 # Or a specific LTS version like python@3.9, python@3.11
    else
        echo "Python3 and pip3 seem to be installed."
    fi

    # Install Node.js
    NODE_LTS_FORMULA="node@20" # Specify LTS version
    if ! command -v node &> /dev/null || ! [[ $(node -v) == v20.* ]]; then
        echo "Installing/Updating Node.js LTS ($NODE_LTS_FORMULA)..."
        if ! brew list $NODE_LTS_FORMULA &>/dev/null; then
            brew install $NODE_LTS_FORMULA
        fi
        brew link --overwrite $NODE_LTS_FORMULA
    else
        echo "Node.js LTS (v20.x) seems to be installed and active."
    fi

    # Install Firefox
    if ! [ -d "/Applications/Firefox.app" ]; then
        echo "Installing Firefox..."
        brew install --cask firefox
    else
        echo "Firefox already installed."
    fi
fi

# --- Common setup steps ---

# Create Python virtual environment
echo "Creating Python virtual environment '.venv'..."
python3 -m venv .venv
if [ $? -ne 0 ]; then
    echo "Failed to create Python virtual environment. Please check your Python3 installation."
    exit 1
fi

echo "Activating virtual environment..."
source .venv/bin/activate
if [ $? -ne 0 ]; then
    echo "Failed to activate Python virtual environment."
    exit 1
fi

# Install backend dependencies
echo "Installing Python dependencies from backend/requirements.txt..."
if [ -f "backend/requirements.txt" ]; then
    pip install -r backend/requirements.txt
else
    echo "Warning: backend/requirements.txt not found. Skipping Python dependency installation."
fi

# Install frontend dependencies
echo "Installing Node.js dependencies from frontend/package.json..."
if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
    cd frontend
    npm install
    cd ..
else
    echo "Warning: frontend directory or frontend/package.json not found. Skipping Node.js dependency installation."
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating default .env file..."
    cat > .env << EOL
DEVICE_USERNAME=admin
DEVICE_PASSWORD=password
EOL
    echo "Default .env file created. Please review and update it with your actual device credentials."
else
    echo ".env file already exists."
fi

# Make start script executable
if [ -f "./start.sh" ]; then
    chmod +x ./start.sh
    echo "./start.sh is now executable."
else
    echo "Warning: ./start.sh not found. Cannot make it executable."
fi

echo ""
echo "Setup complete!"
echo "To start the application, run: ./start.sh"
echo "Remember to update the .env file with your device credentials if you haven't already."