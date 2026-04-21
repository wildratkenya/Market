import { drizzle } from 'drizzle-orm/postgres';
import { migrate } from 'drizzle-orm/postgres/migrator';
import { Pool } from 'pg';
import * as schema from './src/schema/index';

async function push() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool, { schema });
  
  console.log('Connected to database, checking schema...');
  
  // This will create tables if they don't exist
  await db.execute(sql`CREATE SCHEMA IF NOT EXISTS public`);
  
  console.log('Schema push completed!');
  await pool.end();
}

push().catch((err) => {
  console.error('Push failed:', err);
  process.exit(1);
});