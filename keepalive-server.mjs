import { createServer } from 'http';
import next from 'next';

const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    // Pass the original URL without parsing - let Next.js handle it
    handle(req, res);
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`> Server ready on http://0.0.0.0:${port}`);
  });

  // Self-ping to keep process alive in sandbox
  setInterval(() => {
    try {
      const http = require('http');
      http.get(`http://127.0.0.1:${port}/api/health`, (res) => {
        res.resume();
      }).on('error', () => {});
    } catch {}
  }, 3000);
});
