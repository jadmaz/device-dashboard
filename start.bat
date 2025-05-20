@echo off
setlocal enabledelayedexpansion

:: Set working directory to script location
cd /d "%~dp0"

:: Check if setup has been done
if not exist ".venv" (
    echo Environment not set up. Please run setup.bat first
    exit /b 1
)

:: Activate virtual environment
call .venv\Scripts\activate.bat

:: Start backend
echo Starting backend server...
cd backend
start /B pythonw app.py

:: Wait for backend to initialize
timeout /t 2 /nobreak >nul

:: Start frontend
echo Starting frontend...
cd ../frontend
start /B npm start