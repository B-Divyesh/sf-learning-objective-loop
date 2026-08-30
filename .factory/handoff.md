# Objective Loop — independent verification 6 handoff

## Status: FAIL

Candidate `5f5a16cceab69b83268707a9b5aeb6ca0206294f` was tested from a clean
checkout against <https://learning-objective-loop.sociobot.in/> on 2026-08-30
UTC. Do not release while the production paid path is unavailable.

The live static site matches all 19 candidate build artifacts byte-for-byte.
The first-read/demo gate, all ten declared claim commands, 8/8 unit tests,
24/24 local browser tests, 21/21 live browser tests, TypeScript, production
build, axe, offline reload, and 20/20 service-worker update repetitions pass.
Fresh Lighthouse scores are 97 performance / 100 accessibility / 100 best
practices / 100 SEO.

## Release blockers

1. The live **Buy once · $19** action reaches the correct Sociobot URL but gets
   HTTP 503. License verification also gets 503. Three repeated probes per
   endpoint produced the same result, and `npm run verify:live` fails with
   `checkout returned 503`.
2. A 35-request single-client probe received 503 for every request, never 429,
   and no `Retry-After`; the required allowance cannot be observed.
3. The tagged `@claim:one-time-price` test only checks the checkout `href` and
   free CSV control. It passes while checkout is unavailable, so it does not
   test the promised purchase outcome.

The free local notebook degrades safely when verification fails, displaying
`License verification is unavailable. Your core notebook still works offline.`
That recovery does not make the advertised purchase/license path releasable.

## Verification summary

```text
npm ci                             PASS — 61 packages, 0 vulnerabilities
npm test                           PASS — 8/8
npx tsc --noEmit                   PASS
npm run build                      PASS — dist/ produced
npm run test:e2e                   PASS — 24/24
npm run test:live                  PASS — 21/21
npm run verify:live                FAIL — checkout HTTP 503
all .factory/claims.json commands  PASS mechanically — 10/10
service-worker update repeat       PASS — 20/20
```

Independent live checks also passed normal and invalid review flows, input
boundaries and recovery, persistence, manual dates, CSV, encrypted backup and
restore, same-origin core request logging, keyboard/dialog focus, reduced
motion, 390 px layout, security headers, immutable hashed-asset caching, PWA
manifest, offline reload, and designed 404 behavior. No serious/critical axe
findings or console/page errors were observed.

Full evidence, defects, hashes, budgets, and retest criteria are in
`.factory/verification-6.md`. Runtime evidence is under
`/work/.evidence/learning-objective-loop-verify-6/`.

## Required next step

Restore the Sociobot production billing API, add an outcome-level price claim
test, prove the live rate limit returns 429 with `Retry-After`, then rerun the
full verification matrix. No product source was changed during this review.
