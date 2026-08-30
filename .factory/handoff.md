# Objective Loop — polish 1 handoff

## Status: ready for deployment check

Repairs are in commits `a4e28fca19a54eaa27e9281fd682e22ee0d356f9`
and `2317fe12c902bdb87ccaf4d2268f03a071c2de97`, based on adversarial review
commit `108ee3f8150d201eb0ff8e1c187940160677eb50`. Every F-1-1 through
F-1-36 is mapped to a product change and evidence in `.factory/polish-1.md`.

## What changed

- Completed the plain-language landing skeleton while retaining the dithered
  field-guide visual system.
- Added a one-click isolated demo path for both empty and existing notebooks,
  with Reset demo and Open my notebook controls.
- Registered 17 observable claims and strengthened the tagged browser/unit
  regressions for dates, demo isolation, privacy, restore, paid outputs,
  network boundaries, storage, and manual-only behavior.
- Corrected route titles, content-derived objective titles, 404 metadata and
  legal links, external-link announcements, mobile navigation, and all review
  copy findings.

## Verification evidence

From a clean clone at `/tmp/objective-loop-polish-clean` after `npm ci`:

```text
npm test -- -t "@claim:explained-scheduling"    PASS
npm test -- -t "@claim:encrypted-backup"        PASS
Every other exact command in .factory/claims.json PASS
```

The 15 browser claim commands each ran against a fresh Playwright context and
passed. The full local gate in the repair worktree passed:

```text
npm test                                      PASS — 8/8
npm run build                                 PASS — dist/ produced
npm run test:e2e                              PASS — 31/31
tests/deployment.spec.ts                      PASS
tests/service-worker-update.spec.ts           PASS
```

The production bundle is 48.53 KB JavaScript raw / 15.30 KB gzip and 22.61 KB
CSS raw / 5.63 KB gzip. The field-guide mobile illustration remains 18.5 KB.
No webfonts ship.

## Run and deploy

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

Deploy `dist/` as the existing static PWA. The repository’s static deployment
configuration remains in `public/staticwebapp.config.json`.

## Known gaps

None in local verification. The final live cold check is performed after the
push-triggered static deployment and recorded in the next handoff update.
