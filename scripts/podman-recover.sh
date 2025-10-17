#!/usr/bin/env bash
set -euo pipefail

# Safe recovery for crun exec.fifo issues with rootful Podman Compose.
# - Stops stack
# - Removes ONLY containers for this compose project (keeps volumes and data)
# - Starts stack again

export COMPOSE_PROJECT_NAME=${COMPOSE_PROJECT_NAME:-project-chimera}

if ! command -v podman &>/dev/null; then
  echo "podman is required" >&2
  exit 1
fi

echo "[1/3] Stopping compose stack (no volume removal)" >&2
sudo -E podman compose down || true

echo "[2/3] Removing broken containers for project '${COMPOSE_PROJECT_NAME}' (preserving volumes)" >&2
mapfile -t IDS < <(sudo podman ps -a --filter "label=io.podman.compose.project=${COMPOSE_PROJECT_NAME}" -q || true)
if ((${#IDS[@]})); then
  sudo podman rm -f "${IDS[@]}"
else
  echo "No containers to remove." >&2
fi

echo "[3/3] Starting compose stack" >&2
sudo -E podman compose up -d

echo "Recovery complete." >&2

