# Sentry Dashboard Configuration

## Recommended Dashboards

### 1. Error Overview Dashboard
**Widgets:**
- Top 10 Errors by Count
- Error Trend (Last 7 Days)
- Errors by Browser/OS
- Unhandled vs Handled Errors

**Filters:**
- Environment: production
- Date range: Last 14 days

### 2. Performance Dashboard
**Widgets:**
- LCP, FID, CLS Web Vitals
- Transaction Duration (p50, p95, p99)
- Slowest Transactions
- API Response Times

**Filters:**
- Transaction type: page-load, api-call

### 3. AI Service Dashboard
**Widgets:**
- AI Request Count
- AI Error Rate
- AI Latency Distribution
- Provider Breakdown (Anthropic/OpenAI/Gemini)

**Custom Tags:**
- `ai.provider`
- `ai.operation`
- `ai.model`

### 4. Billing Dashboard
**Widgets:**
- Checkout Success Rate
- Webhook Processing Time
- Subscription Changes
- Payment Failures

## Alert Rules

### Critical Alerts (PagerDuty/Slack)
1. **Error Spike:** >50 errors in 5 minutes
2. **Performance Degradation:** p95 >2s for 10 minutes
3. **AI Service Down:** 100% error rate for 2 minutes

### Warning Alerts (Slack)
1. **Error Rate Increase:** >2x baseline for 30 minutes
2. **Slow Transactions:** p95 >1s for 15 minutes

## Setup Instructions

1. Go to Sentry → Dashboards → Create Dashboard
2. Add widgets using the configurations above
3. Set up alert rules in Settings → Alerts
4. Connect Slack/PagerDuty in Settings → Integrations
