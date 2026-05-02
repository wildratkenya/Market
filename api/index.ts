import app from '../artifacts/api-server/src/app.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: any, res: any) {
  // Seed database on first run
  try {
    const { seedDatabase } = await import('../artifacts/api-server/src/lib/seed.js');
    await seedDatabase({ info: (msg: string) => console.log(msg) });
  } catch (err) {
    console.warn('Seeding failed:', err);
  }
  
  // Handle the request with Express
  app(req, res);
}
