@echo off
setlocal enabledelayedexpansion

:: Set working directory to script location
cd /d "%~dp0" >nul 2>&1

:: Check if setup has been done
if not exist ".venv" (
    echo Environment not set up. Please run setup.bat first
    exit /b 1
)

:: Activate virtual environment
call .venv\Scripts\activate.bat >nul 2>&1

:: Start backend in background
cd backend >nul 2>&1
start /B pythonw app.py > backend.log 2>&1

:: Wait for backend to initialize
timeout /t 2 /nobreak >nul

:: Start frontend in background
cd ../frontend >nul 2>&1
start /B cmd /c "npm start > frontend.log 2>&1"