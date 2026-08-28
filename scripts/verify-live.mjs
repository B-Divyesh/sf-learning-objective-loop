import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';

const origin = process.env.LIVE_ORIGIN || 'https://learning-objective-loop.sociobot.in';
const checkout = 'https://api.sociobot.in/api/v1/products/learning-objective-loop/checkout';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const root = await fetch(`${origin}/`, { cache: 'no-store' });
assert(root.status === 200, `root returned ${root.status}`);
assert(root.headers.get('cache-control')?.includes('max-age=0'), 'root is not revalidated');
assert(root.headers.get('content-security-policy')?.includes("default-src 'self'"), 'CSP is missing or permissive');
assert(root.headers.get('content-security-policy')?.includes("frame-ancestors 'none'"), 'CSP frame protection is missing');
assert(root.headers.get('strict-transport-security')?.includes('includeSubDomains'), 'HSTS is missing');
assert(root.headers.get('x-frame-options') === 'DENY', 'X-Frame-Options is not DENY');
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

const dist = resolve('dist');
const files = [];
async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await collect(path);
    else files.push(path);
  }
}
await collect(dist);

const digest = (value) => createHash('sha256').update(value).digest('hex');
for (const file of files) {
  const path = relative(dist, file).split(sep).join('/');
  if (path === 'staticwebapp.config.json') continue;
  const response = await fetch(`${origin}/${path}`, { cache: 'no-store' });
  assert(response.status === 200, `identity check ${path} returned ${response.status}`);
  assert(digest(await readFile(file)) === digest(Buffer.from(await response.arrayBuffer())), `live ${path} does not match dist/${path}`);
}

const localIndex = await readFile(resolve('dist/index.html'));
const liveIndex = Buffer.from(html);
assert(digest(localIndex) === digest(liveIndex), 'live index.html does not match dist/index.html');

console.log(`live verification passed: ${origin}`);
console.log(`index sha256: ${digest(liveIndex)}`);
console.log(`artifact identity: ${files.length - 1} files matched`);
console.log(`checkout: ${checkoutResponse.status} ${new URL(checkoutLocation).host}`);
