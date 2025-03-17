#!/bin/bash

# Start the development environment for the Product Management System
echo "Starting the Product Management development environment..."

# Start the mock server in the background
echo "Starting the mock server..."
cd "$(dirname "$0")/mobile-app/mock-server"
npm install &> /dev/null
(node server.js > mock-server.log 2>&1) &
MOCK_SERVER_PID=$!
echo "Mock server started (PID: $MOCK_SERVER_PID). Logs written to mobile-app/mock-server/mock-server.log"

# Wait for the server to start
echo "Waiting for the server to initialize..."
sleep 3

# Start the mobile app
echo "Starting the Cordova mobile app in the browser..."
cd "$(dirname "$0")/mobile-app"
cordova run browser

# Cleanup when done
echo "Shutting down the mock server..."
kill $MOCK_SERVER_PID
echo "Done!" 