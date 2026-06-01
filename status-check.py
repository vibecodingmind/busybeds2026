#!/usr/bin/env python3
"""Just check current status - no waiting"""
import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect("45.151.123.253", port=22, username="root", password="R@tir@dH@ro2030", timeout=15, allow_agent=False, look_for_keys=False)

cmds = [
    "screen -ls 2>/dev/null | grep rebuild",
    "docker ps --format '{{.Names}}: {{.Status}}'",
    "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null || echo FAIL",
    "docker logs busybeds-app --tail 15 2>&1",
]

for cmd in cmds:
    stdin, stdout, stderr = c.exec_command(cmd, timeout=15)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    print(f"\n> {cmd[:60]}")
    print(out[-500:])

c.close()
