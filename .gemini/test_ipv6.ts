import { Pool } from 'pg';

async function test() {
  const url = "postgresql://postgres:J%40muhuri2020@[2a05:d014:1c06:5f34:b005:ac4c:4e74:2930]:5432/postgres";
  console.log('Testing Direct IPv6 Connection...');
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
