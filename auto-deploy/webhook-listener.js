/**
 * BusyBeds GitHub Webhook Auto-Deploy Listener
 *
 * Runs on the VPS and listens for GitHub push events.
 * When a push is detected on the main branch, it triggers
 * a rebuild and restart of the Docker containers.
 *
 * Port: 9000 (configured via WEBHOOK_PORT env var)
 * Secret: Set via GITHUB_WEBHOOK_SECRET env var
 */

const http = require('http');
const crypto = require('crypto');
const { execSync } = require('child_process');
const fs = require('fs');

const PORT = parseInt(process.env.WEBHOOK_PORT || '9000', 10);
const SECRET = process.env.GITHUB_WEBHOOK_SECRET || '';
const DEPLOY_SCRIPT = process.env.DEPLOY_SCRIPT || '/var/www/busybeds/auto-deploy/deploy-on-push.sh';
const LOG_FILE = process.env.DEPLOY_LOG || '/var/www/busybeds/auto-deploy/deploy.log';

// Ensure log directory exists
const logDir = require('path').dirname(LOG_FILE);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}\n`;
  fs.appendFileSync(LOG_FILE, line);
  console.log(line.trim());
}

function verifySignature(payload, signature) {
  if (!SECRET) {
    log('WARNING: No webhook secret configured - accepting all requests');
    return true;
  }
  if (!signature) return false;

  const expected = 'sha256=' + crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

const server = http.createServer((req, res) => {
  // Only accept POST to /webhook
  if (req.method !== 'POST' || req.url !== '/webhook') {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  let body = '';
  req.on('data', chunk => { body += chunk; });

  req.on('end', () => {
    const signature = req.headers['x-hub-signature-256'];

    if (!verifySignature(body, signature)) {
      log('REJECTED: Invalid signature');
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    try {
      const event = req.headers['x-github-event'];
      const payload = JSON.parse(body);

      // Only handle push events to main branch
      if (event === 'push' && payload.ref === 'refs/heads/main') {
        const commitMsg = payload.head_commit?.message || 'No message';
        const committer = payload.head_commit?.committer?.name || 'Unknown';
        log(`DEPLOY TRIGGERED: ${committer} pushed: ${commitMsg}`);

        // Run deploy script asynchronously
        try {
          execSync(`nohup bash ${DEPLOY_SCRIPT} >> ${LOG_FILE} 2>&1 &`, {
            detached: true,
            stdio: 'ignore'
          });
          log('Deploy script launched in background');
        } catch (err) {
          log(`ERROR launching deploy: ${err.message}`);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'deploying', commit: commitMsg }));
      } else {
        log(`Ignored event: ${event}, ref: ${payload.ref || 'N/A'}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ignored', event, ref: payload.ref }));
      }
    } catch (err) {
      log(`ERROR processing webhook: ${err.message}`);
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  log(`BusyBeds Webhook Listener running on port ${PORT}`);
  log(`Deploy script: ${DEPLOY_SCRIPT}`);
  log(`Log file: ${LOG_FILE}`);
  log(`Secret configured: ${SECRET ? 'YES' : 'NO (WARNING: unsecured!)'}`);
});
