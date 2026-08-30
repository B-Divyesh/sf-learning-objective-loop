# Objective Loop — independent verification 9

## Verdict: FAIL

- **Candidate commit:** `e0131c3c2aeadcbef02cdcb084289108f28eeb3f`
- **Live URL:** <https://learning-objective-loop.sociobot.in>
- **Verified:** 2026-08-30 UTC
- **Decision:** **FAIL — visible mobile links violate the required 44×44 CSS px touch-target baseline.**
- **Scope:** independent clean-checkout and deployed-PWA verification. No product
  source was modified.

## Release-blocking finding

### P2 — undersized touch targets on every route

At a 390×844 viewport, a Playwright scan measured every visible `a`, `button`,
`input`, `textarea`, `select`, and `summary`. It excluded the visually hidden
skip link, which correctly expands when focused. Every tested route contained
at least one visible target with a width or height below the contract's 44 px
minimum.

Representative measurements:

| Route | Target | Measured size |
| --- | --- | ---: |
| `/` and `/today` | See data and access options | 187.9×19 px |
| all app routes | Footer Privacy | 41.5×15 px |
| all app routes | Footer Terms | 33.8×15 px |
| `/privacy` | privacy@sociobot.in | 143.9×19 px |
| `/privacy`, `/terms` | Return to Objective Loop | 198.5×19 px |
| `/404.html` | Objective Loop home | 213.8×27.2 px |
| `/404.html` | Try sample data | 99.1×13.1 px |

The scan covered `/`, `/today`, `/demo`, `/objectives`, `/new-objective`,
`/data`, `/privacy`, `/terms`, and `/404.html`. Axe does not flag this project
contract, and the repository test only checks the wordmark and primary dock
items, so the existing suite passes while these links remain undersized.

## Cold first read

A fresh 1440×900 browser profile opened the live root with empty storage. The
first screen says **“Plan reviews around your learning objectives,”** names
self-learners using AI or other materials, and presents **“Try it with sample
data”** with the result “Opens three sample objectives and their due prompts.”
The action opens `/demo` in one click with three objectives, due prompts, and a
persistent **“Demo — sample data, nothing is saved to your notebook”** banner.

It answers what the product does, who it is for, and what to click first. The
plain-words and one-click-demo gate passes.

## Claims

`.factory/claims.json` exists and contains 17 unique claims. Before broader
repository inspection, each listed command was invoked. The unbootstrapped
clone initially lacked `node_modules`, so those invocations could not find
`tsc` or `vitest`. After the required `npm ci`, every exact command was rerun
and **17/17 passed**:

`objective-review-workflow`, `explained-scheduling`, `manual-override`,
`csv-export`, `encrypted-backup`, `offline-reload`, `private-core`,
`demo-sandbox`, `one-time-price`, `verified-license`, `manual-input-only`,
`nested-objectives-evidence`, `study-storage`,
`no-tracking-or-third-party-runtime`, `sociobot-network-boundary`,
`encrypted-restore`, and `passphrase-local-only`.

The claims registry test confirmed exactly one tagged regression per claim.
Landing and README capability/privacy statements map to registered claims; no
material unlisted claim was found.

## Clean local gates and deployment identity

```text
npm ci                                      PASS — 61 packages, 0 vulnerabilities
npm test                                    PASS — 8/8
npm run build                               PASS — TypeScript and production dist/
npm run test:e2e                            PASS — 32/32 Chromium tests
npm run test:live                           PASS — 29/29 against the live URL
npm run verify:live                         PASS — 19/19 deployed artifacts matched
service-worker update, --repeat-each=3      PASS — 3/3
```

There is no lint script or lint configuration. Type checking is part of the
build. The live index SHA-256 is
`117f3ef022e0f994cf948663870980220aabb1b5daa48505421c4c22e0b480f9`.
The live deployment therefore matches the candidate build; no fresh
deployment-only failure was found.

## End-to-end behavior and recovery

The repository suites and a separate live probe exercised:

- blank-objective validation and focus recovery;
- rejection of `javascript:` evidence, followed by a valid HTTPS recovery;
- objective limits of 120/500 characters and prompt limits of 400/1,200;
- objective, evidence, prompt, review, and immediate-navigation persistence;
- incorrect confidence-1 review scheduling to one day with its reason shown;
- manual review-date persistence, reload, and return to the calculated date;
- readable CSV and encrypted backup/restore, including wrong passphrase,
  cancel, and confirmed replacement;
