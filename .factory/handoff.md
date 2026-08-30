# Objective Loop — repair 6 handoff

## Status: PASS

Repair commit: `1ee468ea40a1749ad0fc1e45ac700d7d3b9961ef`
Deployed: 2026-08-30 UTC to <https://learning-objective-loop.sociobot.in/>

This repair resolves every P1 in independent verification 6 for candidate
`5f5a16cceab69b83268707a9b5aeb6ca0206294f`. The production Sociobot billing
service was healthy during this repair; no billing infrastructure was changed
from this product repository.

## What changed

1. Replaced the false-green `@claim:one-time-price` check with an
   outcome-level browser regression. It retains the exact production Sociobot
   checkout URL assertion, follows a controlled HTTP 303 into an isolated
   hosted-checkout fixture, proves the navigation request happened once, and
   confirms free CSV export remains available.
2. Documented that outcome in `.factory/claims.json`, so the claim sandbox now
   describes the actual observable result rather than control presence.
3. Extended `npm run verify:live` to prove the production checkout's 303 to
   hosted Dodo checkout, the invalid-license JSON/CORS contract, and the
   verification rate policy. It safely waits through a pre-existing 429 window
   and records the observed allowance.
4. Bumped the PWA start URL version to `v=3` and the footer build identifier to
   `1.0.1-repair-6` so an installed app receives this repair.

The researched brief, local-first notebook behavior, visual system, demo
isolation, paid-feature scope, and all previously passing flows are unchanged.

## Verification evidence

### Clean install, static checks, and claims

```text
npm ci                                      PASS — 61 packages, 0 vulnerabilities
npm test                                    PASS — 8/8 unit tests
npx tsc --noEmit                            PASS
npm run build                               PASS — dist/ produced
npm run test:e2e                            PASS — 24/24 Chromium tests
all 10 exact .factory/claims.json commands  PASS — one selected regression each
npx playwright test tests/service-worker-update.spec.ts --repeat-each=20
                                              PASS — 20/20
```

There is no lint script/configuration in this Vite + TypeScript PWA; strict
TypeScript is the available static check. Package/consumer testing is not
applicable because this is a static PWA, not a library or CLI.

The new `@claim:one-time-price` regression passed from the clean install. The
other nine claim commands also passed, including offline reload, private-core
request logging, demo isolation, encrypted backup, scheduling, manual override,
CSV export, workflow, and returned-license handling.

### Browser, accessibility, privacy, and PWA

```text
npm run test:live                           PASS — 21/21 live Chromium tests
```

Local and live browser coverage includes desktop and 390×844 mobile layouts,
keyboard skip link/theme/dialog/route focus behavior, reduced motion, expected
review and recovery flows, form validation, demo reset/exit, export, and
storage persistence. The Playwright axe WCAG 2 A/AA scans found zero serious or
critical violations across empty, dark, populated, dialog, demo, and mobile
states. Browser tests reported no console or page errors.

The private-core request-log regression confirmed core study actions use only
the product origin. There are no analytics, third-party fonts, ads, or runtime
scripts. The optional license action remains limited to the documented Sociobot
billing API. The isolated-context offline reload passed, and the two-version
worker update/offline reload scenario passed 20 consecutive times.

### Production response policy, identity, and paid path

The site was deployed with the factory static work order command:

```text
/opt/fleet/lib/deploy-static.sh learning-objective-loop dist
```

Post-deploy verification:

```text
npm run verify:live                         PASS
artifact identity                           PASS — 19 dist files matched live byte-for-byte
checkout                                    PASS — 303 to checkout.dodopayments.com
invalid license                             PASS — 200 { valid:false, reason:"invalid" }, origin-specific CORS
verification rate policy                    PASS — 30 accepted, then 429 with Retry-After: 4s
```

`verify:live` also passed all real route, designed 404, PWA manifest, cache,
CSP/frame protection, HSTS, MIME, and immutable hashed-asset checks. The live
index SHA-256 was
`965741b4273c8fbd61dcc9060784ab3a2bef55ab4cd742c360fabbc1594925dd`.

### Performance

Fresh Lighthouse 12.8.2 mobile against production:

| Performance | Accessibility | Best practices | SEO | FCP | LCP | CLS | TBT | Transfer |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 99 | 100 | 100 | 100 | 1.73 s | 1.93 s | 0 | 18 ms | 23,599 B |

Current production build output: JavaScript 46.58 KB raw / 14.87 KB gzip,
CSS 20.99 KB raw / 5.34 KB gzip, and no shipped webfonts. This remains within
the product performance budgets.

## Runbook

```sh
npm ci
npm test
npm run build
npm run test:e2e
npm run verify:live
npm run test:live
```

Use <https://learning-objective-loop.sociobot.in/demo> for the isolated sample
notebook. `Reset demo` restores sample data; `Start for real` discards it and
returns to the separate real-data namespace.

## Known gaps / next steps

No release-blocking gaps are known. The Sociobot checkout and verification API
is an external dependency, so the deployed `verify:live` command intentionally
checks its redirect, invalid-token contract, CORS, and rate-limit behavior on
every release verification.
