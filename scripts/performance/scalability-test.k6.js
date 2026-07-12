import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

const successfulRequests = new Counter('successful_requests');
const failedRequests = new Counter('failed_requests');

export const options = {
  scenarios: {
    scaling_test: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '2m', target: 100 }, // Scale to 100 users
        { duration: '3m', target: 100 }, // Hold at 100
        { duration: '2m', target: 200 }, // Scale to 200 users
        { duration: '3m', target: 200 }, // Hold at 200
        { duration: '2m', target: 0 }, // Scale down
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    successfulRequests: ['count>1000'],
  },
};

const BASE_URL = 'https://englishengineer-production.up.railway.app';

export default function () {
  const res = http.get(`${BASE_URL}/api/health`);

  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 1s': (r) => r.timings.duration < 1000,
  });

  if (success) {
    successfulRequests.add(1);
  } else {
    failedRequests.add(1);
  }

  sleep(0.2);
}
