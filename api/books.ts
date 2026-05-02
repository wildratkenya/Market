import { fetchFromSupabase } from './_lib/supabase';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  try {
    const books = await fetchFromSupabase('/rest/v1/books?order=id.asc');
    
    return new Response(JSON.stringify(books), {
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
