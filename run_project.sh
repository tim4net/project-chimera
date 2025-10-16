#!/bin/bash

# run_project.sh - Script to build and run Project Chimera components

# Function to display usage
usage() {
  echo "Usage: $0 [frontend|backend] [dev|build|start|test]"
  echo "  frontend dev   : Run frontend in development mode"
  echo "  frontend build : Build frontend for production"
  echo "  backend dev    : Run backend in development mode"
  echo "  backend start  : Start backend in production mode"
  echo "  backend test   : Run backend tests"
  exit 1
}

# Check for arguments
if [ "$#" -lt 2 ]; then
  usage
fi

COMPONENT=$1
MODE=$2

case "$COMPONENT" in
  "frontend")
    cd frontend || { echo "Error: frontend directory not found."; exit 1; }
    case "$MODE" in
      "dev")
        echo "Running frontend in development mode..."
        npm install
        npm run dev
        ;;
      "build")
        echo "Building frontend for production..."
        npm install
        npm run build
        ;;
      *)
        usage
        ;;
    esac
    ;;
  "backend")
    cd backend || { echo "Error: backend directory not found."; exit 1; }
    case "$MODE" in
      "dev")
        echo "Running backend in development mode..."
        npm install
        npm run dev
        ;;
      "start")
        echo "Starting backend in production mode..."
        npm install
        npm run start
        ;;
      "test")
        echo "Running backend tests..."
        npm install
        npm run test
        ;;
      *)
        usage
        ;;
    esac
    ;;
  *)
    usage
    ;;
esac