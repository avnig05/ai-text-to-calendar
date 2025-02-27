#!/bin/bash

# place .env.local file in the root directory
# with the following content:
# NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
cd src/frontend || { echo "Frontend directory not found"; exit 1; }

if [ -f ".env.local" ]; then
    echo ".env.local file exists."
else
    echo ".env.local file does not exist."
    echo "writing .env file"
    echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:8000" > .env.local
fi

# Navigate to frontend directory and start the frontend server
echo "Starting Frontend Server..."
npm run dev &   # Run frontend in the background
FRONTEND_PID=$!  # Capture the frontend process ID
cd ..


# Navigate to backend directory and start the backend server
echo "Starting Backend Server..."
cd backend || { echo "Backend directory not found"; exit 1; }
uvicorn main:app --reload &   # Run backend in the background
BACKEND_PID=$!    # Capture the backend process ID
cd ..

# Function to handle script termination
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID
    wait $BACKEND_PID $FRONTEND_PID
    echo "Servers stopped."
    exit 0
}

# Trap termination signals (Ctrl+C, kill, etc.) and clean up
trap cleanup SIGINT SIGTERM

# Wait for both processes to finish
wait $BACKEND_PID $FRONTEND_PID