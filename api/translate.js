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

  // Google's endpoint rate-limits datacenter IPs (a serverless origin gets 429/200-with-HTML
  // while the same request from a browser succeeds), so a single upstream made this route a
  // guaranteed 500 in production. MyMemory answers the same question and is queried second.
  const googleUrl = `https://translate.googleapis.com/translate_a/t?client=gtx&sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(text)}`;

  try {
    const response = await fetch(googleUrl);
    if (response.ok) {
      return res.status(200).json(await response.json());
    }
  } catch {
    // Fall through to the second provider rather than reporting a transport error.
  }

  try {
    const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(sl)}|${encodeURIComponent(tl)}`;
    const response = await fetch(myMemoryUrl);
    if (response.ok) {
      const data = await response.json();
      const translatedText = data?.responseData?.translatedText;
      if (typeof translatedText === 'string' && translatedText.length > 0) {
        return res.status(200).json({ translatedText });
      }
    }
    return res.status(502).json({ error: 'Translation service returned an error.' });
  } catch {
    return res.status(502).json({ error: 'Translation service is temporarily unavailable.' });
  }
}
