import { expect, test } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const workerPath = join(resolve(process.cwd(), 'dist'), 'sw.js');

test('precache survives a service-worker update and an offline reload', async ({ page, context }) => {
  const originalWorker = await readFile(workerPath, 'utf8');
  try {
    expect(originalWorker).toMatch(/"\/assets\/index-[^"]+\.js"/);
    expect(originalWorker).toMatch(/"\/assets\/index-[^"]+\.css"/);
    const entryScript = originalWorker.match(/"(\/assets\/index-[^"]+\.js)"/)?.[1];
    if (!entryScript) throw new Error('The generated worker did not list the application entry script.');

    await page.goto('/');
    await page.waitForFunction(() => navigator.serviceWorker?.ready);
    await page.reload();
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));

    await writeFile(workerPath, originalWorker.replace(/const CACHE = '([^']+)';/, "const CACHE = '$1-two';"));
    await page.evaluate(async () => { await (await navigator.serviceWorker.ready).update(); });
    await expect(page.getByText('An update is ready. Reload to use it.')).toBeVisible();
    await page.waitForFunction(() => caches.keys().then((keys) => keys.some((key) => key.endsWith('-two'))));
    expect(await page.evaluate(async (entry) => {
      const cacheName = (await caches.keys()).find((key) => key.endsWith('-two'));
      return Boolean(cacheName && await (await caches.open(cacheName)).match(entry));
    }, entryScript)).toBeTruthy();
    await page.waitForFunction(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      return Boolean(registration?.active && registration.active.state === 'activated' && !registration.installing && !registration.waiting);
    });

    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 8_000 });
    await expect(page.getByRole('heading', { name: /Objective Loop/i, level: 1 })).toBeVisible();
    await expect(page.getByText(/Offline · saved here/i)).toBeAttached();
  } finally {
    await writeFile(workerPath, originalWorker);
    if (!context.pages().every((candidate) => candidate.isClosed())) await context.setOffline(false);
  }
});
