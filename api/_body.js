export async function readJsonBody(req) {
  // Vercel usually parses JSON into req.body, but this is not guaranteed
  // across runtimes/framework settings. This fallback makes it reliable.
  if (req.body && typeof req.body === 'object') return req.body;

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

