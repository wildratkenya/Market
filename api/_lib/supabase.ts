const SUPABASE_URL = 'https://nualwgobuhklnoaeawrz.supabase.co';

export async function fetchFromSupabase(tableAndQuery: string) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = SUPABASE_URL + tableAndQuery;
  
  const response = await fetch(url, {
    headers: {
      'apikey': key,
      'Authorization': 'Bearer ' + key,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Supabase request failed: ' + response.status);
  }
  
  return response.json();
}
