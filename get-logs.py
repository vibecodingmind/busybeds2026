#!/usr/bin/env python3
import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect("45.151.123.253", port=22, username="root", password="R@tir@dH@ro2030", timeout=15, allow_agent=False, look_for_keys=False)
stdin, stdout, stderr = c.exec_command("docker logs busybeds-app 2>&1 | tail -30", timeout=20)
print(stdout.read().decode('utf-8', errors='replace'))
c.close()
