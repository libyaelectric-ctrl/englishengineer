import { readFileSync } from 'node:fs';

const envFile = readFileSync('backend/.env', 'utf8');
const env = Object.fromEntries(
  envFile
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => {
      const [k, ...v] = l.split('=');
      return [k.trim(), v.join('=').trim()];
    })
);

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = env;

async function check() {
  const url = `${SUPABASE_URL}/rest/v1/subscription_status?select=topup_credits&limit=1`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  console.log(res.status, await res.text());
}

check();
