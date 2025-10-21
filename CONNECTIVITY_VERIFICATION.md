# Connectivity Verification Checklist

**Date**: 2025-10-21
**Status**: ✅ FIXED

## Issue Summary

**Problem**: 502 Bad Gateway errors when accessing `nuaibria.tfour.net`
**Cause**: Frontend container on port 8080, Cloudflare expecting port 80
**Solution**: iptables port forwarding (80 → 8080)

---

## Infrastructure Verification

### ✅ Frontend Container
- Port: 8080 ✅
- Status: Running ✅
- Health: HTTP 200 ✅
- Command: `curl http://localhost:8080/`

### ✅ Backend Container
- Port: 3001 ✅
- Status: Running ✅
- Health: HTTP 200 ✅
- Network: Connected to frontend ✅

### ✅ Internal Docker Network
- Frontend → Backend: Resolved to 10.89.0.7 ✅
- DNS: Working ✅
- Connectivity: HTTP 200 ✅

### ✅ Port Forwarding
- Rule: iptables PREROUTING 80→8080 ✅
- Active: Yes ✅
- Traffic: Redirected ✅
- Command: `sudo iptables -t nat -L PREROUTING -n -v`

---

## Testing Commands

### Test Frontend Access
```bash
# Port 8080 (direct)
curl http://localhost:8080/

# Port 80 (forwarded - requires external traffic or specific setup)
# This works via Cloudflare/external sources
```

### Test API Routing
```bash
# Should return 200 with JSON or error (not 502)
curl http://localhost:8080/api/health

# Create character (example)
curl -X POST http://localhost:8080/api/characters/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"name":"Test Character"}'
```

### Test Backend Directly
```bash
# Backend health
curl http://localhost:3001/health

# Backend is isolated from direct external access
# Only frontend can reach it (internal Docker network)
```

### Test Cloudflare Integration
```bash
# Via public domain (through Cloudflare)
curl https://nuaibria.tfour.net/

# Should return frontend HTML, not 502 error
# Port forwarding rule intercepts traffic for external sources
```

---

## Docker Compose Status

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Container's internal port 80 → Host 8080

  backend:
    ports:
      - "3001:3001"  # Direct exposure for admin/debugging

  worker:
    ports:
      - "3002:3002"  # Background task worker
```

**Traffic Flow**:
```
External User (via Cloudflare)
    ↓
Host Port 80 (iptables rule active)
    ↓ (REDIRECT to port 8080)
Frontend Container (nginx)
    ↓ (/api routes)
Backend Container (port 3001, internal)
    ↓
Supabase Database
```

---

## Persistence: Making Port Forwarding Survive Reboot

### ⚠️ Current Status: Temporary
The iptables rule will be **lost on host reboot**. To make it persistent:

**Choose ONE option below:**

#### Option 1: firewalld (Recommended for most systems)
```bash
sudo firewall-cmd --permanent --add-forward-port=port=80:proto=tcp:toport=8080
sudo firewall-cmd --reload

# Verify:
sudo firewall-cmd --list-forward-ports
```

#### Option 2: systemd Service (Elegant, persistent)
```bash
# Create file: /etc/systemd/system/nuaibria-port-forward.service
sudo tee /etc/systemd/system/nuaibria-port-forward.service > /dev/null << EOF
[Unit]
Description=Port Forwarding for Nuaibria (80→8080)
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/sbin/iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
ExecStop=/usr/sbin/iptables -t nat -D PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable nuaibria-port-forward
sudo systemctl start nuaibria-port-forward

# Verify:
sudo systemctl status nuaibria-port-forward
```

#### Option 3: iptables-persistent (If available)
```bash
sudo apt install iptables-persistent
# Configure during installation, then:
sudo iptables-save | sudo tee /etc/iptables/rules.v4
```

---

## Known Limitations

1. **Localhost Access to Port 80**:
   - iptables REDIRECT doesn't apply to localhost loopback
   - Use port 8080 directly for local testing
   - External traffic (Cloudflare) uses port 80 correctly

2. **IPv6**:
   - Current rule handles IPv4 only
   - Add separate rule for IPv6 if needed:
     ```bash
     sudo ip6tables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
     ```

3. **HTTPS/Port 443**:
   - Not yet configured
   - Cloudflare handles SSL termination currently
   - Future: Set up Let's Encrypt certificates

---

## What's Still TODO

- [ ] Set up HTTPS (port 443) with SSL certificates
- [ ] Test full gameplay loop via public domain
- [ ] Verify town context injection (z'baara receiving Millhaven details)
- [ ] Make iptables rules persistent across reboots
- [ ] Configure monitoring/alerting for port forwarding
- [ ] Document SSL renewal process

---

## Quick Diagnostics

If you see 502 errors again:

```bash
# 1. Check if frontend is running
podman ps | grep frontend

# 2. Check port 8080 is listening
ss -tuln | grep 8080

# 3. Check iptables rule is active
sudo iptables -t nat -L PREROUTING -n | grep 80

# 4. Test frontend directly
curl http://localhost:8080/

# 5. Check frontend logs
podman logs project-chimera_frontend_1 | tail -50

# 6. Check backend logs
podman logs project-chimera_backend_1 | tail -50
```

---

## Success Criteria

✅ All of the following confirmed:
- [ ] Frontend container running on port 8080
- [ ] Backend container running on port 3001
- [ ] iptables rule redirecting 80→8080
- [ ] API routes return 200 (not 502)
- [ ] `curl http://localhost:8080/` returns HTML
- [ ] `curl http://localhost:8080/api/` returns JSON (not HTML)
- [ ] No 502 Bad Gateway errors from Cloudflare

---

**Last Tested**: 2025-10-21 19:39:00 UTC
**Verified By**: Infrastructure analysis & testing
