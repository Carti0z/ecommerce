# Deployment Guide - NovaCart E-Commerce Platform

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ database
- Domain name (for production)
- SSL certificate (for production)
- Payment provider accounts (Paystack/Flutterwave)
- Email provider account (Resend/SendGrid)
- Object storage (optional, for product images)

## Environment Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd novacart
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp env.example .env
```

Edit `.env` with your production values:
```env
DATABASE_URL="postgresql://user:password@host:5432/novacart"
AUTH_SECRET="generate-strong-secret-here"
NEXTAUTH_URL="https://yourdomain.com"
APP_URL="https://yourdomain.com"
PAYMENT_PROVIDER_SECRET_KEY="sk_live_..."
PAYMENT_PROVIDER_PUBLIC_KEY="pk_live_..."
PAYMENT_WEBHOOK_SECRET="whsec_..."
EMAIL_PROVIDER_API_KEY="re_..."
```

**Important:**
- Generate a strong AUTH_SECRET: `openssl rand -base64 32`
- Never commit `.env` file
- Use different databases for dev/staging/prod
- Rotate keys regularly

## Database Setup

1. **Run migrations**
```bash
npm run db:generate
npm run db:push
```

For production with Prisma Migrate:
```bash
npx prisma migrate deploy
```

2. **Seed production data** (optional)
```bash
npm run db:seed
```

**Important:**
- Change default admin password immediately
- Remove test data before production
- Set up automated backups
- Enable SSL for database connections

## Build & Deploy

### Vercel Deployment (Recommended)

1. **Push code to GitHub**
```bash
git add .
git commit -m "Ready for production"
git push origin main
```

2. **Import project in Vercel**
   - Go to vercel.com
   - Click "Add New Project"
   - Import from GitHub
   - Configure environment variables in Vercel dashboard

3. **Configure environment variables in Vercel**
   - Go to Settings > Environment Variables
   - Add all variables from `.env.example`
   - Don't include actual values in the repo

4. **Deploy**
   - Vercel will automatically deploy on push
   - Monitor deployment logs

### Manual Deployment

1. **Build the application**
```bash
npm run build
```

2. **Start production server**
```bash
npm start
```

3. **Configure process manager** (PM2 recommended)
```bash
npm install -g pm2
pm2 start npm --name "novacart" -- start
pm2 save
pm2 startup
```

## Post-Deployment Configuration

### 1. Payment Providers

**Paystack (Example):**
- Create account at paystack.co
- Get API keys
- Configure webhook URL: `https://yourdomain.com/api/v1/webhooks/payments/paystack`
- Set webhook secret
- Test in sandbox mode first

**Flutterwave (Alternative):**
- Similar setup to Paystack
- Configure webhook endpoint
- Test in sandbox

### 2. Email Provider

**Resend (Recommended):**
- Create account at resend.com
- Get API key
- Configure DNS records for SPF/DKIM
- Test email delivery

**SendGrid (Alternative):**
- Similar setup to Resend
- Configure sending domains

### 3. Object Storage (Optional)

For product images:
- AWS S3
- Cloudflare R2
- DigitalOcean Spaces
- Configure CORS bucket policy

### 4. Domain & SSL

**Domain:**
- Point domain to Vercel/deployment server
- Configure DNS records (A/CNAME)

**SSL:**
- Vercel provides automatic SSL
- Custom domain SSL also automatic

### 5. Monitoring

**Error Monitoring (Recommended):**
- Sentry: `npm install @sentry/nextjs`
- Configure DSN in environment variables

**Performance Monitoring:**
- Vercel Analytics (built-in)
- New Relic (optional)

## Security Hardening

1. **Review SECURITY_CHECKLIST.md**
2. **Configure security headers** (added in next.config.ts)
3. **Set up CSP policy** (add to next.config.ts)
4. **Enable rate limiting** (install Redis for production)
5. **Configure CORS** (if needed)
6. **Review dependencies**:
   ```bash
   npm audit
   npm audit fix
   ```

## Database Backups

### Automated Backups (Recommended)

**For PostgreSQL:**
- Use provider's automated backups
- Configure backup retention policy
- Test restoration process

**Manual Backup:**
```bash
pg_dump novacart > backup.sql
```

**Restore:**
```bash
psql novacart < backup.sql
```

## Scaling Considerations

### Database
- Use connection pooling
- Consider read replicas for high traffic
- Enable query caching

### Application
- Use CDN for static assets
- Enable edge caching where appropriate
- Consider serverless functions for scale

### Session Storage
- Use Redis for session storage in production
- Configure session persistence

## Monitoring & Logs

### Application Logs
- Configure log levels
- Set up log aggregation
- Monitor error rates

### Database Logs
- Monitor slow queries
- Set up connection pool monitoring
- Monitor replication lag (if using replicas)

### Business Metrics
- Monitor order volume
- Monitor payment success rate
- Monitor error rates
- Set up alerts for critical metrics

## Rollback Procedure

If deployment fails:

1. **Vercel:**
   - Go to Deployments
   - Click rollback to previous deployment

2. **Manual:**
   ```bash
   git checkout <previous-commit>
   npm run build
   npm start
   ```

## Troubleshooting

### Build Errors
- Check Node.js version (requires 18+)
- Clear node_modules: `rm -rf node_modules && npm install`
- Check for environment variable issues

### Database Connection Errors
- Verify DATABASE_URL is correct
- Check database is accessible
- Verify SSL configuration
- Check database credentials

### Payment Integration Issues
- Verify API keys are correct
- Check webhook endpoint is accessible
- Verify webhook signature
- Check payment provider status

### Performance Issues
- Check for slow database queries
- Enable caching where appropriate
- Consider CDN for static assets
- Review database indexes

## Support

For issues:
- Check documentation in README.md
- Review SECURITY_CHECKLIST.md
- Check payment provider documentation
- Check Next.js documentation
- Contact support at support@novacart.com

## Post-Launch Checklist

- [ ] Monitor error rates for 24 hours
- [ ] Verify payment processing
- [ ] Test webhook handling
- [ ] Verify email delivery
- [ ] Check database performance
- [ ] Monitor response times
- [ ] Review security logs
- [ ] Verify backup system working
- [ ] Set up ongoing monitoring alerts
- [ ] Document incident response procedures
- [ ] Train team on incident response
