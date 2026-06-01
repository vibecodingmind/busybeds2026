#!/usr/bin/env python3
"""Rebuild on VPS with npm-based Dockerfile"""
import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect("45.151.123.253", port=22, username="root", password="R@tir@dH@ro2030", timeout=15, allow_agent=False, look_for_keys=False)

# Write rebuild script
sftp = c.open_sftp()
with sftp.file("/tmp/rebuild3.sh", 'w') as f:
    f.write("""#!/bin/bash
set -e
cd /var/www/busybeds
git pull origin main
docker compose down
docker compose build --no-cache app 2>&1 | tail -5
docker compose up -d 2>&1
echo "DONE"
""")
sftp.close()

# Start rebuild in screen
stdin, stdout, stderr = c.exec_command("chmod +x /tmp/rebuild3.sh && screen -XS rebuild3 quit 2>/dev/null; screen -dmS rebuild3 bash /tmp/rebuild3.sh", timeout=5)
c.close()
print("✅ Rebuild started in screen session 'rebuild3'")
print("Run: python3 wait-build3.py to check")
