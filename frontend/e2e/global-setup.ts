import { request } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const API_URL = process.env.API_URL || 'http://localhost:8000';

/**
 * Global setup: ensure auth directory exists and warm up the backend
 * before any auth setup runs.
 *
 * Defaults to localhost for local development. CI overrides API_URL via env.
 * Polls /health with local-friendly timeouts (10 × 2s = 20s max).
 */
export default async function globalSetup() {
  // Ensure .auth directory exists (gitignored, won't exist on fresh clone)
  fs.mkdirSync(path.join(__dirname, '.auth'), { recursive: true });

  console.log(`Warming up backend at ${API_URL}...`);
  const context = await request.newContext();

  // Poll up to 10 × 2s = 20s (sufficient for local; CI sets its own API_URL)
  for (let i = 0; i < 10; i++) {
    try {
      const res = await context.get(`${API_URL}/health`, { timeout: 5_000 });
      if (res.ok()) {
        console.log(`Backend ready (attempt ${i + 1})`);
        await context.dispose();
        return;
      }
    } catch {
      console.log(`Waiting for backend... attempt ${i + 1}/10`);
    }
    await new Promise(r => setTimeout(r, 2_000));
  }

  await context.dispose();
  throw new Error(`Backend at ${API_URL} did not respond within 20 seconds`);
}
