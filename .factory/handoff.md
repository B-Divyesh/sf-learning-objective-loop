# Objective Loop v1 — handoff

## Shipped

- A responsive, offline-first TypeScript PWA for nested learning objectives, evidence links, hand-written recall prompts, correctness/confidence logging, and an explainable review queue.
- A fixed interval ladder (1, 3, 7, 14, 30, 60, 120 days) with plain-language reasons on every queue item, visible recent history, and clearly marked manual due-date overrides.
- IndexedDB persistence with a localStorage fallback; encrypted `.loop` backups using PBKDF2-SHA256 (250,000 iterations) and AES-256-GCM; encrypted restore and readable CSV export.
- A one-time $19 Study archive tier using the Sociobot checkout and verify contract. The optional tier adds cross-review insights and printable summaries. Core study, accessibility, manual scheduling, and exports are not gated.
- Installable manifest, 192/512/maskable icons, versioned service-worker cache, offline fallback, update notification, and offline status.
- Product-specific responsive light/dark dithered field-guide UI. The original generated illustration and prompt/provenance are in `assets/src/`; optimized 720 px and 1200 px WebP files are 19 KB and 63 KB.
- Dedicated `/privacy` and `/terms` documents, README, and MIT license.

## Verification

Run from `/work/repo`:

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

- `npm test`: 7/7 passing (scheduler edge cases and encrypted backup round trip/error handling).
- `npm run test:e2e`: 4/4 passing with Playwright 1.58.2 (full objective → prompt → review flow, refresh persistence, keyboard/theme accessibility, and offline reload).
- Axe WCAG A/AA scan: no serious or critical violations in light or dark treatments.
- Factory `verify-url.sh`: HTTP 200, one h1, `lang=en`, main landmark present, zero missing alt text, zero unlabeled buttons, and zero console errors.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices 100; LCP 1.4 s, TBT 40 ms, CLS 0.
- Production payload: 34.60 KB JS / 11.52 KB gzip; 19.07 KB CSS / 4.99 KB gzip; no runtime dependencies or CDN requests.
- `npm audit --omit=dev`: zero vulnerabilities. Full dependency audit: zero vulnerabilities.
- Build output is exactly `dist/`, with `dist/index.html` at its root.

## Known gaps / release notes

- The Sociobot product must be registered by the factory before checkout and verification work in production. The app intentionally uses the slug, never a product ID. Set `VITE_BILLING_API_BASE=https://pilot-api.sociobot.in/api/v1` for staging builds.
- Data is local to each browser and intentionally has no cloud sync. Learners should keep an encrypted backup when moving devices.
- The v1 schedule is deliberately fixed and inspectable; it does not estimate memory strength or generate content.
