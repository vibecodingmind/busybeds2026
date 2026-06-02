# BusyBeds - Premium Hotel Discount Coupons for Africa

Live at: https://busybeds.com

## Deployment

- **VPS**: Contabo VPS (45.151.123.253)
- **CI/CD**: GitHub push to `main` triggers auto-deploy via webhook
- **Runtime**: Docker + Nginx reverse proxy + SSL (Let's Encrypt)
- **Strategy**: Blue-green zero-downtime deployment
