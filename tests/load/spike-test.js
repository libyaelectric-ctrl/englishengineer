import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '2s', target: 200 }, 
    { duration: '5s', target: 200 },  
    { duration: '2s', target: 0 },   
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // More lenient for spike
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = 'http://127.0.0.1:8787';

export default function () {
  const res = http.get(`${BASE_URL}/api/health`);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(0.5);
}
