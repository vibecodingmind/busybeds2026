#!/usr/bin/env python3
"""Poll rebuild status every 30s, show final result"""
import paramiko, time

for i in range(20):
    time.sleep(30)
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect("45.151.123.253", port=22, username="root", password="R@tir@dH@ro2030", timeout=15, allow_agent=False, look_for_keys=False)
    stdin, stdout, stderr = c.exec_command("screen -ls 2>/dev/null | grep -q rb && echo RUNNING || echo DONE", timeout=10)
    out = stdout.read().decode().strip()
    c.close()
    print(f"[{i+1}] {out}")
    if "DONE" in out:
        break

# Get final result
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect("45.151.123.253", port=22, username="root", password="R@tir@dH@ro2030", timeout=15, allow_agent=False, look_for_keys=False)
stdin, stdout, stderr = c.exec_command("docker ps --format '{{.Names}}: {{.Status}}' && echo '---' && curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null && echo '' && echo '---' && docker logs busybeds-app --tail 15 2>&1", timeout=20)
print(stdout.read().decode())
c.close()
