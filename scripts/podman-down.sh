#!/usr/bin/env bash
set -euo pipefail

# Rootful podman compose down WITHOUT removing volumes.

export COMPOSE_PROJECT_NAME=${COMPOSE_PROJECT_NAME:-nuaibria}

if ! command -v podman &>/dev/null; then
  echo "podman is required" >&2
  exit 1
fi
if [[ "${DRY_RUN:-0}" == "1" ]]; then
  echo "DRY_RUN: sudo -E podman compose down" >&2
else
  sudo -E podman compose down
fi
