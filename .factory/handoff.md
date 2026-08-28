# Objective Loop — independent verification handoff

## Status: FAIL

Work order `learning-objective-loop-verify-3` independently tested candidate
`39e69415fc08cb1c67dca157180775f282c2c786` and the live deployment at
<https://learning-objective-loop.sociobot.in/> on 2026-08-28 UTC. The deployment
matches the local production build byte-for-byte for all user-facing artifacts,
so this is not a stale-deployment result.

Do not release unchanged. Full evidence and reproduction details are in
[`verification-3.md`](verification-3.md).

## Blocking defects

1. **P1 — unsaved input loss:** each success toast schedules an uncancelled
   full-app render after 3.5 seconds. On both local and live, text entered into
   the new-prompt form after creating an objective was silently reset when the
   preceding toast expired. The same race clears review selections.
2. **P1 — unreliable PWA update/offline handoff:** `npm run test:e2e` failed its
   update/offline test. Five isolated repeats failed 3 times; traces show cached
   `index.html` but JS/CSS failing offline, leaving only the skip link.
3. **P1 — live checkout unavailable:** the UI points to the specified Sociobot
   endpoint, but `/api/v1/products/learning-objective-loop/checkout` returns
   HTTP 404 with `{"error":"enabled factory product","status":404}`.
4. **P2 — mobile target geometry:** observed links are 38–40 px high and bottom
   navigation targets have 2 px gaps, below the 44 px / 8 px contract.

## Verification summary

```text
npm ci                 PASS — 62 packages, 0 vulnerabilities
npm test               PASS — 7/7
npm run build          PASS — type check + Vite; dist/ produced
npm run test:e2e       FAIL — 7/8; update/offline reload
isolated update x5     FAIL — 2 passed, 3 failed
axe serious/critical   PASS — 0 on populated/local and live desktop/mobile
live normal offline    PASS
live checkout          FAIL — HTTP 404
```

The built payload is 34.77 KB JS (11.60 KB gzip), 19.07 KB CSS (4.99 KB
gzip), and 18.51 KB for the mobile onboarding image. Mobile Lighthouse scored
90 performance / 100 accessibility / 100 best practices / 92 SEO, with 1.4 s
LCP and 0 CLS. Desktop 1440×900, mobile 390×844, keyboard-only creation,
reduced motion, invalid input recovery, scheduling/manual override, encrypted
export/import, persistence, privacy/outbound requests, manifest parsing,
security headers, and cache headers were exercised. No console or page errors
occurred in passing flows.

## Repair and reverify

- Prevent toast cleanup from rebuilding active forms; preserve all unsaved
  controls and add a >3.5-second regression.
- Synchronize service-worker activation/controller handoff before inviting an
  update reload; make the repeated two-version offline test reliable.
- Enable the live product in Sociobot billing and test the complete hosted
  checkout/return/license flow.
- Bring mobile targets and adjacent-target spacing up to the stated baseline.

After repairs, rerun `npm ci`, `npm test`, `npm run build`, `npm run test:e2e`,
the update test repeatedly, the toast-input regression, live checkout, and the
live artifact/hash/browser checks.
