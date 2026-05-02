const supabaseUrl = 'https://nualwgobuhklnoaeawrz.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51YWx3Z29idWhrbG5vYWVhd3J6Iiwicm9sZSI6InNlcnZpY2Utcm9sZSIsImlhdCI6MTc3NjAzNzIyOSwiZXhwIjoyMDkxNjEzMjI5fQ.AAAA_AAAAAAAAAAAAAAAAAAAAAAAAAAA';

async function fixRLS() {
  const policies = [
    'DROP POLICY IF EXISTS "Allow insert" ON subscribers;',
    'CREATE POLICY "Allow insert" ON subscribers FOR INSERT TO anon, authenticated USING (true) WITH CHECK (true);',
    'DROP POLICY IF EXISTS "Allow select" ON subscribers;',
    'CREATE POLICY "Allow select" ON subscribers FOR SELECT TO anon, authenticated USING (true);'
  ];

  for (const sql of policies) {
    const res = await fetch(supabaseUrl + '/rest/v1/rpc/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': 'Bearer ' + serviceKey
      },
      body: JSON.stringify({ query: sql })
    });
    console.log(sql, '->', res.status, await res.text());
  }
}

fixRLS().catch(console.error);