- isolated demo reset/exit with real notebook preservation;
- named destructive confirmation and review-dialog Escape/focus restoration.

The independent populated mobile flow had no horizontal overflow, no console
or page errors, and no request outside the product origin. Desktop first-read,
desktop demo, and populated 390 px screenshots were visually inspected; the
dithered field-guide identity is product-specific and consistent with
`.factory/design.md`.

## Accessibility and browser health

- Axe found **0 serious and 0 critical** findings in empty, populated, demo,
  review-dialog, mobile, and dark states.
- Browser routes expose `lang=en`, descriptive route titles, one H1, a main
  landmark, labelled fields, and image alternatives.
- Keyboard navigation, Enter/Space operation, route focus/announcement,
  dialog focus restoration, and Escape passed.
- The first keyboard target is the skip link; its focused outline is a visible
  cobalt solid **3 px** ring.
- Dark-mode axe passed. Under `prefers-reduced-motion: reduce`, measured
  transition and animation durations were **0.01 ms** and scroll behavior was
  `auto`.
- **Touch-target sizing fails** as detailed above, so accessibility acceptance
  fails despite the axe result.

## Privacy, billing boundary, and response policy

Cold load, full study workflow, demo, review, CSV, encrypted backup, and
offline request logs contacted only
`https://learning-objective-loop.sociobot.in`. No analytics, ads, remote
fonts, or third-party runtime scripts loaded. Study records use IndexedDB with
separate real/demo namespaces and a localStorage fallback. Passphrases were
not stored or sent.

The product-scoped live billing checks returned fresh evidence:

- checkout returned **303** to `checkout.dodopayments.com`;
- an invalid license returned HTTP 200 with `{valid:false, reason:"invalid"}`;
- the verification allowance was **30 accepted requests per client**;
- request **31** returned **429** with **`Retry-After: 4`**.

Root response headers include CSP with `frame-ancestors 'none'`, HSTS with
subdomains, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, a
strict-origin referrer policy, and a restrictive permissions policy. Root HTML
and `sw.js` use `max-age=0` with revalidation. Hashed JS, CSS, and artwork use
one-year immutable caching.

There is no sign-in, product-owned backend, shared remote study store, library,
or CLI. Entra, backend concurrency/persistence/health, and consumer-package
checks do not apply.

## PWA, routes, and performance

- The standalone manifest parsed without errors and includes versioned start
  URL, 192/512 icons, and a maskable icon.
- Fresh `/demo` obtained service-worker control and reloaded offline with
  sample data and the offline state visible.
- The two-version worker update kept the hashed shell, announced the update,
  activated it, and reloaded offline in 3/3 consecutive runs.
- Every sitemap route returned 200. A new unknown route returned the designed
  404 with HTTP 404.

| Measure | Result | Contract |
| --- | ---: | ---: |
| Initial JavaScript | 49,284 B raw / 15,514 B gzip | ≤ 200 KB |
| Initial CSS | 22,608 B raw / 5,638 B gzip | ≤ 50 KB |
| Mobile hero WebP | 18,514 B | ≤ 300 KB |
| Fonts | 0 B | ≤ 120 KB |
| Lighthouse performance | 93 | ≥ 90 |
| Lighthouse accessibility / best practices / SEO | 100 / 100 / 100 | ≥ 95 a11y |
| FCP / LCP | 1.13 s / 1.34 s | LCP < 2.5 s |
| CLS | 0 | < 0.1 |
| Representative interaction event | 24 ms | < 200 ms |
| Total blocking time | 322.5 ms | informational |
| Lighthouse transfer | 51,837 B | informational |

## Defects by severity

| Severity | Finding | Release impact |
| --- | --- | --- |
| P1 | None found. | — |
| P2 | Visible touch targets below 44×44 px occur on every mobile route. | **Release blocking; candidate FAILS.** |
| P3 | None found. | — |

Repair the target boxes for all visible links—not only the primary navigation—
and add a 390 px regression that scans every route before re-verification.
