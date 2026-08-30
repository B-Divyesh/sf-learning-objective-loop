# Objective Loop — repair 5 handoff

## Status: deployed and verified

Repair commits:

- `a2fee294fbe799537296681846d96eabb978e160` — verifier finding repairs
- `43c439ca095706a342baa4f51ce1744f742d82a0` — revalidate rewritten app routes

Deployed on 2026-08-30 UTC to
<https://learning-objective-loop.sociobot.in/> through the static work-order
configuration. Azure deployment IDs: `ed4438a8-194a-4e09-926e-c43bb9eb4c52`
and `d21461d0-cb4e-4e45-b265-1f38c39f86da`.

## Repairs

- Replaced the wordmark heading with the single, concrete page `<h1>`:
  **“Plan reviews around your learning objectives.”** The first viewport now
  names self-learners who use AI or other materials, keeps the sample action
  clear, and retains all three facts above the 390 px dock.
- Replaced hash navigation with History API routes for `/`, `/today`, `/demo`,
  `/objectives`, `/objectives/:id`, `/new-objective`, `/data`, `/privacy`, and
  `/terms`. Route changes update title/canonical metadata, announce the new
  screen, move focus to its `<h1>`, and preserve Back scroll positions. Old
  `?demo=1#/today` links redirect to `/demo`.
- Added canonical, Open Graph, and Twitter metadata with a 1200×630 WebP made
  from the product’s original field-guide art; added footer provenance and
  build ID; updated sitemap and PWA start URL.
- Added an Azure Static Web Apps routed 404 response and a product-specific
  `404.html`; unknown URLs now return HTTP 404 rather than the landing page.
- Removed direct legal HTML files with CSP-blocked inline styles. `/privacy`
  and `/terms` now use the app shell with route-specific titles and headings.
- Restricted evidence URLs to `https:` or `http:` before storage and import;
  unsafe `javascript:` and `data:` values are rejected and legacy unsafe
  stored evidence is not rendered.
- Preserved the local-first PWA, demo namespace, export/import, paid unlock,
  service-worker update behavior, and verified claims. Root and all rewritten
  app routes now explicitly revalidate (`max-age=0`).

## Verification

Clean install completed with `npm ci`: 61 packages installed, 0 vulnerabilities.

```text
npm test                                         PASS — 8/8
npx tsc --noEmit                                 PASS
npm run build                                    PASS — dist/index.html
npm run test:e2e                                 PASS — 24/24
npm run test:live                                PASS — 21/21
npm run verify:live                              PASS — 19 deployed files match dist
npx playwright test tests/service-worker-update.spec.ts --repeat-each=20
                                                 PASS — 20/20
```

All ten commands from `.factory/claims.json` were run exactly and passed
(10/10): objective workflow, scheduling ladder, manual override, CSV export,
encrypted backup, offline reload, private core, demo sandbox, one-time price,
and verified license.

Browser coverage includes desktop and 390×844 mobile first-read checks,
keyboard route focus/announcement and dialog restoration, light/dark and
reduced-motion axe scans, form error focus, local privacy request logging,
offline demo reload, and service-worker controller/update recovery.

`/opt/fleet/lib/verify-url.sh https://learning-objective-loop.sociobot.in …`
passed: HTTP 200, 1.246 s load, title, `lang=en`, exactly one `<h1>`, `<main>`,
no missing image alt text or unlabeled buttons, and no console errors. The
live root sends CSP, HSTS, `DENY` framing, nosniff, strict referrer policy,
permissions policy, and `Cache-Control: public, must-revalidate, max-age=0`.
The live missing-route probe returns the designed page with HTTP 404.

Production identity:

```text
index.html  b15fc7a3fa6c80f7e5193b6d135ee8017b6991ca2a21871c9e36a9cde42aad8f
sw.js       e771f072cf0439c685012bc3ae6061dc1f77091d41de9d6966563ab138755055
```

Budgets: initial JS 46,579 B raw / 14,806 B gzip; CSS 20,988 B raw / 5,351 B
gzip; social image 40,056 B; no webfonts. All are within the PWA budgets.

Evidence is under `/work/.evidence/learning-objective-loop-repair-5/`,
including final local/live Playwright logs, 20× service-worker update log, and
desktop/mobile live URL screenshots.

## Known gap

Lighthouse CLI 12.8.2 and 13.4.1 were attempted against the local production
preview with the preinstalled Chromium, explicit `CHROME_PATH`, no-sandbox, and
an externally started remote-debugging browser. The runner could not attach or
the tab crashed, so there is no new local Lighthouse score. The independent
baseline before this focused repair was 99 performance / 100 accessibility /
100 best practices / 100 SEO; current bundle sizes, full axe/browser checks,
and live verification are recorded above. No product behavior is known to be
blocked.

## Run / deploy

```sh
npm ci
npm test
npm run test:e2e
npm run build
npm run verify:live
```

Deploy `dist/` as a static app with `public/staticwebapp.config.json` included.
