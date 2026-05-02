import { fetchFromSupabase } from '../_lib/supabase';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  try {
    const pageName = new URL(req.url).pathname.split('/').pop();
    const page = await fetchFromSupabase('/rest/v1/site_pages?page_name=eq.' + pageName);
    
    return new Response(JSON.stringify(page), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
