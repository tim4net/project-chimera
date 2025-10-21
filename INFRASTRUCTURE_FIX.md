# Infrastructure Fix: 502 Bad Gateway Resolution

## Problem Analysis

The application was returning **502 Bad Gateway** errors when accessed through the public domain `nuaibria.tfour.net`, while working fine on `localhost:3001`.

### Root Cause

**Port Misconfiguration**:
- Frontend container exposed on port **8080** only
- Cloudflare/public domain expects HTTP traffic on port **80** (standard)
- **No service** was listening on port 80
- Result: Connection refused, Cloudflare returns 502 Bad Gateway

### Infrastructure Topology

```
User (via nuaibria.tfour.net)
    ↓ (Cloudflare DNS)
    ↓ (attempts port 80)
Host Server (Port 80 - NO LISTENER) ✗ 502 Error
    ↑ ← (iptables REDIRECT 80→8080)
    ↓
Docker/Podman Container: frontend (port 8080)
    ↓
Nginx (container) routes /api → backend:3001
    ↓
Backend Container (port 3001)
```

## Solution Implemented

### Port Forwarding via iptables

Since rootless Podman cannot bind to privileged ports (< 1024), we use **iptables NAT rules** to forward incoming traffic:

```bash
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
```

**How it works:**
- ✅ External traffic on port 80 is redirected to 8080
- ✅ Frontend container receives traffic and responds
- ✅ No privilege escalation needed for app itself
- ⚠️ Rules are temporary (lost on reboot) - see Persistence section

### Internal Networking Verification

```
✅ Container-to-Container: frontend → backend
   - Resolved 10.89.0.7:3001
   - Health check passed

✅ Frontend Nginx Config
   - proxy_pass http://backend:3001 (internal routing)
   - Correct headers forwarding
   - 600s timeout for LLM responses

✅ Frontend on Port 8080
   - curl localhost:8080/health → 200 OK
   - Static assets serving correctly
   - SPA routes configured
```

## Making Port Forwarding Persistent

### Option 1: Using firewalld (Recommended)

```bash
sudo firewall-cmd --permanent --add-forward-port=port=80:proto=tcp:toport=8080
sudo firewall-cmd --reload
```

### Option 2: Using systemd Service

Create `/etc/systemd/system/nuaibria-port-forward.service`:

```ini
[Unit]
Description=Port Forwarding for Nuaibria (80→8080)
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/sbin/iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
ExecStart=/usr/sbin/iptables -t nat -A OUTPUT -p tcp -o lo --dport 80 -j REDIRECT --to-port 8080
ExecStop=/usr/sbin/iptables -t nat -D PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
ExecStop=/usr/sbin/iptables -t nat -D OUTPUT -p tcp -o lo --dport 80 -j REDIRECT --to-port 8080
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```

Enable it:
```bash
sudo systemctl enable nuaibria-port-forward
sudo systemctl start nuaibria-port-forward
```

### Option 3: Using iptables-persistent

```bash
sudo apt install iptables-persistent
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
sudo netfilter-persistent save
sudo netfilter-persistent reload
```

## Testing the Fix

### Before (502 Error):
```bash
curl https://nuaibria.tfour.net/
# HTTP 502 Bad Gateway - Connection refused from Cloudflare
```

### After (Success):
```bash
# Via public domain through Cloudflare
curl https://nuaibria.tfour.net/health
# Should return JSON: {"status":"healthy",...}

# Via localhost (with port forwarding)
curl http://localhost:8080/
# Should return HTML: <!doctype html>...
```

### API Routing:
```bash
curl -X POST http://localhost:8080/api/chat/dm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUPABASE_JWT" \
  -d '{"message":"Hello Chronicler"}'
# Should proxy to backend and return DM response
```

## docker-compose.yml Changes

Reverted nginx-proxy service (was causing permission issues with rootless Podman):
- Removed: `nginx-proxy` service with host network mode
- Reason: Host network mode + privilaged ports = rootless Podman limitations

Frontend still exposes on 8080:
```yaml
ports:
  - "8080:80"  # Container's port 80 → Host's port 8080
```

External traffic flow:
```
User → nuaibria.tfour.net → Cloudflare → Host:80
       → (iptables) →  localhost:8080
       → frontend container → backend container
```

## Remaining TODO

- [ ] Set up SSL/TLS certificates (Let's Encrypt)
- [ ] Configure HTTPS (port 443) forwarding
- [ ] Make iptables rules persistent across reboots
- [ ] Set up monitoring for port forwarding rule
- [ ] Document SSL certificate renewal process
- [ ] Test full gameplay loop via public domain

## Files Modified

- `docker-compose.yml`: Removed nginx-proxy service, kept frontend on 8080
- `nginx.conf`: Created (not currently used, kept for reference)
- `setup-port-forwarding.sh`: Script to enable port forwarding
- `INFRASTRUCTURE_FIX.md`: This document

## Debugging Commands

```bash
# Check if port 80 is listening
ss -tuln | grep :80
netstat -tuln | grep :80

# Check iptables rules
sudo iptables -t nat -L PREROUTING -n -v
sudo iptables -t nat -L OUTPUT -n -v

# Test connectivity
curl -v http://localhost:80/
curl -v http://localhost:8080/
curl -v https://nuaibria.tfour.net/

# Check container networking
podman network inspect $(podman network ls -q)
podman exec project-chimera_frontend_1 curl http://backend:3001/health

# Monitor traffic
sudo tcpdump -i any -n port 80 or port 8080
```

## Architecture Decision Record (ADR-018)

**Title**: Port Forwarding Strategy for Rootless Podman

**Status**: Accepted

**Context**:
- Application runs in rootless Podman (unprivileged container runtime)
- Cloudflare expects application on standard port 80
- Rootless Podman cannot bind to privileged ports (<1024)

**Decision**:
Use iptables NAT rules to forward port 80 → 8080 instead of running reverse proxy

**Rationale**:
1. Simpler than nginx/reverse proxy containers
2. Avoids permission issues with rootless Podman
3. Works with external traffic from Cloudflare
4. Can be made persistent with systemd or iptables-persistent

**Consequences**:
- ✅ External traffic now routes to containerized frontend
- ⚠️ Rules must be restored on host reboot (see persistence options)
- ℹ️ Rules only apply to external traffic (localhost cannot use them)
- ℹ️ Does not apply to localhost traffic due to iptables REDIRECT behavior

---

**Last Updated**: 2025-10-21
**Status**: Infrastructure working, testing full gameplay loop pending
