#!/bin/bash

echo "Setting up Device Dashboard..."

# Check for Homebrew
if ! command -v brew &> /dev/null; then
    echo "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
    eval "$(/opt/homebrew/bin/brew shellenv)"
else
    echo "Homebrew already installed"
fi

# Install Python if not present
if ! command -v python3 &> /dev/null; then
    echo "Installing Python..."
    brew install python@3.9
else
    echo "Python already installed"
fi

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    brew install node
else
    echo "Node.js already installed"
fi

# Install Chrome if not present
if ! [ -d "/Applications/Google Chrome.app" ]; then
    echo "Installing Chrome..."
    brew install --cask google-chrome
else
    echo "Chrome already installed"
fi

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
chmod +x start.sh

echo "Setup complete! You can now run ./start.sh"