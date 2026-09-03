// Best-effort in-memory rate limit. Serverless instances are ephemeral and
// may be scaled horizontally, so this does NOT provide a hard guarantee --
// it only throttles abuse within a single warm instance. For a durable
// limit, back this with the same Upstash-backed limiter used in
// backend/src/rate-limit.ts.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const MAX_TEXT_LENGTH = 2000;
const requestLog = new Map();

const isRateLimited = (key) => {
  const now = Date.now();
  const timestamps = (requestLog.get(key) || []).filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  requestLog.set(key, timestamps);
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
};

export default async function handler(req, res) {
  const ALLOWED_ORIGINS = ['https://engvox.com', 'http://localhost:5173'];
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const clientKey =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(clientKey)) {
    return res.status(429).json({ error: 'Too many requests. Please slow down.' });
  }

  const { text, sl, tl } = req.query;

  if (!text || !sl || !tl) {
    return res.status(400).json({ error: 'Missing parameters: text, sl, tl are required.' });
  }
  if (typeof text !== 'string' || text.length > MAX_TEXT_LENGTH) {
    return res
      .status(400)
      .json({ error: `text must be a string up to ${MAX_TEXT_LENGTH} characters.` });
  }

  try {
    const googleUrl = `https://translate.googleapis.com/translate_a/t?client=gtx&sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(text)}`;
    const response = await fetch(googleUrl);
    if (response.ok) {
      const data = await response.json();
      return res.status(200).json(data);
    }
    return res.status(500).json({ error: 'Translation service returned an error.' });
  } catch {
    return res.status(500).json({ error: 'Translation service is temporarily unavailable.' });
  }
}
