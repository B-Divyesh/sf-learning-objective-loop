# Objective Loop — independent verification 11

## Verdict: PASS

- **Candidate commit:** `dc1dd15cc92d9bdf64526d60fb06bcb0cd9e1b52`
- **Live URL:** <https://learning-objective-loop.sociobot.in>
- **Verified:** 2026-09-01 UTC
- **Scope:** clean working tree, production build, and deployed PWA. Product
  source was not changed during this verification.

The candidate meets the researched brief and the release contract. There are
no open product defects from this review.

## Cold first read and demo

A new browser context opened the live root at 1440×900 with no saved state.
The first screen says **“Plan reviews around your learning objectives,”** says
it is **for self-learners using AI or other materials**, and tells the visitor
to use **“Try it with sample data.”** Its adjacent explanation says the action
opens three sample objectives and their due prompts. The same headline, audience
description, action, and explanation are visible above the fold at 390×844.

The action opens `/demo` in one click. The demo immediately presents three
objectives, due and upcoming prompts, evidence, and prior review information.
Its persistent banner says **“Demo — sample data, nothing is saved to your
notebook”** and provides **Reset demo** and **Open my notebook**. The
plain-language, one-click sample-data, and sandbox-separation requirements pass.

## Required claim checks

`.factory/claims.json` exists and declares 17 claims. After clean dependency
installation, every exact command in that file passed from this candidate:

```text
objective-review-workflow             PASS   manual-override                 PASS
explained-scheduling                  PASS   csv-export                      PASS
encrypted-backup                      PASS   offline-reload                  PASS
private-core                          PASS   demo-sandbox                    PASS
one-time-price                        PASS   verified-license                PASS
manual-input-only                     PASS   nested-objectives-evidence      PASS
study-storage                         PASS   no-tracking-or-third-party-runtime PASS
sociobot-network-boundary             PASS   encrypted-restore               PASS
passphrase-local-only                 PASS
```

This covers the objective-to-prompt review workflow, disclosed 1/3/7/14/30/60/
120-day schedule, visible manual dates, CSV, encrypted backup and restore,
local storage, demo isolation, offline reload, private core request boundary,
license presentation, nested evidence, and passphrase handling. The visible
landing-page and README capability, privacy, offline, storage, export, price,
and scheduling statements are represented in the claim registry.

## Local and deployed checks

```text
git status --short       PASS — clean before verification
git rev-parse HEAD       dc1dd15cc92d9bdf64526d60fb06bcb0cd9e1b52
npm ci                   PASS — 61 packages installed; audit reported 0 vulnerabilities
npm test                 PASS — 8/8
npm run build            PASS — TypeScript check and dist/ output
npm run test:e2e         PASS — 34/34; Playwright .last-run.json status "passed"
npm run verify:live      PASS — 19/19 built files byte-match the live deployment
npm run test:live        PASS — 31/31; Playwright .last-run.json status "passed"
```

`npm run verify:live` reported the matched live `index.html` SHA-256 as
`2bb26823565d4e2b732d139244de5a074749f775ab6a02c0556d2d2ddeb822ee`.
The deployed product therefore matches the reviewed candidate build.

## Independent browser QA

- In a fresh live demo, a new objective and hand-written prompt were saved;
  the answer was revealed, graded correct at confidence 4, and scheduled for
  the visible 3-day next step. A blank required submission held focus on the
  required field for correction. The review dialog opened with focus on its
  close button.
- Desktop and 390px mobile contexts recorded no console errors or page errors.
  All rendered mobile links, buttons, fields, selects, and summaries measured
  at least 44×44 CSS px.
- Keyboard checks passed: the first Tab reaches the skip link with its designed
  visible focus outline, Enter moves into main content, and the review dialog
  starts with its close control focused.
- Live axe WCAG 2 A/AA scans of the demo, the populated workflow view, and
  390px mobile found **0 serious** and **0 critical** findings.
- A `prefers-reduced-motion: reduce` context reduced button transition and
  animation durations to `0.01ms`.
- A new live service-worker context loaded `/demo`, obtained service-worker
  control, was taken offline, and reloaded successfully with
  **“OFFLINE · SAVED HERE.”** The local PWA suite also passed its service-worker
  update followed by offline reload case.
- During the full core demo workflow, Playwright recorded only
  `https://learning-objective-loop.sociobot.in` requests. No analytics, ads,
  remote fonts, or other runtime origin appeared. The product has no
  product-owned server endpoint; checkout and license verification are the
  separately scoped Sociobot service and are covered by recorded browser
  fixtures in the declared claim tests. No direct request was made to that
  separate service during this product-only verification.
- All same-origin links collected from `/`, `/demo`, `/today`, `/objectives`,
  `/new-objective`, `/data`, `/privacy`, `/terms`, and `/404.html` returned
  HTTP 200. The deliberate missing route returned the designed HTTP 404 page.

## Headers, cache, and performance

The live root returned HTTP 200 with `Content-Security-Policy` limited to
`'self'` plus the documented billing connection, `frame-ancestors 'none'`,
HSTS including subdomains, `X-Frame-Options: DENY`, `X-Content-Type-Options:
nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and restrictive
Permissions-Policy values. The root and worker are revalidated (`max-age=0`);
the hashed application JavaScript is `public, max-age=31536000, immutable`.

The production build reports 15.98 kB gzip initial JavaScript and 5.64 kB gzip
CSS, within the static-PWA budgets. Fresh Lighthouse mobile results for the live
root: performance **99**, accessibility **100**, best practices **100**, SEO
**100**; FCP 1.0 s, LCP 1.3 s, TBT 100 ms, and CLS 0.

## Defects by severity

None.

