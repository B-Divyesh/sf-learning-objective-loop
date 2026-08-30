import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

test('@claim:objective-review-workflow creates an objective, prompt, and review with an explained next date', async ({ page }) => {
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

  const trigger = page.getByRole('button', { name: 'Review', exact: true });
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close review' })).toBeFocused();
  const dialogResults = await new AxeBuilder({ page: page as never }).include('#review-dialog').withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(dialogResults.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.getByRole('link', { name: 'Data & access' }).click();
  await expect(page.getByRole('heading', { name: 'Your learning record belongs to you' })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await page.getByRole('link', { name: /^Review/ }).click();
  const reopenedTrigger = page.getByRole('button', { name: 'Review What determines escape velocity?' });
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
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\?demo=1#\/today$/);
  await expect(page.getByText('Demo — sample data, nothing is saved to your notebook.')).toBeVisible();
  await expect(page.locator('.metric-strip div').filter({ hasText: 'active objectives' }).getByText('3')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Why is it summer in Australia when it is winter in Europe?' })).toBeVisible();
  const demoResults = await new AxeBuilder({ page: page as never }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(demoResults.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
  await page.getByRole('link', { name: 'New objective' }).click();
  await page.getByLabel('Objective *').fill('Demo-only objective');
  await page.getByRole('button', { name: 'Save objective' }).click();
  await expect(page.getByRole('heading', { name: 'Demo-only objective' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('Demo sample restored.')).toBeVisible();
  await expect(page.getByText('Demo-only objective')).toHaveCount(0);
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/#\/today$/);
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toBeVisible();
  await expect(page.getByText('Demo-only objective')).toHaveCount(0);
  await page.goto('/?demo=1#/today');
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

test('@claim:one-time-price shows the $19 Sociobot purchase and keeps export free', async ({ page }) => {
  await page.goto('/#/data');
  await expect(page.getByRole('link', { name: 'Buy once · $19' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/learning-objective-loop/checkout');
  await expect(page.getByRole('button', { name: 'Export readable CSV' })).toBeVisible();
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
  await page.getByRole('button', { name: 'Review', exact: true }).click();
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
  expect(data.start_url).toMatch(/^\/\?v=\d+#\/today$/);
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

  await page.goto('/?license=paid-license-token#/data');
  await expect(page).toHaveURL(/\/#\/data$/);
  await expect(page.getByText('Study archive · unlocked')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('sb_license:learning-objective-loop'))).toBe('paid-license-token');
  expect(verificationRequests).toBe(1);
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
  const lastFact = await page.getByText('Core notebook free; Study archive $19 once.').boundingBox();
  const dock = await page.locator('.side-nav').boundingBox();
  expect(lastFact && dock && lastFact.y + lastFact.height <= dock.y).toBeTruthy();
});

test('@claim:private-core keeps populated objective links at least 44px tall on mobile', async ({ page }) => {
  const requestOrigins = new Set<string>();
  page.on('request', (request) => requestOrigins.add(new URL(request.url()).origin));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('link', { name: 'Create your first objective' }).click();
  await page.getByLabel('Objective *').fill('Explain plate tectonics');
  await page.getByRole('button', { name: 'Save objective' }).click();
  await page.getByRole('link', { name: 'Objective map', exact: true }).click();
  const objectiveLink = await page.getByRole('link', { name: /Explain plate tectonics/ }).boundingBox();
  expect(objectiveLink?.height).toBeGreaterThanOrEqual(44);
  const results = await new AxeBuilder({ page: page as never }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
  expect([...requestOrigins]).toEqual([new URL(page.url()).origin]);
});

test('@claim:offline-reload reloads while offline after the service worker controls the page', async ({ page, context }) => {
  await page.goto('/?demo=1#/today');
  await page.waitForFunction(() => navigator.serviceWorker?.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: /Objective Loop/i, level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Why is it summer in Australia when it is winter in Europe?' })).toBeVisible();
  await expect(page.getByText('Demo — sample data, nothing is saved to your notebook.')).toBeVisible();
  await expect(page.getByText(/Offline · saved here/i)).toBeAttached();
});
