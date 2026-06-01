#!/usr/bin/env python3
"""Check package.json on VPS to see if Prisma pin is there"""
import paramiko
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect("45.151.123.253", port=22, username="root", password="R@tir@dH@ro2030", timeout=15, allow_agent=False, look_for_keys=False)

for cmd in [
    "cd /var/www/busybeds && grep prisma package.json",
    "cd /var/www/busybeds && grep prisma bun.lock | head -5",
    "cd /var/www/busybeds && cat bun.lock | grep -A2 'prisma' | head -10",
]:
    stdin, stdout, stderr = c.exec_command(cmd, timeout=15)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    print(f"\n> {cmd}")
    print(out[:500])

c.close()
