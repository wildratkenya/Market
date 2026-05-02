import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://nualwgobuhklnoaeawrz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: any, res: any) {
  // CORS
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
    // Books routes
    if (path === '/api/books' && method === 'GET') {
      const { data, error } = await supabase.from('books').select('*').order('id', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data || []);
    }
    
    // Podcasts route
    if (path === '/api/podcasts/latest') {
      const { data, error } = await supabase.from('podcasts').select('*').order('published_at', { ascending: false }).limit(3);
      if (error) throw error;
      return res.status(200).json(data || []);
    }
    
    // Pages route
    if (path.startsWith('/api/pages/')) {
      const pageName = path.split('/api/pages/')[1];
      const { data, error } = await supabase.from('site_pages').select('*').eq('page_name', pageName).maybeSingle();
      if (error) throw error;
      return res.status(200).json(data);
    }
    
    // Health check
    if (path === '/api/healthz') {
      return res.status(200).json({ ok: true });
    }
    
    // Default: not found
    return res.status(404).json({ error: 'Not found', path });
  } catch (err: any) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
