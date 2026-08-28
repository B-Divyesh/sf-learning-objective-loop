import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

const staticAppShell = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/privacy/index.html',
  '/terms/index.html',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/assets/objective-field-map.e409d0f7909f.webp',
  '/assets/objective-field-map-720.427b472e8f53.webp',
];

function serviceWorkerSource(cacheName: string, assets: string[]): string {
  return `const CACHE = '${cacheName}';
const CACHE_PREFIX = 'objective-loop-shell-';
const ASSETS = ${JSON.stringify(assets)};
const fromShellCache = (request) => caches.open(CACHE).then((cache) => cache.match(request));

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => {
    // The current tab can briefly remain controlled by the prior worker during
    // an update. Keep one earlier app shell so that tab still works offline.
    const previousShell = keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE).at(-1);
    return Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE && key !== previousShell).map((key) => caches.delete(key)));
  }).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  // A worker must always revalidate its own script; serving a runtime-cached
  // copy here would prevent the browser from discovering the next release.
  if (url.pathname === '/sw.js') return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fromShellCache('/index.html').then((cached) => cached || fetch(event.request)
      .catch(() => fromShellCache('/offline.html'))));
    return;
  }
  event.respondWith(fromShellCache(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) { const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(event.request, copy)); }
    return response;
  })));
});
`;
}

function versionedServiceWorker(): Plugin {
  return {
    name: 'objective-loop-versioned-service-worker',
    apply: 'build',
    generateBundle(_options, bundle) {
      const entryAssets = Object.keys(bundle)
        .filter((fileName) => fileName.startsWith('assets/') && /\.(?:js|css)$/.test(fileName))
        .map((fileName) => `/${fileName}`)
        .sort();
      const assets = [...staticAppShell, ...entryAssets];
      const releaseFingerprint = [
        ...assets,
        ...['index.html', ...staticAppShell.filter((asset) => asset !== '/' && asset !== '/index.html')]
          .map((asset) => readFileSync(resolve(process.cwd(), asset === 'index.html' ? asset : `public${asset}`))),
      ];
      const version = createHash('sha256').update(Buffer.concat(releaseFingerprint.map((item) => Buffer.isBuffer(item) ? item : Buffer.from(item)))).digest('hex').slice(0, 12);
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: serviceWorkerSource(`objective-loop-shell-${version}`, assets),
      });
    },
  };
}

export default defineConfig({
  plugins: [versionedServiceWorker()],
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: true,
  },
});
