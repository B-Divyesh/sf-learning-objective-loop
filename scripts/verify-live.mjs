import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';

const origin = process.env.LIVE_ORIGIN || 'https://learning-objective-loop.sociobot.in';

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

for (const path of ['/', '/index.html', '/today', '/demo', '/data', '/privacy', '/terms', '/sw.js', '/manifest.webmanifest', '/offline.html', '/404.html']) {
  const response = await fetch(`${origin}${path}`, { cache: 'no-store' });
  assert(response.status === 200, `${path} returned ${response.status}`);
}

const missing = await fetch(`${origin}/definitely-missing-verifier-route`, { cache: 'no-store' });
assert(missing.status === 404, `missing route returned ${missing.status}`);
assert((await missing.text()).includes('<h1>Page not found</h1>'), 'missing route did not serve the designed 404 page');

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
console.log('billing endpoints are exercised by intercepted browser claim fixtures, not this product-only live check');
