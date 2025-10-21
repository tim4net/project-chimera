#!/bin/bash
# Port forwarding setup for Nuaibria
# Forwards port 80 (HTTP) to port 8080 (where frontend container runs)
# This allows external/Cloudflare traffic to reach the containerized app

echo "Setting up port forwarding 80 -> 8080..."

# Enable port forwarding via iptables
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
sudo iptables -t nat -A OUTPUT -p tcp -o lo --dport 80 -j REDIRECT --to-port 8080

echo "Port forwarding enabled"
echo "Current iptables rules:"
sudo iptables -t nat -L PREROUTING -n -v

# Save rules (requires iptables-save utilities)
if command -v iptables-save &> /dev/null; then
  sudo iptables-save > /tmp/iptables-rules.txt
  echo "Rules saved to /tmp/iptables-rules.txt"
fi

# Note: To make permanent across reboots, consider:
# 1. Using firewalld: sudo firewall-cmd --add-forward-port=port=80:proto=tcp:toport=8080
# 2. Or installing iptables-persistent: sudo apt install iptables-persistent
# 3. Or using systemd service to restore rules on boot
