export default async function handler(req, res) {
  const ALLOWED_ORIGINS = ['https://englishengineer.vercel.app', 'http://localhost:5173'];
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

  const { text, sl, tl } = req.query;

  if (!text || !sl || !tl) {
    return res.status(400).json({ error: 'Missing parameters: text, sl, tl are required.' });
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
