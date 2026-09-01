import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

test('uses a concrete first-screen headline and names self-learners at desktop and 390px', async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Plan reviews around your learning objectives', level: 1 })).toBeVisible();
    await expect(page.getByText('For self-learners using AI or other materials who need recall prompts tied to clear learning objectives.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Try it with sample data' })).toBeVisible();
    const hint = page.getByText('Opens three sample objectives and their due prompts.');
    await expect(hint).toBeVisible();
    const box = await hint.boundingBox();
    expect(box && box.y + box.height <= viewport.height).toBeTruthy();
    await expect(page.locator('main h1')).toHaveCount(1);
  }
});

test('uses real routes with route titles, focus, and an announcement after keyboard navigation', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto('/');
  await page.getByRole('link', { name: 'Data & access' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/data$/);
  const heading = page.getByRole('heading', { name: 'Export, restore, or unlock reports', level: 1 });
  await expect(heading).toBeFocused();
  await expect(page).toHaveTitle('Data & access — Objective Loop');
  await expect(page.locator('#route-announcer')).toHaveText('Export, restore, or unlock reports page.');
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { name: 'Plan reviews around your learning objectives', level: 1 })).toBeFocused();

  await page.goto('/privacy');
  await expect(page).toHaveTitle('Privacy — Objective Loop');
  await expect(page.getByRole('heading', { name: 'Privacy', level: 1 })).toHaveCount(1);
  await page.goto('/terms');
  await expect(page).toHaveTitle('Terms — Objective Loop');
  await expect(page.getByRole('heading', { name: 'Terms', level: 1 })).toHaveCount(1);
  await page.goto('/today');
  await expect(page).toHaveTitle('Review queue — Objective Loop');
  await page.goto('/objectives');
  await expect(page.getByRole('heading', { name: 'Your learning objectives', level: 1 })).toBeVisible();
  await page.goto('/demo');
  await page.getByRole('link', { name: /Explain why seasons differ by hemisphere/ }).click();
  await expect(page).toHaveTitle('Explain why seasons differ by hemi — Objective Loop');
  expect(consoleErrors).toEqual([]);
});

test('ships social metadata, a Param Factory footer, and a designed static 404', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/$/);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Objective Loop/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /objective-loop-social\.webp$/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  await expect(page.getByText(/Built by Param Factory · build 1\.0\.4-repair-7/)).toBeVisible();
  await page.goto('/404.html');
  await expect(page.getByRole('heading', { name: 'Page not found', level: 1 })).toBeVisible();
  await expect(page).toHaveTitle('Page not found — Objective Loop');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /requested Objective Loop page/i);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /404\.html$/);
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Privacy' })).toBeVisible();
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Terms' })).toBeVisible();
});

test('keeps every rendered interactive target at least 44 by 44 CSS pixels on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const routes = ['/', '/today', '/demo', '/objectives', '/new-objective', '/data', '/privacy', '/terms', '/404.html'];

  for (const route of routes) {
    await page.goto(route);
    await page.waitForLoadState('networkidle');

    const undersized = await page.locator('a, button, input, textarea, select, summary').evaluateAll((targets) => targets.flatMap((target) => {
      const box = target.getBoundingClientRect();
      const style = getComputedStyle(target);
      const isRendered = box.width > 0
        && box.height > 0
        && style.display !== 'none'
        && style.visibility !== 'hidden'
        && Number(style.opacity) > 0
        && !target.closest('[aria-hidden="true"]');
      if (!isRendered || (box.width >= 44 && box.height >= 44)) return [];
      return [{
        element: target.tagName.toLowerCase(),
        name: (target.getAttribute('aria-label') || target.textContent || target.getAttribute('name') || '').trim().replace(/\s+/g, ' '),
        width: Number(box.width.toFixed(1)),
        height: Number(box.height.toFixed(1)),
      }];
    }));

    expect(undersized, `${route} has undersized interactive targets`).toEqual([]);
  }
});

test('rejects non-HTTP(S) evidence links before persistence', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Create your first objective' }).click();
  await page.getByLabel('Objective *').fill('Explain safe evidence links');
  await page.getByRole('button', { name: 'Save objective' }).click();
  const address = page.getByLabel('Web address');
  await page.locator('form[data-form="evidence"]').evaluate((form: HTMLFormElement) => { form.noValidate = true; });
  for (const unsafeUrl of ['javascript:alert(document.domain)', 'data:text/html,<h1>test</h1>']) {
    await address.fill(unsafeUrl);
    await page.getByRole('button', { name: 'Attach evidence' }).click();
    await expect(page.locator('form[data-form="evidence"] [role="alert"]')).toHaveText('Use an HTTP(S) web address, such as https://example.com.');
    await expect(address).toBeFocused();
    await expect(page.locator('.evidence-list a')).toHaveCount(0);
  }
  await page.reload();
  await expect(page.locator('.evidence-list a')).toHaveCount(0);
});

