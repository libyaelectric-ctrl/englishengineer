import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const apiDuration = new Trend('api_duration');

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up
    { duration: '2m', target: 50 },   // Stay at 50
    { duration: '1m', target: 100 },  // Ramp to 100
    { duration: '2m', target: 100 },  // Stay at 100
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    errors: ['rate<0.1'],
  },
};

const BASE_URL = 'https://englishengineer-production.up.railway.app';

export default function () {
  // Health check (should handle load)
  const healthRes = http.get(`${BASE_URL}/api/health`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
    'health response time < 500ms': (r) => r.timings.duration < 500,
  });
  apiDuration.add(healthRes.timings.duration);
  errorRate.add(healthRes.status !== 200);

  // Subscription status (auth required, will get 401)
  const subRes = http.get(`${BASE_URL}/api/billing/subscription-status`, {
    headers: { 'Authorization': 'Bearer test-token' },
  });
  check(subRes, {
    'subscription returns 401 or 200': (r) => r.status === 401 || r.status === 200,
  });

  sleep(0.1);
}
