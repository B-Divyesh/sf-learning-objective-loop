# Objective Loop — polish 3 handoff

## Status: PASS

The released repair is deployed at
<https://learning-objective-loop.sociobot.in>. The artifact code is commit
`b229dbc300165013576731b83ae03f1f3de58735` on `main`, following the checkout
repair in `37fe0bb`. Live verification matched all 19 built artifacts; the
deployed `index.html` SHA-256 is
`2bb26823565d4e2b732d139244de5a074749f775ab6a02c0556d2d2ddeb822ee`.

## What changed

- Made returned Study archive licenses deterministic: a returned token enters
  a checking state, forces its own fresh verification, scopes cached verdicts
  to the token, and exposes a retry state without blocking free study tools.
- Strengthened `@claim:one-time-price` with a controlled checkout return,
  explicit response wait, archive/rate/print assertions, and three additional
  fresh-context returned-license runs with service workers blocked.
- Proved direct `/?demo=1` sample entry, banner, and reset behavior in the
  sandbox claim. Documented both demo URLs and updated the catalog sentence.
- Updated current footer/404 build identification to `1.0.5-polish-3`.

## Verification

- Fresh clone `/tmp/learning-objective-loop-clean.oOVv89`: `npm ci`, every one
  of the 17 exact commands in `.factory/claims.json`, `npm test` (8/8),
  `npm run build`, and `npm run test:e2e` (34/34) passed on the first run.
- Final local: `npm test` (8/8), `npm run build`, and `npm run test:e2e`
  (34/34) passed after the build-id update.
- Deployment: `/opt/fleet/lib/deploy-static.sh learning-objective-loop dist`
  completed successfully for the scoped `sf-learning-objective-loop` app.
- Live: `npm run verify:live` passed (19 artifacts), `npm run test:live`
  passed (31/31), and `/opt/fleet/lib/verify-url.sh` found HTTPS 200, no
  console errors, title/lang/one H1/main, image alt text, and no unnamed
  buttons. Evidence: `.factory/polish-3-artifacts/verify-live/`.
- Live direct demo and controlled returned-license checks produced
  `live-demo-direct-mobile.png` and `live-checkout-return.png` with no console
  errors.
- Lighthouse mobile: performance 100, accessibility 100, best practices 100,
  SEO 100; LCP 1.1 s, CLS 0, TBT 10 ms. Evidence:
  `.factory/polish-3-artifacts/lighthouse-live.json`.
- The standalone `@axe-core/cli` Selenium launcher could not start Chrome in
  this container. The equivalent `@axe-core/playwright` WCAG 2 A/AA scans ran
  successfully in the installed Chromium during the passed local and live
  browser suites.

## Run and deploy

```sh
npm ci
npm test
npm run build
npm run test:e2e
npm run verify:live
npm run test:live
```

Deploy the generated `dist/` directory with the configured static work-order
helper: `/opt/fleet/lib/deploy-static.sh learning-objective-loop dist`.

## Known gaps and next steps

No known product gaps or unresolved review findings remain. The next normal
step is only to retain the existing claim and live-suite checks for future
changes.
