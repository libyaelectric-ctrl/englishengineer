import { check, sleep } from 'k6';
import http from 'k6/http';

export const options = {
  stages: [
    { duration: '5s', target: 50 },
    { duration: '5s', target: 50 },
    { duration: '5s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:8787';

export default function () {
  // Health endpoint benchmark (GET-only endpoint - a POST here would 404)
  const healthRes = http.get(`${BASE_URL}/api/health`);
  check(healthRes, { 'status is 200': (r) => r.status === 200 });
  sleep(1);

  // Vocabulary Fetch (Simulated)
  const vocabRes = http.get(`${BASE_URL}/api/health`);
  check(vocabRes, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