test('@claim:objective-review-workflow creates an objective, prompt, and review with an explained next date', async ({ page }) => {
  await page.clock.install({ time: new Date('2030-01-01T12:00:00Z') });
  await page.goto('/');
  await page.getByRole('link', { name: 'Create your first objective' }).click();
  await page.getByLabel('Objective *').fill('Explain orbital seasons');
  await page.getByLabel('What counts as evidence?').fill('Explain the effect without notes.');
  await page.getByRole('button', { name: 'Save objective' }).click();
  await page.getByLabel('Question *').fill('Why does axial tilt create seasons?');
  await page.getByLabel('Expected answer *').fill('Tilt changes the angle and duration of sunlight.');
  await page.getByRole('button', { name: 'Add to review queue' }).click();
  await page.getByRole('button', { name: 'Review this prompt', exact: true }).click();
  await page.getByRole('button', { name: 'Reveal expected answer' }).click();
  await page.getByText('Yes, correct').click();
  await page.getByText('5', { exact: true }).click();
  await page.getByRole('button', { name: 'Log answer & schedule next' }).click();
  await expect(page.getByText(/advances one interval/i)).toBeVisible();
  await expect(page.getByText('Next review: 3 days.')).toBeVisible();
  await expect(page.getByText(/Due Jan 4, 2030/)).toBeVisible();
  await page.getByText('Answer, schedule & editing').click();
  await expect(page.getByText('Correct · confidence 5/5')).toBeVisible();
  await expect(page.getByText('3-day next step')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Explain orbital seasons')).toBeVisible();
  await expect(page.getByText(/Due Jan 4, 2030/)).toBeVisible();
  await page.getByText('Answer, schedule & editing').click();
  await expect(page.getByText('Correct · confidence 5/5')).toBeVisible();
});

test('@claim:csv-export rejects blank edits without changing saved or exported learning content', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Create your first objective' }).click();
  await page.getByLabel('Objective *').fill('Explain escape velocity');
  await page.getByRole('button', { name: 'Save objective' }).click();
  await page.getByLabel('Question *').fill('What determines escape velocity?');
  await page.getByLabel('Expected answer *').fill('Mass and distance from the centre of the body.');
  await page.getByRole('button', { name: 'Add to review queue' }).click();

  await page.getByText('Edit objective').click();
  await page.getByLabel('Title').fill('   ');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.locator('form[data-form="edit-objective"] [role="alert"]')).toHaveText('Write an objective before saving.');
  await expect(page.getByRole('heading', { name: 'Explain escape velocity' })).toBeVisible();

  await page.getByText('Answer, schedule & editing').click();
  await page.getByLabel('Question', { exact: true }).fill('   ');
  await page.getByLabel('Expected answer', { exact: true }).fill('   ');
  await page.getByRole('button', { name: 'Save prompt' }).click();
  await expect(page.locator('form[data-form="edit-prompt"] [role="alert"]')).toHaveText('Add both a question and expected answer.');
  await expect(page.getByLabel('Question', { exact: true })).toBeFocused();
  await expect(page.getByRole('heading', { name: 'What determines escape velocity?' })).toBeVisible();

  await page.getByLabel('Question', { exact: true }).fill('What determines escape velocity?');
  await page.getByRole('button', { name: 'Save prompt' }).click();
  await expect(page.locator('form[data-form="edit-prompt"] [role="alert"]')).toHaveText('Add both a question and expected answer.');
  await expect(page.getByLabel('Expected answer', { exact: true })).toBeFocused();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Explain escape velocity' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What determines escape velocity?' })).toBeVisible();
  await page.getByRole('link', { name: 'Data & access' }).click();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export readable CSV' }).click();
  const download = await downloadEvent;
  const csv = await readFile(await download.path(), 'utf8');
  expect(csv).toContain('"Explain escape velocity","What determines escape velocity?","Mass and distance from the centre of the body."');
});

test('rejects over-limit edits and keeps the last saved learning content', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Create your first objective' }).click();
  await page.getByLabel('Objective *').fill('Explain escape velocity');
  await page.getByLabel('What counts as evidence?').fill('Explain it without notes.');
  await page.getByRole('button', { name: 'Save objective' }).click();
  await page.getByLabel('Question *').fill('What determines escape velocity?');
  await page.getByLabel('Expected answer *').fill('Mass and distance from the centre of the body.');
  await page.getByRole('button', { name: 'Add to review queue' }).click();

  await page.getByText('Edit objective').click();
  const title = page.getByLabel('Title');
  await title.evaluate((input: HTMLInputElement) => {
    input.removeAttribute('maxlength');
    input.value = 'T'.repeat(121);
  });
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.locator('form[data-form="edit-objective"] [role="alert"]')).toHaveText('Keep the objective to 120 characters or fewer.');
  await expect(title).toBeFocused();

  const description = page.getByLabel('Evidence statement');
  await title.fill('Explain escape velocity');
  await description.evaluate((textarea: HTMLTextAreaElement) => {
    textarea.removeAttribute('maxlength');
    textarea.value = 'E'.repeat(501);
  });
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.locator('form[data-form="edit-objective"] [role="alert"]')).toHaveText('Keep the evidence statement to 500 characters or fewer.');
  await expect(description).toBeFocused();

  await page.getByText('Answer, schedule & editing').click();
  const question = page.getByLabel('Question', { exact: true });
  await expect(question).toHaveAttribute('maxlength', '400');
  await expect(page.getByLabel('Expected answer', { exact: true })).toHaveAttribute('maxlength', '1200');
  await question.evaluate((textarea: HTMLTextAreaElement) => {
    textarea.removeAttribute('maxlength');
    textarea.value = 'Q'.repeat(401);
  });
  await page.getByRole('button', { name: 'Save prompt' }).click();
  await expect(page.locator('form[data-form="edit-prompt"] [role="alert"]')).toHaveText('Keep the question to 400 characters or fewer.');
  await expect(question).toBeFocused();

  const answer = page.getByLabel('Expected answer', { exact: true });
  await question.fill('What determines escape velocity?');
  await answer.evaluate((textarea: HTMLTextAreaElement) => {
    textarea.removeAttribute('maxlength');
    textarea.value = 'A'.repeat(1_201);
  });
  await page.getByRole('button', { name: 'Save prompt' }).click();
  await expect(page.locator('form[data-form="edit-prompt"] [role="alert"]')).toHaveText('Keep the expected answer to 1,200 characters or fewer.');
  await expect(answer).toBeFocused();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Explain escape velocity' })).toBeVisible();
  await expect(page.locator('.objective-head').getByText('Explain it without notes.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What determines escape velocity?' })).toBeVisible();
  await page.getByText('Answer, schedule & editing').click();
  await expect(page.locator('.answer-note').getByText('Mass and distance from the centre of the body.')).toBeVisible();
  await page.getByRole('link', { name: 'Data & access' }).click();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export readable CSV' }).click();
  const download = await downloadEvent;
  const csv = await readFile(await download.path(), 'utf8');
  expect(csv).toContain('"Explain escape velocity","What determines escape velocity?","Mass and distance from the centre of the body."');
});

