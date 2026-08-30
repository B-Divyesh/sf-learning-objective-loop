import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

interface Claim {
  id: string;
  claim: string;
  test: string;
}

test('every registered claim has exactly one tagged regression', async () => {
  const claims = JSON.parse(await readFile('.factory/claims.json', 'utf8')) as Claim[];
  const sources = await Promise.all([
    readFile('tests/app.spec.ts', 'utf8'),
    readFile('src/crypto.test.ts', 'utf8'),
    readFile('src/scheduler.test.ts', 'utf8'),
  ]);
  expect(new Set(claims.map(({ id }) => id)).size).toBe(claims.length);
  for (const { id, claim, test: command } of claims) {
    expect(claim.trim().length, `${id} needs claim text`).toBeGreaterThan(0);
    expect(command, `${id} command must select its tag`).toContain(`@claim:${id}`);
    expect(sources.reduce((count, source) => count + source.split(`@claim:${id}`).length - 1, 0), `${id} tag count`).toBe(1);
  }
});
