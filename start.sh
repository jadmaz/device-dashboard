#!/bin/bash


echo "Starting Device Dashboard..."


# Activate Python virtual environment
if [ -d ".venv" ]; then
   source .venv/bin/activate
   echo "Virtual environment activated."
else
   echo "Error: .venv not found. Please run the setup script first."
   exit 1
fi


# Start backend (Flask API)
echo "Starting backend (Flask API)..."
python backend/app.py &
BACKEND_PID=$!


# Start frontend (React app)
if [ -f "frontend/package.json" ]; then
   echo "Starting frontend (React app)..."
   cd frontend
   npm start &
   FRONTEND_PID=$!
   cd ..
else
   echo "Warning: frontend/package.json not found. Skipping frontend."
fi


# Wait for both processes
echo ""
echo "Both backend and frontend are running. Press Ctrl+C to stop."


# Trap Ctrl+C to stop both
trap "echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT


# Wait indefinitely
wait