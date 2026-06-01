#!/usr/bin/env python3
"""Test SSH connection with updated password"""
import paramiko

VPS_IP = "45.151.123.253"
VPS_USER = "root"
VPS_PASS = "R@tir@dH@ro2030"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print(f"Connecting to {VPS_IP} as {VPS_USER}...")
    client.connect(VPS_IP, port=22, username=VPS_USER, password=VPS_PASS,
                  timeout=30, allow_agent=False, look_for_keys=False,
                  banner_timeout=60, auth_timeout=60)
    print("✅ SUCCESS! Connected to VPS!")
    stdin, stdout, stderr = client.exec_command("whoami && hostname && uptime && cat /etc/os-release | head -3 && free -h | head -2 && df -h / | tail -1")
    print(stdout.read().decode())
    client.close()
except Exception as e:
    print(f"❌ Failed: {type(e).__name__}: {e}")
