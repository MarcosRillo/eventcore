import { request } from '@playwright/test';

const API_URL = process.env.API_URL || 'https://plataforma-calendario-monorepo.onrender.com';

export default async function globalSetup() {
  console.log('Warming up backend...');
  const context = await request.newContext();

  for (let i = 0; i < 10; i++) {
    try {
      const res = await context.get(`${API_URL}/health`, { timeout: 10_000 });
      if (res.ok()) {
        console.log(`Backend ready (attempt ${i + 1})`);
        await context.dispose();
        return;
      }
    } catch {
      console.log(`Waiting for backend... attempt ${i + 1}/10`);
      await new Promise(r => setTimeout(r, 6_000));
    }
  }

  await context.dispose();
  throw new Error('Backend did not start within 60 seconds');
}
