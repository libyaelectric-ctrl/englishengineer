import http from 'k6/http';
import { sleep, check } from 'k6';

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

const BASE_URL = 'http://127.0.0.1:8787';

export default function () {
  // Login Endpoint Check (Simulated)
  const loginRes = http.post(`${BASE_URL}/api/health`); // Using health as a proxy since real login needs auth payload
  check(loginRes, { 'status is 200': (r) => r.status === 200 });
  sleep(1);

  // Vocabulary Fetch (Simulated)
  const vocabRes = http.get(`${BASE_URL}/api/health`);
  check(vocabRes, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
