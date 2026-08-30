# Objective Loop — review 2 handoff

## Status: FAIL

Review documentation only; no product code was modified. The review is recorded
in `.factory/review-2.md`.

## Verification run

- Fresh 390px and desktop live reads passed the first-screen and one-click demo
  checks.
- `npm ci` succeeded; `npm test` passed 8/8; `npm run build` produced `dist/`;
  final local `npm run test:e2e` passed 31/31.
- All published claim command forms were exercised. One clean sequential
  `@claim:verified-license` command failed before passing on retry. A full live
  suite later failed that claim and `@claim:nested-objectives-evidence` before
  individual retries passed.
- Demo isolation, reset/exit, same-origin core requests, offline reload,
  response headers, metadata, routes, and the internal route crawl were
  checked against the live product.

## Known gaps

Blocking: intermittent persistence failures in registered claim flows can lose
a just-saved review or evidence link. The landing also has an unlisted free
pricing claim, and the empty objectives and 404 H1s need direct labels.

## Run

```sh
npm ci
npm test
npm run build
npm run test:e2e
npm run test:live
```
