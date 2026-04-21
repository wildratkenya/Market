import 'dotenv/config';
import { Client } from 'pg';

async function testUrl(url: string) {
  const client = new Client({ connectionString: url });
  try {
    console.log(`\nTesting: ${url.replace(/:([^@]+)@/, ':****@')}`);
    await client.connect();
    const res = await client.query('SELECT now()');
    console.log('✅ Success!', res.rows[0]);
    await client.end();
    return true;
  } catch (err: any) {
    console.error('❌ Failed!');
    console.error('Error:', err.message);
    if (err.cause) console.error('Cause:', err.cause.message);
    return false;
  }
}

async function main() {
  const ref = 'nualwgobuhklnoaeawrz';
  const pass = 'JamhuriAdmin2020'; // From current .env
  
  const urls = [
    `postgresql://postgres.${ref}:${pass}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?prepareThreshold=0`,
    `postgresql://postgres:${pass}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?prepareThreshold=0`,
    `postgresql://postgres.${ref}:${pass}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`,
    `postgresql://postgres:${pass}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`,
    `postgresql://postgres:${pass}@db.${ref}.supabase.co:6543/postgres?prepareThreshold=0`,
    `postgresql://postgres:${pass}@db.${ref}.supabase.co:5432/postgres`
  ];

  for (const url of urls) {
    if (await testUrl(url)) {
      console.log('\n🌟 FOUND WORKING CONNECTION STRING!');
      console.log('Please use this in your .env files.');
      process.exit(0);
    }
  }
  
  console.log('\n❌ None of the standard formats worked with the current password.');
}

main();
