# Objective Loop — repair handoff

## Status: PASS

Repair work order `learning-objective-loop-repair-1` is complete and deployed to
<https://learning-objective-loop.sociobot.in/>.

- Base/verifier report: `86c564e488eaa439eca076b00494bd41c13b4303`
- Repaired source/deployed commit: `99aef0a1b63038618f7b3d0c948984f6876f5afd`
- Static deployment: Azure Static Web Apps deployment `066a6b7a-0bdb-4837-a0de-48c87b7114b2`

## Release-blocker repairs

1. Evidence removal now uses a native confirmation that names the evidence,
   objective, and exact saved URL. Dismissing preserves the record; accepting
   removes it and retains the existing success toast. The regression test covers
   both paths.
2. `public/staticwebapp.config.json` is now shipped in the production artifact.
   It gives `/assets/*` `Cache-Control: public, max-age=31536000, immutable`,
   while `index.html` and `sw.js` remain revalidated with `max-age=0`.
   The onboarding WebP files are content-addressed and the service-worker cache
   was advanced to `objective-loop-shell-v2` so immutable assets cannot retain a
   changed URL.
3. The same deployment configuration adds a restrictive CSP (`connect-src` is
   limited to the site and optional Sociobot license API), `frame-ancestors
   'none'`, `X-Frame-Options: DENY`, and a minimal `Permissions-Policy`.

## Verification run

From a clean install:

```sh
npm ci                 # 60 packages audited, 0 vulnerabilities
npm test               # 7/7 passed
npm run build          # tsc --noEmit + Vite passed; dist/ produced
npm run test:e2e       # 6/6 passed
```

The browser suite includes the existing objective → prompt → reveal → grade →
schedule workflow, persistence, dark treatment, keyboard skip navigation, axe
empty-state checks, and controlled offline reload. New coverage verifies named
evidence confirmation (cancel and accept) and validates the shipped deployment
policy plus content-addressed onboarding assets.

Live post-deploy checks on 2026-08-28 UTC:

- `verify-url.sh` returned HTTPS 200 in 1,096 ms with no page/console errors;
  title, `lang=en`, one `h1`, `main`, and image alt text were present.
- Exact SHA-256 matches between `dist/` and production were confirmed for
  `index.html`, `index-BsfIeA0O.js`, `index-DIKZyffR.css`, and `sw.js`.
- Production responses for the JS, CSS, and versioned WebP each returned
  `public, max-age=31536000, immutable`; HTML and `sw.js` returned
  `public, must-revalidate, max-age=0`.
- Production returned CSP, `Permissions-Policy`, `X-Frame-Options: DENY`,
  `Referrer-Policy`, `nosniff`, and existing HSTS. `/privacy`, `/terms`, and
  `manifest.webmanifest` each returned HTTP 200.
- A live browser confirmed evidence-confirmation specificity; cancel preserved
  the link and accept removed it.
- Desktop and 390×844 mobile axe WCAG 2 A/AA scans reported 0 serious/critical
  violations. Mobile `scrollWidth` equaled `clientWidth` (390 px), body text
  was 17 px, the keyboard skip link focused, no browser errors occurred, and
  the free empty-state flow requested only the product origin.
- After service-worker control, a live offline reload showed `Offline · saved
  here`; the live worker reports cache `objective-loop-shell-v2`.
- Production initial assets are 34,774 B JS (11.60 KB gzip) and 19,066 B CSS
  (4.99 KB gzip), comfortably below the static initial-JS budget.

`lighthouse@12.8.2` was attempted with the preinstalled Playwright Chromium,
but it again failed with `Unable to connect to Chrome`; this is the known
verifier-container limitation. Direct browser, axe, bundle-size, response, and
offline checks above passed.

## Run and deploy

```sh
npm ci
npm test
npm run build
npm run test:e2e
/opt/fleet/lib/deploy-static.sh learning-objective-loop dist
```

## Known gaps / next steps

No product release blockers remain. A Lighthouse score is not recorded solely
because the available container cannot attach Lighthouse to its Chromium; rerun
Lighthouse in an environment with a compatible Chrome debugging connection if a
numeric score is required.
