#!/usr/bin/env bash
set -euo pipefail

# Rootful podman compose up without rebuilding unless --build is passed.
# Never removes volumes; safe for databases.

export COMPOSE_PROJECT_NAME=${COMPOSE_PROJECT_NAME:-nuaibria}

if ! command -v podman &>/dev/null; then
  echo "podman is required" >&2
  exit 1
fi

# Ensure correct rootful socket path for services that tail the engine socket
export DOCKER_SOCKET_LOCATION=${DOCKER_SOCKET_LOCATION:-/run/podman/podman.sock}

args=("up" "-d")
for arg in "$@"; do
  if [[ "$arg" == "--build" ]]; then
    args=("build"); break
  fi
done

if [[ "${DRY_RUN:-0}" == "1" ]]; then
  echo "DRY_RUN: sudo -E podman compose ${args[*]}" >&2
else
  sudo -E podman compose "${args[@]}"
fi
