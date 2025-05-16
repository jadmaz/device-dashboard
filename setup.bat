@echo off
setlocal enabledelayedexpansion

echo Setting up Device Dashboard...

:: Check for Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python not found. Please install Python 3.9+ from https://www.python.org/downloads/
    start https://www.python.org/downloads/
    pause
    exit /b 1
)

:: Check for Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js not found. Please install Node.js from https://nodejs.org/
    start https://nodejs.org/
    pause
    exit /b 1
)

:: Check for Chrome
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" >nul 2>&1
if %errorlevel% neq 0 (
    echo Chrome not found. Please install Chrome from https://www.google.com/chrome/
    start https://www.google.com/chrome/
    pause
    exit /b 1
)

:: Create virtual environment if it doesn't exist
if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
)

:: Activate virtual environment
call .venv\Scripts\activate.bat

:: Install Python dependencies
echo Installing Python dependencies...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Failed to install Python dependencies
    pause
    exit /b 1
)
cd ..

:: Install Node.js dependencies
echo Installing Node.js dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo Failed to install Node.js dependencies
    pause
    exit /b 1
)
cd ..

:: Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating default .env file...
    (
        echo DEVICE_USERNAME=admin
        echo DEVICE_PASSWORD=password
    ) > .env
    echo Please update the .env file with your credentials
)

echo Setup complete! You can now run start.bat
pause