# EngVox Monitoring Stack

## Overview

EngVox uses Prometheus + Grafana for backend monitoring with pre-configured dashboards and alert rules.

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌──────────────┐
│  EngVox Backend │────▶│  Prometheus  │────▶│    Grafana   │
│  /api/metrics   │     │  (scrape)    │     │  (dashboard) │
└─────────────────┘     └──────────────┘     └──────────────┘
                              │
                              ▼
                        ┌──────────────┐
                        │ Alertmanager │
                        │  (alerts)    │
                        └──────────────┘
```

## Metrics Exposed

The backend exposes metrics at `GET /api/metrics` in Prometheus text format:

| Metric                                | Type    | Description           |
| ------------------------------------- | ------- | --------------------- |
| `engineeros_uptime_seconds`           | gauge   | Application uptime    |
| `engineeros_requests_total`           | counter | Total requests        |
| `engineeros_errors_total`             | counter | Total errors          |
| `engineeros_error_rate_percent`       | gauge   | Error rate %          |
| `engineeros_request_duration_avg_ms`  | gauge   | Avg response time     |
| `engineeros_request_duration_p95_ms`  | gauge   | P95 response time     |
| `engineeros_request_duration_p99_ms`  | gauge   | P99 response time     |
| `engineeros_memory_rss_bytes`         | gauge   | RSS memory            |
| `engineeros_memory_heap_used_bytes`   | gauge   | Heap used             |
| `engineeros_memory_heap_total_bytes`  | gauge   | Heap total            |
| `engineeros_endpoint_requests_total`  | counter | Per-endpoint requests |
| `engineeros_endpoint_avg_duration_ms` | gauge   | Per-endpoint avg time |

## Quick Start (Local)

```bash
# Start monitoring stack
cd monitoring
docker compose -f docker-compose.monitoring.yml up -d

# Access:
# Grafana:      http://localhost:3001 (admin / engvox-monitoring)
# Prometheus:   http://localhost:9090
# Alertmanager: http://localhost:9093
```

## Production Setup (Render)

### Option 1: External Prometheus (Recommended)

1. **Create a Prometheus instance** (e.g., on Render, Railway, or a VPS)
2. **Configure scrape target** in `monitoring/prometheus.yml`:
   ```yaml
   static_configs:
     - targets:
         - 'englishengineer-backend.onrender.com'
   ```
3. **Deploy Grafana** and import the dashboard from `monitoring/grafana/dashboard.json`

### Option 2: Render_metrics (Built-in)

Render provides built-in metrics at `https://your-service.onrender.com/metrics` — but these are Render-specific, not Prometheus format.

### Option 3: UptimeRobot + Sentry (Simplest)

For basic monitoring without infrastructure:

- **UptimeRobot**: Free uptime monitoring (5-min intervals)
- **Sentry**: Error tracking and performance monitoring
- **Vercel Analytics**: Frontend performance (built-in)

## Dashboard Panels

| Panel                       | Description                                          |
| --------------------------- | ---------------------------------------------------- |
| **Uptime**                  | Application uptime in seconds                        |
| **Total Requests**          | Cumulative request count                             |
| **Error Rate**              | Error percentage (green < 1%, yellow < 5%, red > 5%) |
| **Total Errors**            | Cumulative error count                               |
| **Avg Response Time**       | Average request duration                             |
| **P95 Response Time**       | 95th percentile latency                              |
| **Memory Usage**            | Heap and RSS memory over time                        |
| **Requests Over Time**      | Request rate and error rate                          |
| **Top Endpoints**           | Endpoints sorted by request count                    |
| **Endpoint Response Times** | Per-endpoint latency                                 |

## Alert Rules

| Alert            | Condition                    | Severity |
| ---------------- | ---------------------------- | -------- |
| HighErrorRate    | Error rate > 5% for 5min     | Critical |
| HighResponseTime | P95 > 1000ms for 5min        | Warning  |
| HighMemoryUsage  | Heap > 85% for 5min          | Warning  |
| ServiceDown      | Backend unreachable for 1min | Critical |
| HighRequestRate  | > 100 req/s for 2min         | Warning  |

## Alertmanager Configuration

Edit `monitoring/alertmanager.yml` to configure:

- **Email**: Set SMTP credentials
- **Slack**: Add webhook URL
- **PagerDuty**: Add integration key

## Troubleshooting

### Metrics endpoint not accessible

```bash
# Check if backend is running
curl -s https://englishengineer-backend.onrender.com/api/health

# Check metrics endpoint
curl -s https://englishengineer-backend.onrender.com/api/metrics | head -20
```

### Prometheus can't scrape

1. Ensure the backend URL is correct in `prometheus.yml`
2. Check CORS headers (backend allows Prometheus IP)
3. Verify HTTPS is working

### Grafana dashboard not loading

1. Import dashboard manually: Grafana → Dashboards → Import → Upload JSON
2. Select Prometheus data source
3. Ensure data source URL matches your Prometheus instance

## Cost

| Service       | Free Tier              | Paid               |
| ------------- | ---------------------- | ------------------ |
| Prometheus    | Self-hosted: free      | Managed: $10-50/mo |
| Grafana Cloud | 10k metrics, 50GB logs | $8-29/mo           |
| UptimeRobot   | 50 monitors            | $7-50/mo           |
| Sentry        | 5k errors/mo           | $26-80/mo          |

**Recommendation**: Start with UptimeRobot (free) + Sentry (free tier) + Render built-in metrics. Add full Prometheus/Grafana when you need custom dashboards.
