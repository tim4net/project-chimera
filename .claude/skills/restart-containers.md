---
name: restart-containers
description: Efficiently restart frontend and/or backend containers with optional rebuild
---

# Container Restart Skill

This skill provides efficient container restart operations for Nuaibria, with support for selective restarts and optional rebuilding.

## What this skill does

1. Allows restarting specific containers (frontend, backend, or all)
2. Stops specified containers cleanly
3. Optionally rebuilds container images
4. Starts containers in detached mode
5. Verifies containers are running
6. Shows status and recent logs

## Usage

Invoke this skill when:
- Containers are in a bad state or unresponsive
- Configuration changes were made (docker-compose.yml, Dockerfiles)
- Environment variables were updated (.env files)
- Code changes require a container restart
- You need to selectively restart one service without affecting the other

## Container Selection

The skill supports three modes:
- `all` (default): Restart both frontend and backend
- `frontend`: Restart only the frontend container
- `backend`: Restart only the backend container

## Steps

### 1. Determine which containers to restart

Parse user intent:
- "restart containers" / "restart all" → restart all
- "restart frontend" / "restart the frontend" → frontend only
- "restart backend" / "restart the backend" → backend only

### 2. Check if rebuild is needed

Look for indicators that suggest rebuild is necessary:
- "rebuild" mentioned in user request → yes
- "fresh build" / "clean build" → yes
- Dockerfile changes detected → ask user
- Otherwise → no rebuild (faster restart)

### 3. Stop containers

```bash
cd /srv/project-chimera

# For all containers
sudo -E podman compose down

# For specific container only
sudo -E podman compose stop <service-name>
sudo -E podman compose rm -f <service-name>
```

Where `<service-name>` is either `frontend` or `backend`.

### 4. Optional: Rebuild images

If rebuild is needed:

```bash
# Rebuild all services
sudo -E podman compose build --no-cache

# Rebuild specific service
sudo -E podman compose build --no-cache <service-name>
```

### 5. Start containers

```bash
# Start all containers
sudo -E podman compose up -d

# Start specific container
sudo -E podman compose up -d <service-name>
```

### 6. Verify containers are running

```bash
sudo -E podman compose ps
```

Expected output should show containers with "Up" status.

### 7. Show recent logs

```bash
# All container logs
sudo -E podman compose logs --tail=30

# Specific container logs
sudo -E podman compose logs --tail=30 <service-name>
```

### 8. Optional: Health check

For more detailed status:

```bash
# Check individual container health
sudo podman ps -a --filter "name=nuaibria"

# Check backend API health (if backend was restarted)
curl -f http://localhost:3001/health || echo "Backend health check failed"

# Check frontend (if frontend was restarted)
curl -f http://localhost:8080 -I || echo "Frontend health check failed"
```

## Example Workflows

### Quick restart (no rebuild) - All containers
```bash
cd /srv/project-chimera
sudo -E podman compose down
sudo -E podman compose up -d
sudo -E podman compose ps
sudo -E podman compose logs --tail=20
```

### Quick restart - Backend only
```bash
cd /srv/project-chimera
sudo -E podman compose stop backend
sudo -E podman compose rm -f backend
sudo -E podman compose up -d backend
sudo -E podman compose logs --tail=20 backend
```

### Full rebuild restart - Frontend only
```bash
cd /srv/project-chimera
sudo -E podman compose stop frontend
sudo -E podman compose rm -f frontend
sudo -E podman compose build --no-cache frontend
sudo -E podman compose up -d frontend
sudo -E podman compose ps
sudo -E podman compose logs --tail=20 frontend
```

## Important Notes

- **Always use `sudo -E`** to preserve environment variables with rootful podman
- **Service names** in docker-compose.yml are `frontend` and `backend`
- **Container names** are prefixed with project name: `nuaibria-frontend-1`, `nuaibria-backend-1`
- **Port mappings**: Frontend → 8080:80, Backend → 3001:3001
- **Dependencies**: Frontend depends on backend (starts after backend is up)
- **No-cache rebuilds**: Only use `--no-cache` when explicitly requested (slower but ensures fresh build)
- **Volume preservation**: `podman compose down` does NOT remove volumes (data is safe)

## Troubleshooting

If containers fail to start:
1. Check logs: `sudo -E podman compose logs`
2. Check environment variables: `sudo -E podman compose config` (shows resolved config)
3. Check port conflicts: `sudo ss -tlnp | grep -E '(8080|3001)'`
4. Check image build: `sudo podman images | grep nuaibria`
5. Try full cleanup: `sudo -E podman compose down --remove-orphans`

## Performance Tips

- **Fastest restart**: Stop/start specific service without rebuild (~5-10 seconds)
- **Standard restart**: Down/up without rebuild (~15-30 seconds)
- **Full rebuild**: Down/build/up (~2-5 minutes depending on changes)

Choose the appropriate method based on:
- No rebuild: Environment variable changes, minor config tweaks
- Rebuild: Code changes, dependency updates, Dockerfile modifications