test('closes a review with Escape, keeps it closed on navigation, and restores focus', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Create your first objective' }).click();
  await page.getByLabel('Objective *').fill('Explain escape velocity');
  await page.getByRole('button', { name: 'Save objective' }).click();
  await page.getByLabel('Question *').fill('What determines escape velocity?');
  await page.getByLabel('Expected answer *').fill('Mass and distance from the centre of the body.');
  await page.getByRole('button', { name: 'Add to review queue' }).click();

  const trigger = page.getByRole('button', { name: 'Review this prompt', exact: true });
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close review' })).toBeFocused();
  const dialogResults = await new AxeBuilder({ page: page as never }).include('#review-dialog').withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(dialogResults.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.getByRole('link', { name: 'Data & access' }).click();
  await expect(page.getByRole('heading', { name: 'Export, restore, or unlock reports' })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await page.getByRole('link', { name: /^Review/ }).click();
  const reopenedTrigger = page.getByRole('button', { name: /Review this prompt.*What determines escape velocity/ });
  await reopenedTrigger.click();
  await page.getByRole('button', { name: 'Close review' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(reopenedTrigger).toBeFocused();
});

test('renders a populated objective map without CSP-blocked inline styles', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto('/');
  await page.getByRole('link', { name: 'Create your first objective' }).click();
  await page.getByLabel('Objective *').fill('Explain escape velocity');
  await page.getByRole('button', { name: 'Save objective' }).click();
  await page.getByRole('link', { name: 'Objective map', exact: true }).click();
  await expect(page.locator('.objective-tree [style]')).toHaveCount(0);
  expect(consoleErrors).toEqual([]);
});

test('@claim:demo-sandbox opens sample data in one click without touching real data', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('link', { name: 'Create your first objective' }).click();
  await page.getByLabel('Objective *').fill('Private control objective');
  await page.getByRole('button', { name: 'Save objective' }).click();
  await page.getByRole('link', { name: 'Try sample data' }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByText('Demo — sample data, nothing is saved to your notebook.')).toBeVisible();
  await expect(page.locator('.metric-strip div').filter({ hasText: 'active objectives' }).getByText('3')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Why is it summer in Australia when it is winter in Europe?' })).toBeVisible();
  const demoResults = await new AxeBuilder({ page: page as never }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(demoResults.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
  await page.getByRole('link', { name: 'Create objective' }).click();
  await page.getByLabel('Objective *').fill('Demo-only objective');
  await page.getByRole('button', { name: 'Save objective' }).click();
  await expect(page.getByRole('heading', { name: 'Demo-only objective' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('Demo sample restored.')).toBeVisible();
  await expect(page.getByText('Demo-only objective')).toHaveCount(0);
  await page.getByRole('button', { name: 'Open my notebook' }).click();
  await expect(page).toHaveURL(/\/today$/);
  await expect(page.getByRole('link', { name: 'Try sample data' })).toBeVisible();
  await expect(page.getByText('Demo-only objective')).toHaveCount(0);
  await page.getByRole('link', { name: 'Objective map', exact: true }).click();
  await expect(page.getByRole('link', { name: /Private control objective/ })).toBeVisible();
  await page.goto('/?demo=1');
  await expect(page).toHaveURL(/\/\?demo=1$/);
  await expect(page.getByText('Demo — sample data, nothing is saved to your notebook.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reset demo' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('Demo sample restored.')).toBeVisible();
  await page.goto('/?demo=1#/today');
  await expect(page).toHaveURL(/\/demo\?demo=1$/);
  await expect(page.locator('.metric-strip div').filter({ hasText: 'active objectives' }).getByText('3')).toBeVisible();
  await expect(page.getByText('Demo-only objective')).toHaveCount(0);
});

test('@claim:manual-override persists a visible manual date and restores the calculation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Create your first objective' }).click();
  await page.getByLabel('Objective *').fill('Explain orbital seasons');
  await page.getByRole('button', { name: 'Save objective' }).click();
  await page.getByLabel('Question *').fill('Why does axial tilt create seasons?');
  await page.getByLabel('Expected answer *').fill('Tilt changes sunlight angle and day length.');
  await page.getByRole('button', { name: 'Add to review queue' }).click();
  await page.getByText('Answer, schedule & editing').click();
  await page.getByLabel('Override next review').fill('2030-01-15');
  await page.getByRole('button', { name: 'Set date' }).click();
  await expect(page.getByText('Manual date', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('Manual date', { exact: true })).toBeVisible();
  await page.getByText('Answer, schedule & editing').click();
  await page.getByRole('button', { name: 'Use calculated date' }).click();
  await expect(page.getByText('Calculated review date restored.')).toBeVisible();
  await expect(page.getByText('Stage 1', { exact: true })).toBeVisible();
});

test('@claim:one-time-price keeps reviews and both exports free before and after the $19 checkout handoff', async ({ browser }, testInfo) => {
  test.setTimeout(60_000);
  const baseUrl = String(testInfo.project.use.baseURL || 'http://127.0.0.1:4173');
  const appUrl = (path: string) => new URL(path, baseUrl).toString();
  const newIsolatedContext = () => browser.newContext({
    baseURL: baseUrl,
    serviceWorkers: 'block',
    viewport: { width: 1440, height: 900 },
  });
  const checkout = 'https://api.sociobot.in/api/v1/products/learning-objective-loop/checkout';
  const verification = 'https://api.sociobot.in/api/v1/products/learning-objective-loop/verify?license=price-license-token';
  let checkoutRequests = 0;
  const fixture = createServer((request, response) => {
    expect(request.url).toBe('/hosted-checkout');
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end('<!doctype html><title>Hosted checkout</title><h1>Hosted checkout fixture</h1>');
  });
  await new Promise<void>((resolve) => fixture.listen(0, '127.0.0.1', resolve));
  const address = fixture.address();
  if (!address || typeof address === 'string') throw new Error('Could not start the checkout fixture.');
  const hostedCheckout = `http://127.0.0.1:${address.port}/hosted-checkout`;

  try {
    const context = await newIsolatedContext();
    const page = await context.newPage();
    try {
      await context.route(verification, (route) => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"valid":true,"reason":"ok"}' }));
      await page.goto(appUrl('/'));
    await page.getByRole('link', { name: 'Create your first objective' }).click();
    await page.getByLabel('Objective *').fill('Check free study actions');
    await page.getByRole('button', { name: 'Save objective' }).click();
    await page.getByLabel('Question *').fill('Which study actions remain free?');
    await page.getByLabel('Expected answer *').fill('Reviews, CSV export, and encrypted backup export.');
    await page.getByRole('button', { name: 'Add to review queue' }).click();
    await page.getByRole('button', { name: /Review this prompt/ }).click();
    await page.getByRole('button', { name: 'Reveal expected answer' }).click();
    await page.getByText('Yes, correct').click();
    await page.getByText('4', { exact: true }).click();
    await page.getByRole('button', { name: 'Log answer & schedule next' }).click();
    await expect(page.getByText('Next review: 3 days.')).toBeVisible();
    await page.getByRole('link', { name: 'Data & access' }).click();
    const firstCsv = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export readable CSV' }).click();
    await expect(await firstCsv).toBeTruthy();
    await page.getByLabel('Backup passphrase').first().fill('free-export-passphrase');
    const firstBackup = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download encrypted backup' }).click();
    await expect(await firstBackup).toBeTruthy();
    await context.route(checkout, async (route) => {
      checkoutRequests += 1;
      expect(route.request().isNavigationRequest()).toBeTruthy();
      await route.fulfill({ status: 303, headers: { location: hostedCheckout } });
    });
    const purchase = page.getByRole('link', { name: /Buy Study archive · \$19/ });
    await expect(purchase).toHaveAttribute('href', checkout);
    await Promise.all([
      page.waitForURL(hostedCheckout),
      purchase.click(),
    ]);
    await expect(page.getByRole('heading', { name: 'Hosted checkout fixture' })).toBeVisible();
    expect(checkoutRequests).toBe(1);
    const returnedLicense = page.waitForResponse((response) => response.url() === verification && response.status() === 200);
    await page.goto(appUrl('/?license=price-license-token#/data'));
    await returnedLicense;
    await expect(page).toHaveURL(/\/data$/);
    await expect(page.getByText('Study archive · unlocked')).toBeVisible();
    await expect(page.getByText('100% recall · 1 reviews')).toBeVisible();
    await page.evaluate(() => { window.print = () => { document.documentElement.dataset.pricePrinted = 'yes'; }; });
    await page.getByRole('button', { name: 'Print weekly summary' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-price-printed', 'yes');
    await page.getByRole('link', { name: /^Review/ }).click();
    await page.getByRole('button', { name: /Review this prompt/ }).click();
    await page.getByRole('button', { name: 'Reveal expected answer' }).click();
    await page.getByText('Not yet').click();
    await page.getByRole('radio', { name: '1' }).click();
    await page.getByRole('button', { name: 'Log answer & schedule next' }).click();
    await page.getByRole('link', { name: 'Data & access' }).click();
    const secondCsv = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export readable CSV' }).click();
    await expect(await secondCsv).toBeTruthy();
    await page.getByLabel('Backup passphrase').first().fill('still-free-after-license');
    const secondBackup = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download encrypted backup' }).click();
    await expect(await secondBackup).toBeTruthy();
    } finally {
      await context.close();
    }
  } finally {
    await new Promise<void>((resolve, reject) => fixture.close((error) => error ? reject(error) : resolve()));
  }

  // A return URL is the point where a buyer re-enters the product. Repeating
  // it in independent contexts proves that no prior notebook, service worker,
  // cached verdict, or checkout page can make the archive state appear by luck.
  for (const attempt of [1, 2, 3]) {
    const token = `returned-price-license-${attempt}`;
    const returnVerification = `https://api.sociobot.in/api/v1/products/learning-objective-loop/verify?license=${token}`;
    const context = await newIsolatedContext();
    const page = await context.newPage();
    let verificationRequests = 0;
    try {
      await context.route(returnVerification, (route) => {
        verificationRequests += 1;
        return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"valid":true,"reason":"ok"}' });
      });
      const returnedLicense = page.waitForResponse((response) => response.url() === returnVerification && response.status() === 200);
      await page.goto(appUrl(`/?demo=1&license=${token}#/data`));
      await returnedLicense;
      await expect(page).toHaveURL(/\/data\?demo=1$/);
      await expect(page.getByText('Study archive · unlocked')).toBeVisible();
      await expect(page.getByText('100% recall across 1 reviews')).toBeVisible();
      await expect(page.getByText('100% recall · 1 reviews')).toBeVisible();
      await page.evaluate(() => { window.print = () => { document.documentElement.dataset.returnPrinted = 'yes'; }; });
      await page.getByRole('button', { name: 'Print weekly summary' }).click();
      await expect(page.locator('html')).toHaveAttribute('data-return-printed', 'yes');
      expect(await page.evaluate(() => localStorage.getItem('sb_license:learning-objective-loop'))).toBe(token);
      expect(verificationRequests).toBe(1);
    } finally {
      await context.close();
    }
  }
});

test('toast expiry preserves unsaved prompt fields and review choices', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Create your first objective' }).click();
  await page.getByLabel('Objective *').fill('Explain plate tectonics');
  await page.getByRole('button', { name: 'Save objective' }).click();

  const question = page.getByLabel('Question *');
  const answer = page.getByLabel('Expected answer *');
  await question.fill('What drives plate movement?');
  await answer.fill('Mantle convection and gravity.');
  await page.waitForTimeout(3_700);
  await expect(question).toHaveValue('What drives plate movement?');
  await expect(answer).toHaveValue('Mantle convection and gravity.');

  await page.getByRole('button', { name: 'Add to review queue' }).click();
  await page.getByRole('button', { name: 'Review this prompt', exact: true }).click();
  await page.getByRole('button', { name: 'Reveal expected answer' }).click();
  await page.getByText('Yes, correct').click();
  await page.getByText('4', { exact: true }).click();
  await page.waitForTimeout(3_700);
  await expect(page.getByRole('radio', { name: 'Yes, correct' })).toBeChecked();
  await expect(page.getByRole('radio', { name: '4' })).toBeChecked();
});

test('confirms the named evidence record before removing it', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Create your first objective' }).click();
  await page.getByLabel('Objective *').fill('Explain orbital seasons');
  await page.getByRole('button', { name: 'Save objective' }).click();
  await page.getByLabel('Link label').fill('Season notes');
  await page.getByLabel('Web address').fill('https://example.com/seasons');
  await page.getByRole('button', { name: 'Attach evidence' }).click();
  await expect(page.getByRole('link', { name: 'Season notes' })).toBeVisible();

  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('confirm');
    expect(dialog.message()).toContain('Remove evidence “Season notes” from “Explain orbital seasons”?');
    expect(dialog.message()).toContain('https://example.com/seasons');
    await dialog.dismiss();
  });
  await page.getByRole('button', { name: 'Remove evidence Season notes' }).click();
  await expect(page.getByRole('link', { name: 'Season notes' })).toBeVisible();
  await expect(page.getByText('1 links')).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Remove evidence Season notes' }).click();
  await expect(page.getByText('Evidence link removed.')).toBeVisible();
  await expect(page.getByText('0 links')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Season notes' })).toHaveCount(0);
});

test('has no serious accessibility violations in the empty state', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto('/');
  const results = await new AxeBuilder({ page: page as never }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test('exposes an installable standalone manifest without parse errors', async ({ page }) => {
  await page.goto('/');
  const session = await page.context().newCDPSession(page);
  const manifest = await session.send('Page.getAppManifest');
  expect(manifest.errors).toEqual([]);
  const data = JSON.parse(manifest.data || '{}') as { display?: string; start_url?: string; icons?: Array<{ sizes?: string; purpose?: string }> };
  expect(data.display).toBe('standalone');
  expect(data.start_url).toMatch(/^\/today\?v=\d+$/);
  expect(data.icons?.some((icon) => icon.sizes === '192x192')).toBeTruthy();
  expect(data.icons?.some((icon) => icon.sizes === '512x512')).toBeTruthy();
  expect(data.icons?.some((icon) => icon.purpose?.includes('maskable'))).toBeTruthy();
});

test('supports keyboard navigation and dark treatment', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await page.getByRole('button', { name: 'Switch color theme' }).focus();
  await page.keyboard.press('Space');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const reducedDurations = await page.getByRole('button', { name: 'Switch color theme' }).evaluate((button) => getComputedStyle(button).transitionDuration.split(',').map((duration) => Number.parseFloat(duration)));
  expect(reducedDurations.every((duration) => duration <= 0.001)).toBeTruthy();
  const results = await new AxeBuilder({ page: page as never }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
});

test('@claim:verified-license stores a returned license, strips it from the URL, and unlocks after verification', async ({ page }) => {
  let verificationRequests = 0;
  await page.route('https://api.sociobot.in/api/v1/products/learning-objective-loop/verify?license=paid-license-token', async (route) => {
    verificationRequests += 1;
    await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null }) });
  });

  await page.goto('/');
  await page.getByRole('link', { name: 'Create your first objective' }).click();
  await page.getByLabel('Objective *').fill('Explain orbital seasons');
  await page.getByRole('button', { name: 'Save objective' }).click();
  await page.getByLabel('Question *').fill('Why does axial tilt create seasons?');
  await page.getByLabel('Expected answer *').fill('Tilt changes sunlight angle and day length.');
  await page.getByRole('button', { name: 'Add to review queue' }).click();
  await page.getByRole('button', { name: 'Review this prompt', exact: true }).click();
  await page.getByRole('button', { name: 'Reveal expected answer' }).click();
  await page.getByText('Yes, correct').click();
  await page.getByText('4', { exact: true }).click();
  await page.getByRole('button', { name: 'Log answer & schedule next' }).click();
  await page.goto('/?license=paid-license-token#/data');
  await expect(page).toHaveURL(/\/data$/);
  await expect(page.getByText('Study archive · unlocked')).toBeVisible();
  await expect(page.getByText('Explain orbital seasons')).toBeVisible();
  await expect(page.getByText('100% recall · 1 reviews')).toBeVisible();
  await page.evaluate(() => { window.print = () => { document.documentElement.dataset.printed = 'yes'; }; });
  await page.getByRole('button', { name: 'Print weekly summary' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-printed', 'yes');
  expect(await page.evaluate(() => localStorage.getItem('sb_license:learning-objective-loop'))).toBe('paid-license-token');
  expect(verificationRequests).toBe(1);
});

test('keeps a returned license locked and offers a retry when verification is unavailable', async ({ page }) => {
  const verification = 'https://api.sociobot.in/api/v1/products/learning-objective-loop/verify?license=unavailable-license-token';
  let attempts = 0;
  await page.route(verification, async (route) => {
    attempts += 1;
    await route.abort('failed');
  });
  await page.goto('/?license=unavailable-license-token#/data');
  await expect(page).toHaveURL(/\/data$/);
  await expect(page.getByText('We could not check this license. Retry the check or try again when you are online.')).toBeVisible();
  await expect(page.getByText('Study archive · unlocked')).toHaveCount(0);
  await page.getByRole('button', { name: 'Retry license check' }).click();
  await expect.poll(() => attempts).toBe(2);
});

test('keeps the private empty state accessible at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const results = await new AxeBuilder({ page: page as never }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth)).toBeTruthy();
  expect(await page.locator('body').evaluate((body) => getComputedStyle(body).fontSize)).toBe('17px');
  const wordmark = await page.getByRole('link', { name: 'Objective Loop home' }).boundingBox();
  expect(wordmark?.height).toBeGreaterThanOrEqual(44);
  const navBoxes = await page.locator('.nav-item').evaluateAll((items) => items.map((item) => item.getBoundingClientRect()).map(({ left, right, height }) => ({ left, right, height })));
  expect(navBoxes.every(({ height }) => height >= 44)).toBeTruthy();
  expect(navBoxes.slice(1).every(({ left }, index) => left - navBoxes[index].right >= 8)).toBeTruthy();
  const lastFact = await page.getByText('Core reviews, CSV, and backups are free. History reports cost $19 once.').boundingBox();
  const dock = await page.locator('.side-nav').boundingBox();
  expect(lastFact && dock && lastFact.y + lastFact.height <= dock.y).toBeTruthy();
});

test('@claim:private-core keeps the full local study workflow on the product origin', async ({ page }) => {
  const requestOrigins = new Set<string>();
  page.on('request', (request) => requestOrigins.add(new URL(request.url()).origin));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('link', { name: 'Create your first objective' }).click();
  await page.getByLabel('Objective *').fill('Explain plate tectonics');
  await page.getByRole('button', { name: 'Save objective' }).click();
  await page.getByLabel('Link label').fill('Plate notes');
  await page.getByLabel('Web address').fill('https://example.com/plate-notes');
  await page.getByRole('button', { name: 'Attach evidence' }).click();
  await page.getByLabel('Question *').fill('What drives plate movement?');
  await page.getByLabel('Expected answer *').fill('Convection, slab pull, and ridge push.');
  await page.getByRole('button', { name: 'Add to review queue' }).click();
  await page.getByText('Answer, schedule & editing').click();
  await page.getByLabel('Override next review').fill('2030-01-15');
  await page.getByRole('button', { name: 'Set date' }).click();
  await page.getByRole('button', { name: /^Review this prompt/ }).click();
  await page.getByRole('button', { name: 'Reveal expected answer' }).click();
  await page.getByText('Not yet').click();
  await page.getByText('1', { exact: true }).click();
  await page.getByRole('button', { name: 'Log answer & schedule next' }).click();
  await page.getByRole('link', { name: 'Data & access' }).click();
  const csvDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export readable CSV' }).click();
  await csvDownload;
  await page.getByLabel('Backup passphrase').first().fill('private-passphrase');
  const backupDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download encrypted backup' }).click();
  await backupDownload;
  await page.getByRole('link', { name: 'Objective map', exact: true }).click();
  const objectiveLink = await page.getByRole('link', { name: /Explain plate tectonics/ }).boundingBox();
  expect(objectiveLink?.height).toBeGreaterThanOrEqual(44);
  const results = await new AxeBuilder({ page: page as never }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
  expect([...requestOrigins]).toEqual([new URL(page.url()).origin]);
});

test('@claim:offline-reload reloads while offline after the service worker controls the page', async ({ page, context }) => {
  await page.goto('/demo');
  await page.waitForFunction(() => navigator.serviceWorker?.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: /prompts are due/i, level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Why is it summer in Australia when it is winter in Europe?' })).toBeVisible();
  await expect(page.getByText('Demo — sample data, nothing is saved to your notebook.')).toBeVisible();
  await expect(page.getByText(/Offline · saved here/i)).toBeAttached();
});

test('@claim:manual-input-only keeps prompt authoring manual and shows every schedule calculation', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('input[type="file"][accept*="csv"]')).toHaveCount(0);
  await expect(page.getByText('Why now?', { exact: true }).first()).toBeVisible();
  await page.getByText('Show calculation').first().click();
  await expect(page.getByText(/base interval|New prompts enter/i).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Review this prompt/ }).first()).toBeVisible();
});

