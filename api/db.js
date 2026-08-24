// Vercel Serverless Function: shared site database bridge.
// Supabase credentials stay on the Vercel server, not in the browser.

async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const syncKey = process.env.SITE_SYNC_KEY;

  if (!url || !serviceKey || !syncKey) {
    return res.status(500).json({ error: 'Database environment variables are not configured.' });
  }

  const endpoint = `${url.replace(/\/$/, '')}/rest/v1/site_state`;
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json'
  };

  try {
    if (req.method === 'GET') {
      const r = await fetch(`${endpoint}?id=eq.1&select=data`, { headers });
      const text = await r.text();
      if (!r.ok) return res.status(r.status).send(text);
      const rows = JSON.parse(text);
      return res.status(200).json({ data: rows[0]?.data || null });
    }

    if (req.method === 'POST') {
      if (req.headers['x-site-sync-key'] !== syncKey) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body?.data) return res.status(400).json({ error: 'Missing data.' });

      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ id: 1, data: body.data, updated_at: new Date().toISOString() })
      });
      const text = await r.text();
      if (!r.ok) return res.status(r.status).send(text);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Database request failed.' });
  }
}

module.exports = handler;
