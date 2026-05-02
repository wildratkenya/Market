import { fetchFromSupabase } from '../_lib/supabase';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  try {
    const podcasts = await fetchFromSupabase('/rest/v1/podcasts?order=published_at.desc&limit=3');
    
    return new Response(JSON.stringify(podcasts), {
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
