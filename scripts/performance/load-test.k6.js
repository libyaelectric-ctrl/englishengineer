import http from 'k6/http';
import { check, sleep } from 'k6';

// 1. K6 Test Configuration
// Hedef: Claude'un belirttigi Spike, Normal ve Sustained load senaryolarini tek bir testte kurgulamak.
export const options = {
  scenarios: {
    // Senaryo 1: Normal Yük (Sustained)
    // Amac: Sistemin gunluk standart (10-50 kullanici) yuku altinda nasil tepki verdigini olcmek.
    normal_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 }, // 30 saniyede 20 kullaniciya cik
        { duration: '1m', target: 20 },  // 1 dakika boyunca 20 kullanicida kal
        { duration: '30s', target: 0 },  // 30 saniyede 0'a in
      ],
      gracefulRampDown: '10s',
    },
    // Senaryo 2: Spike Yuku (Ani Yuklenme)
    // Amac: Bir anda sisteme yuzlerce kisi girdiginde veritabaninin (Supabase) ve Frontend'in (Vercel) tepkisini olcmek.
    spike_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 100 }, // 10 saniyede 100 kullaniciya firlama (Spike)
        { duration: '30s', target: 100 }, // 30 saniye boyunca dayan
        { duration: '10s', target: 0 },   // 10 saniyede normalde don
      ],
      startTime: '2m30s', // Normal yuk bittikten sonra baslasin
    },
  },
  thresholds: {
    // 2. Performance Eşikleri (Performance Thresholds)
    // Claude'un 156-157. maddelerindeki endpoint latency gereksinimleri
    http_req_duration: ['p(95)<500'], // %95'i 500ms altinda olmali
    http_req_failed: ['rate<0.01'],   // Hata orani %1'den kucuk olmali
  },
};

const BASE_URL = __ENV.API_BASE_URL || 'https://englishengineer.vercel.app';

export default function () {
  // Sistem sagligi (Health Check) ve Ana sayfa render hizi kontrolu
  const res = http.get(`${BASE_URL}/`);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'latency is under 500ms': (r) => r.timings.duration < 500,
  });

  // Vercel uzerinde statik asset'lerin onbellekten (Edge) geldigini dogrulamak icin
  const assetsRes = http.get(`${BASE_URL}/api-docs.html`);
  check(assetsRes, {
    'api-docs status is 200': (r) => r.status === 200,
  });

  // Her kullanici arasinda 1-3 saniye rastgele bekleme
  sleep(Math.random() * 2 + 1);
}
