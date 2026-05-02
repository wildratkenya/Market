const SUPABASE_URL = 'https://nualwgobuhklnoaeawrz.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function supabaseQuery(table: string, query: string) {
  const url = \\/rest/v1/\?\\;
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': \Bearer \\,
      'Content-Type': 'application/json',
      'Prefer': 'count=none',
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(\Supabase error: \ \\);
  }
  return res.json();
}

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;
  const method = req.method;

  try {
    if (path === '/api/books' && method === 'GET') {
      const data = await supabaseQuery('books', 'order=id.asc');
      return res.status(200).json(data);
    }

    if (path === '/api/podcasts/latest') {
      const data = await supabaseQuery('podcasts', 'order=published_at.desc&limit=3');
      return res.status(200).json(data);
    }

    if (path.startsWith('/api/pages/')) {
      const pageName = path.split('/api/pages/')[1];
      const data = await supabaseQuery('site_pages', \page_name=eq.\\);
      return res.status(200).json(Array.isArray(data) ? data[0] || null : data);
    }

    if (path === '/api/healthz') {
      return res.status(200).json({ ok: true });
    }

    return res.status(404).json({ error: 'Not found', path });
  } catch (err: any) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
