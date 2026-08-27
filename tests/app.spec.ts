import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('creates an objective, prompt, and review with an explained next date', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Create your first objective' }).click();
  await page.getByLabel('Objective *').fill('Explain orbital seasons');
  await page.getByLabel('What counts as evidence?').fill('Explain the effect without notes.');
  await page.getByRole('button', { name: 'Save objective' }).click();
  await page.getByLabel('Question *').fill('Why does axial tilt create seasons?');
  await page.getByLabel('Expected answer *').fill('Tilt changes the angle and duration of sunlight.');
  await page.getByRole('button', { name: 'Add to review queue' }).click();
  await page.getByRole('button', { name: 'Review', exact: true }).click();
  await page.getByRole('button', { name: 'Reveal expected answer' }).click();
  await page.getByText('Yes, correct').click();
  await page.getByText('5', { exact: true }).click();
  await page.getByRole('button', { name: 'Log answer & schedule next' }).click();
  await expect(page.getByText(/advances one interval/i)).toBeVisible();
  await page.reload();
  await expect(page.getByText('Explain orbital seasons')).toBeVisible();
});

test('has no serious accessibility violations in the empty state', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page: page as never }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
});

test('reloads while offline after the service worker controls the page', async ({ page, context }) => {
  await page.goto('/');
  await page.waitForFunction(() => navigator.serviceWorker?.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: /Objective Loop/i, level: 1 })).toBeVisible();
  await expect(page.getByText(/Offline · saved here/i)).toBeAttached();
});
