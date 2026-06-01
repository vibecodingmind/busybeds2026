#!/usr/bin/env python3
"""Fast rebuild - start and check in one shot"""
import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect("45.151.123.253", port=22, username="root", password="R@tir@dH@ro2030", timeout=15, allow_agent=False, look_for_keys=False)

# Pull + rebuild in screen
sftp = c.open_sftp()
with sftp.file("/tmp/rb.sh", 'w') as f:
    f.write("""#!/bin/bash
cd /var/www/busybeds
git pull origin main 2>&1
docker compose down 2>&1
docker compose build --no-cache app 2>&1 | tail -3
docker compose up -d 2>&1
sleep 60
echo "===STATUS==="
docker ps --format '{{.Names}}: {{.Status}}'
echo "HTTP=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null || echo FAIL)"
docker logs busybeds-app --tail 15 2>&1
""")
sftp.close()

stdin, stdout, stderr = c.exec_command("chmod +x /tmp/rb.sh && screen -XS rb quit 2>/dev/null; screen -dmS rb bash /tmp/rb.sh", timeout=5)
c.close()
print("✅ Rebuild started! Will take ~5 min. Run: python3 poll.py")
