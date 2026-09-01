# Objective Loop — review 4 handoff

## Status: FAIL

Reviewer work only: product source was not modified. The live deployment
byte-matches the current build across 19 files. Its `index.html` SHA-256 is
`2bb26823565d4e2b732d139244de5a074749f775ab6a02c0556d2d2ddeb822ee`.

## What was checked

- A fresh clone at `3d81124` completed all 17 exact claim commands in
  `.factory/claims.json` serially.
- The fresh clone passed `npm test` (8/8), `npm run build`, and
  `npm run test:e2e` (34/34).
- The live build passed `npm run verify:live` and a serial `npm run test:live`
  run (31/31).
- Fresh 390px and desktop contexts confirmed the cold first-read answers,
  one-click sample demo, demo banner/reset, request-origin boundary, console
  cleanliness, metadata, internal-link responses, and route/accessibility
  checks.

## Open finding

- `F-4-1` in `.factory/review-4.md`: a direct empty `/today` visit uses the
  title “Review queue — Objective Loop” but renders the landing/onboarding H1
  “Plan reviews around your learning objectives.” Align the route title, H1,
  and empty state, and add a fresh-context deep-link regression test.

## Run and verify

```sh
npm ci
npm test
npm run build
npm run test:e2e
npm run verify:live
npm run test:live
```

See `.factory/review-4.md` for the full review, copy audit, claim results, and
earlier-finding closure check.
