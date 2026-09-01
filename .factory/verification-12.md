# Objective Loop — independent verification 12

## Verdict: PASS

- **Candidate commit:** `b7bd147e92f805611bff57b593245c2157565aa0`
- **Published URL:** <https://learning-objective-loop.sociobot.in>
- **Verified:** 2026-09-01 UTC
- **Scope:** Clean checkout, production build, and published PWA. No product
  source was changed during this verification.

The published artifact byte-matches this candidate and the product satisfies
the researched offline-learning-objective workflow.

## Cold first read and demo

In a new browser context at the live root, the first screen says **“Plan
reviews around your learning objectives.”** It says this is **for
self-learners using AI or other materials** and presents **“Try it with sample
data”** with the explanation **“Opens three sample objectives and their due
prompts.”** This answers what it does, who it is for, and what to select first
in plain words. The same content was visible at 390 × 844.

Selecting that action opened `/demo` in one click. It showed three active
objectives, three recall prompts, one logged review, the persistent **“Demo —
sample data, nothing is saved to your notebook.”** banner, and **Reset demo**.
The declared demo-isolation claim also creates real and demo records, resets
the demo, leaves it, and confirms that the real record remains separate.

## Required claim checks

`.factory/claims.json` exists and has 17 declared claims. After `npm ci`, every
exact declared command passed:

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

This includes the disclosed 1/3/7/14/30/60/120-day ladder, review logging,
manual dates, nested HTTP(S) evidence, CSV, encrypted backup/restore,
passphrase handling, IndexedDB/fallback storage, demo separation, privacy
boundary, and returned-license behavior.

## Local checks

```text
git rev-parse HEAD      b7bd147e92f805611bff57b593245c2157565aa0
git status --short      clean before report changes
npm ci                  PASS — 61 packages; audit reported 0 vulnerabilities
npm test                PASS — 8/8
npm run build           PASS — TypeScript check and dist/ output
npm run test:e2e        PASS — 35/35
```

There is no separate lint script; the production build includes `tsc --noEmit`.
The production build produced 16.11 kB gzip JavaScript and 5.64 kB gzip CSS,
within the PWA budgets.

The local browser suite covered normal objective/prompt/review completion;
invalid HTTP(S) evidence, blank required fields, and over-limit text with
focused recovery; schedule overrides; export/restore cancellation and wrong
passphrase recovery; dialog keyboard behavior; and service-worker update plus
offline reload.

## Published deployment checks

```text
npm run verify:live     PASS — 19/19 built files match the published artifact
npm run test:live       PASS — 32/32
```

`npm run verify:live` reported live index SHA-256
`968b3bc94c72d8e905ff3fb8e24a348d47cb43c146727c60bccea0110bae7565`.
The live root, app routes, legal pages, manifest, worker, offline page, and
designed 404 returned the expected status. A missing route returned HTTP 404.

An independent live browser check recorded only
`https://learning-objective-loop.sociobot.in` during the complete cold-root to
demo flow. It recorded no page or console errors and found no serious or
critical axe WCAG 2 A/AA findings. The live core flow therefore has no
analytics, ads, remote fonts, or third-party JavaScript requests.

At 390 × 844 there was no horizontal overflow. Keyboard Tab first reached the
visible **Skip to main content** link with a `rgb(23, 82, 184)` 3 px solid
focus outline. In reduced-motion mode, observed transition and animation
durations were `0.00001s`. After service-worker control, the live demo reloaded
offline and displayed the **Offline · saved here** notice. The local update
test also confirmed an update toast, changed cache, and successful offline
reload after selecting Reload update.

The live root uses `max-age=0`; `sw.js` uses `max-age=0`; and the hashed entry
script uses `public, max-age=31536000, immutable`. Response headers include a
same-origin CSP with only the documented Sociobot billing connection,
`frame-ancestors 'none'`, HSTS with subdomains, `X-Frame-Options: DENY`,
`X-Content-Type-Options: nosniff`, restrictive Permissions Policy, and
`Referrer-Policy: strict-origin-when-cross-origin`.

Fresh mobile Lighthouse results: performance **96**, accessibility **100**,
best practices **100**, and SEO **100**; FCP **0.9 s**, LCP **1.2 s**, TBT
**220 ms**, and CLS **0**.

## Purchase and license verification boundary

The product has no product-owned server endpoint or sign-in flow. Its only
optional remote product function is the documented Sociobot checkout/license
verification boundary. A fresh checkout request for this product returned HTTP
303 to the hosted checkout. From one client, the license verification endpoint
returned 30 responses before rate limiting; request 31 returned HTTP 429 with
`Retry-After: 4` (and requests 32–35 did the same). The observed allowance is
therefore **30 verification requests per client per window**. Entra sign-in is
not applicable because the product does not require sign-in.

## Defects by severity

None.
