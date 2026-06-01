#!/usr/bin/env python3
"""Quick single check of app status"""
import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect("45.151.123.253", port=22, username="root", password="R@tir@dH@ro2030", timeout=15, allow_agent=False, look_for_keys=False)
stdin, stdout, stderr = c.exec_command("docker ps --format '{{.Names}}: {{.Status}}' && echo '---' && curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null && echo '---' && docker logs busybeds-app --tail 10 2>&1", timeout=20)
print(stdout.read().decode('utf-8', errors='replace'))
c.close()
