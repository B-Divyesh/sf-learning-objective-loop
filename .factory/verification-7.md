# Objective Loop — independent verification 7

## Verdict: PASS

- **Candidate commit:** `1ef62dcf4196a888f91c65cf7812f6930e433592`
- **Live URL:** <https://learning-objective-loop.sociobot.in>
- **Verified:** 2026-08-30 UTC
- **Scope:** independent release QA of the deployed offline PWA; no product
  source was changed during verification.

## Cold first read

In a fresh desktop browser context, the first screen said Objective Loop plans
reviews around learning objectives. It explicitly named self-learners using AI
or other materials, and its first primary action was **Try it with sample
data**, with the adjacent explanation that it opens three sample objectives and
their due prompts. It also plainly stated the offline, local-data, and price
facts. This satisfies the first-read and one-click sandbox requirements.

## Required claims — all pass

`npm ci` completed from the clean candidate checkout (61 packages, no reported
vulnerabilities). Every command named in `.factory/claims.json` passed against
the local demo entry point:

| Claim | Result |
| --- | --- |
| `objective-review-workflow` | PASS — objective, prompt, revealed answer, grade, explained next date, reload |
| `explained-scheduling` | PASS — disclosed 1/3/7/14/30/60/120-day ladder |
| `manual-override` | PASS — set, persist, clear to calculated date |
| `csv-export` | PASS — readable export preserves saved content |
| `encrypted-backup` | PASS — PBKDF2-SHA256/250,000 + AES-256-GCM without plaintext leak |
| `offline-reload` | PASS — fresh controlled context reloads demo offline |
| `private-core` | PASS — core study flow requests only product origin |
| `demo-sandbox` | PASS — one-click, resettable, separate sample namespace |
| `one-time-price` | PASS — controlled 303 checkout handoff and free CSV retained |
| `verified-license` | PASS — recorded valid verdict stores token, removes URL token, unlocks archive |

## Local quality gates

```text
npm test                                      PASS — 8/8 Vitest tests
npm run build                                 PASS — TypeScript check + Vite dist/
npm run test:e2e                              PASS — 24/24 Chromium tests
npx playwright test tests/service-worker-update.spec.ts --repeat-each=5
                                              PASS — 5/5 update + offline reload tests
```

There is no lint script or lint configuration; strict TypeScript is the
available static check. The PWA is not a package or CLI, so consumer package
installation testing does not apply.

Production build output is within the static-PWA budgets: JavaScript is
46.58 KB raw / 14.87 KB gzip and CSS is 20.99 KB raw / 5.34 KB gzip. No
webfonts ship.

## Live deployment, privacy, and response policy

`npm run verify:live` passed. It compared all 19 published artifact files
against this candidate's `dist/` byte-for-byte, including the live index SHA-256
`965741b4273c8fbd61dcc9060784ab3a2bef55ab4cd742c360fabbc1594925dd`.
This establishes that the deployment is the candidate artifact (the candidate
itself is the repair-6 verification/docs commit; the shipped footer build id is
`1.0.1-repair-6`).

Fresh live request logging on both the cold landing page and a demo review flow
showed only `https://learning-objective-loop.sociobot.in` requests for the core
app. No analytics, ad, font-CDN, or third-party runtime request appeared.
Console and page-error logs were empty. The optional billing route was tested
separately: checkout returned `303` to `checkout.dodopayments.com`; an invalid
license returned `{ valid: false, reason: "invalid" }` with origin-specific
CORS.

The documented license-verification allowance is enforced: **30** requests
from one client were accepted, request 31 returned **429**, and the response
included **`Retry-After: 4`** seconds.

Response checks passed for CSP (`default-src 'self'`, `frame-ancestors 'none'`,
Sociobot only in `connect-src`), HSTS with subdomains, `X-Frame-Options: DENY`,
`nosniff`, and restrictive permissions/referrer policy. Hashed JS and CSS have
one-year immutable caching; the service worker is revalidated (`max-age=0`);
the root is revalidated. All expected app routes, manifest, offline page,
privacy, terms, and designed 404 returned correctly.

## Accessibility, responsive use, and PWA behavior

The live page has the expected title, English document language, one H1, main
landmark, skip link, labelled controls, and alt text. The deployed Playwright
suite passed on desktop and at 390 × 844, including keyboard route focus,
dialog Escape/focus return, validation/recovery, dark treatment, and
reduced-motion behavior. Fresh independent 390 px demo checks found:

- no horizontal overflow (`390px` scroll width equals client width);
- a visible solid 3 px focus ring on the first Tab target;
- reduced-motion transition duration of `0.00001s`;
- zero axe serious/critical violations;
- a working service-worker-controlled offline reload with the demo banner and
  `Offline · saved here` status still present.

The service-worker update path was also regression-tested five consecutive
times locally. The live demo starts from `/demo`, has the persistent reset/real
data controls, and uses the documented separate demo storage namespace.

## Performance

Fresh Lighthouse mobile against production (Chrome headless) reported:

| Performance | Accessibility | Best practices | SEO | FCP | LCP | CLS | Transfer |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 92 | 100 | 100 | 100 | 0.9 s | 1.1 s | 0 | 42 KiB |

## Defects by severity

None. No release-blocking defect was found.

## Evidence locations

Ignored local evidence generated during this verification is under
`test-results/`, including `live-cold-desktop.png`, `live-demo-mobile.png`, and
`lighthouse-live.json`.
