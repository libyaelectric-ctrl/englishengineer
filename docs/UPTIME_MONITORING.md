# Uptime Monitoring Setup

## Recommended Services

### Option 1: BetterUptime (Recommended)
- Free tier: 5 monitors
- Status page included
- Slack/PagerDuty integration

### Option 2: UptimeRobot
- Free tier: 50 monitors
- 5-minute check intervals
- Email/SMS alerts

### Option 3: GitHub Actions + Cron
- Free for public repos
- Custom health checks
- No external service needed

## Monitors to Create

### Frontend (Vercel)
| Name | URL | Interval | Expected Status |
|------|-----|----------|-----------------|
| Landing Page | https://englishengineer.vercel.app | 1 min | 200 |
| Login Page | https://englishengineer.vercel.app/login | 5 min | 200 |
| API Health | https://englishengineer.vercel.app/api/health | 1 min | 200 |

### Backend (Railway)
| Name | URL | Interval | Expected Status |
|------|-----|----------|-----------------|
| Backend Health | https://englishengineer-production.up.railway.app/api/health | 1 min | 200 |
| AI Endpoint | https://englishengineer-production.up.railway.app/api/ai/coach | 5 min | 401 |
| Stripe Webhook | https://englishengineer-production.up.railway.app/api/webhooks/stripe | 5 min | 400 |

### External Services
| Name | URL | Interval | Expected Status |
|------|-----|----------|-----------------|
| Supabase | https://wxabrwzitwsjtpmlvvqe.supabase.co | 5 min | 200 |
| Upstash | https://maximum-raven-40360.upstash.io | 5 min | 200 |

## Alert Configuration

### Immediate (Phone/SMS)
- Backend down for >2 minutes
- Frontend down for >5 minutes

### Slack Channel
- Any status change
- Response time >2 seconds

### Email
- Daily uptime summary
- Weekly performance report

## Status Page

Create a public status page at `status.englishengineer.vercel.app`:
1. Go to BetterUptime → Status Pages
2. Add all monitors
3. Configure branding
4. Add to DNS as CNAME
