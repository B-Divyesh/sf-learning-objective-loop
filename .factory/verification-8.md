# Objective Loop — independent verification 8

## Verdict: PASS

- **Candidate commit:** `91324afe7de2210a23d26589536549b19b9cdb53`
- **Live URL:** <https://learning-objective-loop.sociobot.in>
- **Verified:** 2026-08-30 UTC
- **Decision:** **PASS — no release-blocking product defect found.**
- **Scope:** clean-clone verification of the deployed offline PWA. No product
  source was changed.

## Cold first read

A new 1440×900 browser profile opened the live root with empty storage. The
first screen says **“Plan reviews around your learning objectives,”** names
self-learners using AI or other materials, and presents **“Try it with sample
data”** with the adjacent result: three sample objectives and their due
prompts. Offline, local-data, and price facts are also visible. The action
opens `/demo` in one click, where useful sample content and the persistent
**“Demo — sample data, nothing is saved to your notebook”** banner appear.

This passes the plain-words and one-click-demo release gate.

## Required claim tests

After `npm ci`, every exact command in `.factory/claims.json` passed from the
candidate checkout. Each claim ID occurs exactly once in the test sources.

| Claim | Result |
| --- | --- |
| `objective-review-workflow` | PASS |
| `explained-scheduling` | PASS |
| `manual-override` | PASS |
| `csv-export` | PASS |
| `encrypted-backup` | PASS |
| `offline-reload` | PASS |
| `private-core` | PASS |
| `demo-sandbox` | PASS |
| `one-time-price` | PASS |
| `verified-license` | PASS |
| `manual-input-only` | PASS |
| `nested-objectives-evidence` | PASS |
| `study-storage` | PASS |
| `no-tracking-or-third-party-runtime` | PASS |
| `sociobot-network-boundary` | PASS |
| `encrypted-restore` | PASS |
| `passphrase-local-only` | PASS |

The landing page and README claims map to this manifest; no unlisted material
capability claim was found.

## Clean local gates

```text
npm ci                    PASS — 61 packages, 0 vulnerabilities
npm test                  PASS — 8/8 Vitest tests
npm run build             PASS — TypeScript check and production dist/
npm run test:e2e          PASS on final full run — 31/31 Chromium tests
service-worker update     PASS — 5/5 consecutive two-version update runs
```

There is no lint script or lint configuration. TypeScript checking is part of
`npm run build`. The PWA is not a library or CLI, so consumer-package testing
does not apply.

One earlier complete browser run finished 30/31: `@claim:verified-license`
timed out waiting for the objective recall-rate row after already displaying
the unlocked state. The exact claim command had passed, 10/10 isolated repeats
passed, the 28-test live application suite passed, and the final 31-test suite
passed. This is recorded below as non-blocking test timing instability; the
product behavior could not be made to fail.

## Independent product exercise

A separate live browser probe, not based on the repository assertions, passed
34 checks at 390×844. It covered:

- creating a realistic objective, evidence link, prompt, and review;
- rejecting a blank objective and a `javascript:` evidence URL, retaining
  focus for recovery, then accepting a valid HTTPS link;
- confirming the 400-character question and 1,200-character answer limits;
- keeping an incomplete grade open, then recording an incorrect,
  confidence-1 result and explaining the one-day next review;
- applying a manual review date and retaining it across reload;
- downloading CSV, using the sample in one click, and preserving the separate
  demo banner/namespace;
- keyboard skip-link operation, dialog focus, 3 px visible focus, responsive
  layout, reduced motion, and service-worker-controlled offline reload.

No console error or uncaught page error appeared. The populated page and demo
were also visually inspected at 390 px; neither had horizontal overflow or
content hidden by the fixed navigation.

## Accessibility and browser health

- Live Playwright axe scans of the empty, populated, review-dialog, mobile,
  and dark states found **0 serious and 0 critical** violations.
- The live document has `lang=en`, a descriptive title, one H1, one main
  landmark, a working skip link, labelled controls, and image alternatives.
- Keyboard route changes move focus and announce the new page; dialogs restore
  trigger focus and close with Escape.
- The first focus target has a solid 3 px cobalt outline. Mobile body text is
  17 px and tested navigation/touch targets are at least 44 px with spacing.
- With `prefers-reduced-motion: reduce`, tested transition duration is at most
  0.001 seconds.

## Privacy, billing boundary, and response policy

The independent cold, full core-study, demo, review, CSV, and offline request
logs contacted only `https://learning-objective-loop.sociobot.in`. There were
no analytics, ads, remote fonts, or third-party runtime scripts. IndexedDB is
the primary store, with separate real/demo names and a localStorage fallback.
Encrypted backup/restore, wrong-passphrase/cancel recovery, and passphrase
non-retention passed their claim tests.

The optional billing boundary was tested separately:

- checkout returned **303** to `checkout.dodopayments.com`;
- invalid license verification returned the documented invalid verdict;
- the license-verification allowance is **30 accepted requests per client**;
  request 31 returned **429** with **`Retry-After: 4`** seconds.

Browser-observed and direct response headers include CSP with
`frame-ancestors 'none'`, HSTS with subdomains, `X-Frame-Options: DENY`,
`X-Content-Type-Options: nosniff`, strict-origin referrer policy, and a
restrictive permissions policy. Root HTML and `sw.js` use `max-age=0` with
revalidation; hashed JS, CSS, and artwork use one-year immutable caching.

There is no sign-in, product-owned server endpoint, or shared remote study
store. Entra, backend concurrency, backend persistence, and health-identity
checks are therefore not applicable.

## PWA, routes, identity, and performance

- The standalone manifest parses without errors and includes versioned start
  URL, 192/512 icons, and a maskable icon.
- A fresh live `/demo` context obtained service-worker control and reloaded
  offline with sample data and the offline state visible.
- The synthetic two-version worker update retained the hashed shell, announced
  the update, activated it, and reloaded offline in 5/5 consecutive runs.
- All sitemap/app/legal/offline routes returned 200; an unknown route returned
  the designed 404 with HTTP 404.
- `npm run verify:live` matched all **19** deployed artifacts byte-for-byte.
  The live index SHA-256 was
  `6013f312a386d9da5deb39637a6c8ff8ff9c8ced2916841fbf5cdce31ddb728a`.

| Measure | Result | Contract |
| --- | ---: | ---: |
| Initial JavaScript | 48,529 B raw / 15,225 B gzip | ≤ 200 KB |
| Initial CSS | 22,608 B raw / 5,638 B gzip | ≤ 50 KB |
| Mobile hero WebP | 18,514 B | ≤ 300 KB |
| Fonts | 0 B | ≤ 120 KB |
| Lighthouse performance | 93 | ≥ 90 |
| Lighthouse accessibility / best practices / SEO | 100 / 100 / 100 | ≥ 95 a11y |
| FCP / LCP | 1.01 s / 1.34 s | LCP < 2.5 s |
| CLS | 0 | < 0.1 |
| Representative Event Timing interaction | 24 ms | < 200 ms |
| Lighthouse transfer | 24,346 B | informational |

Lighthouse reported 310 ms total blocking time and does not publish INP for a
single lab navigation; the independent click interaction's Event Timing entry
was 24 ms.

## Defects by severity

| Severity | Finding | Release impact |
| --- | --- | --- |
| P1 | None found. | — |
| P2 | None found. | — |
| P3 | One full local browser run had a non-reproducing verified-license assertion timeout; the exact claim, 10 isolated repeats, live suite, and final full suite all passed. | Test timing should be watched, but no user-facing failure was reproduced. |

The candidate meets the researched brief and factory definition of done.
