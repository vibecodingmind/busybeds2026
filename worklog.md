---
Task ID: 1
Agent: Main Agent
Task: Deploy BusyBeds to Contabo VPS with Docker, SSL, DNS, and auto-deploy

Work Log:
- SSH connected to VPS (45.151.123.253) with root password
- Found existing Docker, Nginx, Node.js from previous session
- Fixed multiple Dockerfile issues:
  - Added --legacy-peer-deps for npm peer dep conflicts
  - Removed --no-lint flag (invalid in Next.js 16)
  - Removed output:standalone (doesn't work with next start)
  - Removed eslint config from next.config.ts (not supported in Next.js 16)
  - Fixed slug/id conflict in API routes
  - Simplified to use `next start` instead of standalone output
- Fixed docker-compose.yml:
  - Removed external PostgreSQL port (use Docker networking)
  - Removed DATABASE_URL override (let .env take priority)
- Deployed with Docker Compose: app + PostgreSQL
- Configured Nginx reverse proxy with security headers
- Set up BIND9 DNS server on VPS for busybeds.com
- Installed Let's Encrypt SSL certificate
- Set up GitHub webhook auto-deploy (port 9000)
- Fixed auto-deploy to preserve .env during git pulls
- Tested all pages and APIs - everything working

Stage Summary:
- BusyBeds is LIVE at https://busybeds.com
- HTTPS with valid SSL (expires Aug 30, 2026)
- HTTP->HTTPS redirect working
- Database connected with 50 hotels, 20 travelers, 80 coupons seeded
- Login API working: admin@busybeds.com / Admin123!
- GitHub push to main auto-deploys to VPS
- Multi-app ready: Nginx virtual hosts, Docker Compose per app
