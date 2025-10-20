#!/bin/bash
# Restart Nuaibria Containers
# Quick script to rebuild and restart both backend and frontend

echo "========================================================================="
echo "PROJECT CHIMERA - CONTAINER RESTART"
echo "========================================================================="
echo ""

cd /srv/nuaibria

echo "[1/3] Stopping containers..."
podman compose down

echo ""
echo "[2/3] Rebuilding and starting containers..."
podman compose up -d --build

echo ""
echo "[3/3] Checking status..."
podman compose ps

echo ""
echo "========================================================================="
echo "✓ CONTAINERS RESTARTED"
echo "========================================================================="
echo ""
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:8080"
echo ""
echo "To view logs:"
echo "  Backend:  podman compose logs -f backend"
echo "  Frontend: podman compose logs -f frontend"
echo ""
