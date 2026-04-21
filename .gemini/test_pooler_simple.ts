import { Pool } from 'pg';

async function test() {
  const url = "postgresql://postgres:J%40muhuri2020@aws-0-eu-central-1.pooler.supabase.com:6543/postgres";
  console.log('Testing Pooler Connection (just postgres as user)...');
  const pool = new Pool({ 
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  });
  try {
    const client = await pool.connect();
    console.log('Connected!');
    const res = await client.query('SELECT NOW()');
    console.log(res.rows[0]);
    client.release();
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}
test();
