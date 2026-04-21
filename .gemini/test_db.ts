import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'lib/db/.env') });

async function testConnection() {
  console.log('Testing connection to Supabase...');
  console.log('URL:', process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ':****@'));

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set in lib/db/.env');
    return;
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW(), current_database()');
    console.log('Connection successful!');
    console.log('Result:', res.rows[0]);
    client.release();
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    await pool.end();
  }
}

testConnection();
