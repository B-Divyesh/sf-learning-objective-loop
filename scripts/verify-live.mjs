import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const origin = process.env.LIVE_ORIGIN || 'https://learning-objective-loop.sociobot.in';
const checkout = 'https://api.sociobot.in/api/v1/products/learning-objective-loop/checkout';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const root = await fetch(`${origin}/`, { cache: 'no-store' });
assert(root.status === 200, `root returned ${root.status}`);
const html = await root.text();
assert(html.includes('<title>Objective Loop'), 'live title does not identify Objective Loop');
assert(html.includes('lang="en"'), 'live document language is missing');

const entry = html.match(/(?:src|href)="(\/assets\/index-[^"]+\.(?:js|css))"/g) || [];
assert(entry.length === 2, `expected two hashed entry assets, found ${entry.length}`);
for (const attribute of entry) {
  const path = attribute.match(/"([^"]+)"/)?.[1];
  const response = await fetch(`${origin}${path}`, { cache: 'no-store' });
  assert(response.status === 200, `${path} returned ${response.status}`);
  assert(response.headers.get('cache-control')?.includes('immutable'), `${path} is not immutable`);
}

for (const path of ['/', '/index.html', '/sw.js', '/manifest.webmanifest', '/privacy/', '/terms/', '/offline.html']) {
  const response = await fetch(`${origin}${path}`, { cache: 'no-store' });
  assert(response.status === 200, `${path} returned ${response.status}`);
}

const checkoutResponse = await fetch(checkout, { redirect: 'manual' });
assert(checkoutResponse.status === 303, `checkout returned ${checkoutResponse.status}`);
const checkoutLocation = checkoutResponse.headers.get('location');
assert(checkoutLocation?.startsWith('https://checkout.dodopayments.com/session/'), 'checkout did not redirect to the hosted provider');

const verifyResponse = await fetch('https://api.sociobot.in/api/v1/products/learning-objective-loop/verify?license=invalid-live-probe', {
  headers: { Origin: origin },
});
assert(verifyResponse.status === 200, `license verification returned ${verifyResponse.status}`);
const verdict = await verifyResponse.json();
assert(verdict.valid === false && verdict.reason === 'invalid', 'invalid license was not rejected');
assert(verifyResponse.headers.get('access-control-allow-origin') === origin, 'license verification CORS does not allow the product origin');

const localIndex = await readFile(resolve('dist/index.html'));
const liveIndex = Buffer.from(html);
const digest = (value) => createHash('sha256').update(value).digest('hex');
assert(digest(localIndex) === digest(liveIndex), 'live index.html does not match dist/index.html');

console.log(`live verification passed: ${origin}`);
console.log(`index sha256: ${digest(liveIndex)}`);
console.log(`checkout: ${checkoutResponse.status} ${new URL(checkoutLocation).host}`);
