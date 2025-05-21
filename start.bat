@echo off
setlocal enabledelayedexpansion

:: Change to the script's directory
cd /d "%~dp0"

:: Kill any existing Flask processes
echo Checking for existing Flask processes...
for /f "tokens=5" %%a in ('tasklist /fi "imagename eq pythonw.exe" /fo list ^| findstr "PID"') do taskkill /pid %%a /f >nul 2>&1

:: Activate virtual environment
echo Activating virtual environment...
call .venv\Scripts\activate.bat

:: Set environment variables
echo Setting environment variables...
set FLASK_APP=backend/app.py
set FLASK_ENV=development

:: Start backend
echo Starting backend server...
cd backend
start /B pythonw app.py

:: Wait for backend to initialize
timeout /t 2 /nobreak >nul

:: Start frontend
echo Starting frontend...
cd ../frontend
start /B cmd /c "npm start"

:: Exit script
exit /b 0