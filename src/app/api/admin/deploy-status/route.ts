import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Get current git info
    const commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
    const commitMsg = execSync('git log --oneline -1', { encoding: 'utf-8' }).trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
    
    // Check for deploy log
    const deployLogPath = '/var/www/busybeds/auto-deploy/deploy.log';
    let deployLog = null;
    let lockFile = false;
    
    try {
      deployLog = fs.readFileSync(deployLogPath, 'utf-8');
      // Get last 50 lines
      const lines = deployLog.split('\n').filter(Boolean);
      deployLog = lines.slice(-50).join('\n');
    } catch {
      deployLog = 'Deploy log not accessible (expected in Docker container)';
    }

    // Check lock file
    try {
      const lockPath = '/var/www/busybeds/auto-deploy/deploy.lock';
      if (fs.existsSync(lockPath)) {
        lockFile = true;
      }
    } catch {
      // Can't check lock file
    }

    return NextResponse.json({
      success: true,
      data: {
        commitHash,
        commitMsg,
        branch,
        deployLog,
        lockFile,
        hostname: process.env.HOSTNAME || 'unknown',
        nodeEnv: process.env.NODE_ENV,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      data: {
        error: error.message,
        note: 'Running inside Docker - git info may differ from host',
        hostname: process.env.HOSTNAME || 'unknown',
        nodeEnv: process.env.NODE_ENV,
      },
    });
  }
}