test('@claim:nested-objectives-evidence persists a child objective and its evidence link', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Create your first objective' }).click();
  await page.getByLabel('Objective *').fill('Understand the solar system');
  await page.getByRole('button', { name: 'Save objective' }).click();
  await page.getByRole('link', { name: 'Create objective' }).click();
  await page.getByLabel('Objective *').fill('Explain axial tilt');
  await page.getByLabel('Parent objective').selectOption({ label: 'Understand the solar system' });
  await page.getByRole('button', { name: 'Save objective' }).click();
  await page.getByLabel('Link label').fill('Tilt reference');
  await page.getByLabel('Web address').fill('https://example.com/tilt');
  await page.getByRole('button', { name: 'Attach evidence' }).click();
  await page.reload();
  await expect(page.getByRole('link', { name: /Tilt reference.*opens external site/i })).toHaveAttribute('href', 'https://example.com/tilt');
  await page.getByRole('link', { name: 'Objective map', exact: true }).click();
  await expect(page.locator('.objective-tree')).toContainText('Understand the solar system');
  await expect(page.locator('.objective-tree')).toContainText('Explain axial tilt');
});

test('commits prompt reviews and evidence before immediate navigation or reload across ten saves', async ({ page }) => {
  test.setTimeout(90_000);
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    await page.goto('/');
    await page.evaluate(async () => {
      localStorage.clear();
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.deleteDatabase('objective-loop');
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(new Error('IndexedDB stayed open.'));
      });
    });
    await page.reload();
    const title = `Durable objective ${attempt}`;
    const question = `Durable question ${attempt}?`;
    const evidence = `https://example.com/durable-${attempt}`;
    await page.getByRole('link', { name: 'Create your first objective' }).click();
    await page.getByLabel('Objective *').fill(title);
    await page.getByRole('button', { name: 'Save objective' }).click();
    await page.getByLabel('Link label').fill(`Durable evidence ${attempt}`);
    await page.getByLabel('Web address').fill(evidence);
    await page.getByRole('button', { name: 'Attach evidence' }).click();
    await expect(page.getByRole('link', { name: new RegExp(`Durable evidence ${attempt}.*opens external site`) })).toHaveAttribute('href', evidence);
    await page.getByLabel('Question *').fill(question);
    await page.getByLabel('Expected answer *').fill(`Durable answer ${attempt}.`);
    await page.getByRole('button', { name: 'Add to review queue' }).click();
    await page.getByRole('button', { name: 'Review this prompt', exact: true }).click();
    await page.getByRole('button', { name: 'Reveal expected answer' }).click();
    await page.getByText('Yes, correct').click();
    await page.getByText('4', { exact: true }).click();
    await page.getByRole('button', { name: 'Log answer & schedule next' }).click();
    await page.getByRole('link', { name: 'Objective map', exact: true }).click();
    await page.reload();
    await page.getByRole('link', { name: title }).click();
    await expect(page.getByRole('link', { name: new RegExp(`Durable evidence ${attempt}.*opens external site`) })).toHaveAttribute('href', evidence);
    await page.getByText('Answer, schedule & editing').click();
    await expect(page.getByText('Correct · confidence 4/5')).toBeVisible();
    await expect(page.getByText('3-day next step')).toBeVisible();
  }
});

