import { expect, test } from '@playwright/test';

test('ships immutable asset caching and restrictive deployment policies', async ({ page }) => {
  const response = await page.request.get('/staticwebapp.config.json');
  expect(response.ok()).toBeTruthy();
  const config = await response.json() as {
    globalHeaders: Record<string, string>;
    routes: Array<{ route: string; headers?: Record<string, string>; rewrite?: string }>;
    responseOverrides: Record<string, { rewrite: string; statusCode: number }>;
  };

  const assetRoute = config.routes.find((route) => route.route === '/assets/*');
  expect(assetRoute?.headers?.['Cache-Control']).toBe('public, max-age=31536000, immutable');
  expect(config.routes.find((route) => route.route === '/sw.js')?.headers?.['Cache-Control']).toContain('max-age=0');
  expect(config.globalHeaders['Content-Security-Policy']).toContain("default-src 'self'");
  expect(config.globalHeaders['Content-Security-Policy']).toContain('https://api.sociobot.in');
  expect(config.globalHeaders['Content-Security-Policy']).toContain("frame-ancestors 'none'");
  expect(config.globalHeaders['Permissions-Policy']).toContain('geolocation=()');
  expect(config.globalHeaders['X-Frame-Options']).toBe('DENY');
  expect(config.routes.some((route) => route.route === '/data' && route.rewrite === '/index.html')).toBeTruthy();
  expect(config.routes.some((route) => route.route === '/objectives/*' && route.rewrite === '/index.html')).toBeTruthy();
  expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html', statusCode: 404 });

  await page.goto('/');
  await expect(page.locator('img')).toHaveAttribute('src', /objective-field-map\.e409d0f7909f\.webp$/);
  await expect(page.locator('picture source')).toHaveAttribute('srcset', /objective-field-map-720\.427b472e8f53\.webp$/);
  const notFoundPage = await page.request.get('/404.html');
  expect(notFoundPage.ok()).toBeTruthy();
});
