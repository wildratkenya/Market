import { Pool } from 'pg';

async function test() {
  const url = "postgresql://postgres.nualwgobuhklnoaeawrz:J%40muhuri2020@db.nualwgobuhklnoaeawrz.supabase.co:6543/postgres";
  console.log('Testing Pooler Connection on db host...');
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