test('@claim:study-storage saves real study records in IndexedDB and uses a separate demo namespace', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Create your first objective' }).click();
  await page.getByLabel('Objective *').fill('Stored objective');
  await page.getByRole('button', { name: 'Save objective' }).click();
  expect(await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => { const request = indexedDB.open('objective-loop'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    const record = await new Promise<unknown>((resolve, reject) => { const request = db.transaction('records').objectStore('records').get('state'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    db.close(); return Boolean(record);
  })).toBeTruthy();
  await page.goto('/demo');
  expect(await page.evaluate(async () => (await indexedDB.databases()).some((database) => database.name === 'objective-loop-demo'))).toBeTruthy();
});

test('@claim:no-tracking-or-third-party-runtime loads the demo without third-party scripts, fonts, analytics, or ads', async ({ page }) => {
  const requests: Array<{ url: string; type: string }> = [];
  page.on('request', (request) => requests.push({ url: request.url(), type: request.resourceType() }));
  await page.goto('/demo');
  await page.getByRole('button', { name: /Review this prompt/ }).first().click();
  await page.getByRole('button', { name: 'Reveal expected answer' }).click();
  await page.getByText('Yes, correct').click();
  await page.getByText('4', { exact: true }).click();
  await page.getByRole('button', { name: 'Log answer & schedule next' }).click();
  const origin = new URL(page.url()).origin;
  expect(requests.every(({ url }) => new URL(url).origin === origin)).toBeTruthy();
  expect(requests.filter(({ type }) => type === 'script' || type === 'font').every(({ url }) => new URL(url).origin === origin)).toBeTruthy();
});

test('@claim:sociobot-network-boundary makes core actions local and uses Sociobot only for billing endpoints', async ({ page }) => {
  const origins = new Set<string>();
  const urls: string[] = [];
  page.on('request', (request) => { origins.add(new URL(request.url()).origin); urls.push(request.url()); });
  await page.route('https://api.sociobot.in/api/v1/products/learning-objective-loop/verify?license=boundary-token', (route) => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"valid":false,"reason":"invalid"}' }));
  await page.goto('/');
  await page.getByRole('link', { name: 'Create your first objective' }).click();
  await page.getByLabel('Objective *').fill('Local billing boundary');
  await page.getByRole('button', { name: 'Save objective' }).click();
  await page.goto('/?license=boundary-token#/data');
  await expect(page.getByText(/license is no longer active/i)).toBeVisible();
  expect([...origins]).toContain(new URL(page.url()).origin);
  const sociobot = urls.filter((url) => new URL(url).origin === 'https://api.sociobot.in');
  expect(sociobot).toEqual(['https://api.sociobot.in/api/v1/products/learning-objective-loop/verify?license=boundary-token']);
  await expect(page.getByRole('link', { name: /Buy Study archive/ })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/learning-objective-loop/checkout');
});

test('@claim:encrypted-restore confirms replacement and protects records on cancel or wrong passphrase', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Create your first objective' }).click();
  await page.getByLabel('Objective *').fill('Backup source');
  await page.getByRole('button', { name: 'Save objective' }).click();
  await page.getByRole('link', { name: 'Data & access' }).click();
  await page.getByLabel('Backup passphrase').first().fill('correct-passphrase');
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download encrypted backup' }).click();
  const backup = await downloaded;
  const buffer = await readFile(await backup.path());
  await page.getByRole('link', { name: 'Create objective' }).click();
  await page.getByLabel('Objective *').fill('Sentinel record');
  await page.getByRole('button', { name: 'Save objective' }).click();
  await page.getByRole('link', { name: 'Data & access' }).click();
  const file = page.getByLabel('Encrypted backup file');
  await file.setInputFiles({ name: 'backup.loop', mimeType: 'application/json', buffer });
  await page.getByLabel('Backup passphrase').last().fill('wrong-passphrase');
  await page.getByRole('button', { name: 'Decrypt and restore' }).click();
  await expect(page.locator('form[data-form="import"] [role="alert"]')).toContainText('Could not decrypt');
  await page.getByRole('link', { name: 'Objective map' }).click();
  await expect(page.locator('.objective-tree')).toContainText('Sentinel record');
  await page.getByRole('link', { name: 'Data & access' }).click();
  await file.setInputFiles({ name: 'backup.loop', mimeType: 'application/json', buffer });
  await page.getByLabel('Backup passphrase').last().fill('correct-passphrase');
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Decrypt and restore' }).click();
  await page.getByRole('link', { name: 'Objective map' }).click();
  await expect(page.locator('.objective-tree')).toContainText('Sentinel record');
  await page.getByRole('link', { name: 'Data & access' }).click();
  await file.setInputFiles({ name: 'backup.loop', mimeType: 'application/json', buffer });
  await page.getByLabel('Backup passphrase').last().fill('correct-passphrase');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Decrypt and restore' }).click();
  await expect(page).toHaveURL(/\/today$/);
  await page.getByRole('link', { name: 'Objective map' }).click();
  await expect(page.locator('.objective-tree')).toContainText('Backup source');
  await expect(page.locator('.objective-tree')).not.toContainText('Sentinel record');
});

test('@claim:passphrase-local-only keeps a backup passphrase out of requests and browser storage', async ({ page }) => {
  const passphrase = 'local-only-passphrase';
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/data');
  await page.getByLabel('Backup passphrase').first().fill(passphrase);
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download encrypted backup' }).click();
  await downloaded;
  expect(requests.every((url) => new URL(url).origin === new URL(page.url()).origin)).toBeTruthy();
  expect(await page.evaluate((secret) => Object.keys(localStorage).every((key) => !key.includes(secret)) && Object.values(localStorage).every((value) => !String(value).includes(secret)), passphrase)).toBeTruthy();
});
