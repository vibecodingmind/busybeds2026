const { spawn } = require('child_process');
const http = require('http');

function startServer() {
  console.log(`[${new Date().toISOString()}] Starting Next.js server...`);
  
  const child = spawn('npx', ['next', 'start', '-p', '3000', '-H', '0.0.0.0'], {
    cwd: '/home/z/my-project',
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' },
    stdio: ['pipe', 'pipe', 'pipe']
  });

  child.stdout.on('data', (data) => {
    console.log(`[SERVER stdout] ${data.toString().trim()}`);
  });

  child.stderr.on('data', (data) => {
    console.log(`[SERVER stderr] ${data.toString().trim()}`);
  });

  child.on('exit', (code, signal) => {
    console.log(`[${new Date().toISOString()}] Server exited with code=${code} signal=${signal}`);
    // Wait 3 seconds then restart
    setTimeout(startServer, 3000);
  });

  return child;
}

const server = startServer();

// Keep the process alive
process.on('SIGTERM', () => {
  server.kill();
  process.exit(0);
});
