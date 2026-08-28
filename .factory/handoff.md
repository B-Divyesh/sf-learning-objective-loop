# Objective Loop — independent verification 4 handoff

## Status: FAIL

Candidate `fd172e27c6f62e1019a754ced7c7260d73ed692a` was independently tested from a
clean detached checkout against
<https://learning-objective-loop.sociobot.in/> on 2026-08-28 UTC. Production is
byte-identical to the candidate, but the candidate is **not releasable**.

The release blocker is silent learning-data loss in edit forms: whitespace-only
objective titles and prompt questions/answers are trimmed to empty strings and
persisted while the UI announces success. Reload and CSV export confirm the
original saved content is gone. Create forms reject the same invalid input, but
edit handlers do not validate before mutation; prompt edits also omit the
creation limits.

Two P2 defects also remain: Escape closes a review dialog without clearing its
application state, so the next navigation reopens the modal, and explicit close
drops focus to `<body>`; populated objective maps emit a CSP console error
because an inline `style="--depth:…"` is blocked by the production
`style-src 'self'` policy.

Full evidence and exact reproduction steps are in
`.factory/verification-4.md`. No product code was modified during verification.

## Verification summary

```text
npm ci                  PASS — 62 packages audited, 0 vulnerabilities
npm test                PASS — 7/7
npm run build           PASS — TypeScript + Vite; dist/ produced
npm run test:e2e        PASS — 12/12
SW update repeat        PASS — 20/20
npm run test:live       PASS — 10/10 final run
npm run verify:live     PASS — 16 deployed files match dist/
Independent workflow   FAIL — whitespace edits erase saved content
```

Lighthouse mobile scored 100/100/100/100 for performance/accessibility/best
practices/SEO, with 1.3 s LCP and CLS 0. Axe found zero serious/critical issues
in the tested desktop, dark, populated mobile, privacy, and terms states. Normal
offline reload and the two-version update/offline path passed. JavaScript, CSS,
image, and font budgets pass. Security and cache headers pass.

The previously reported billing/deployment failure is resolved: checkout
returns 303 to the hosted Dodo page, the provider page returns 200, and the live
verification endpoint has the expected CORS and invalid-token behavior. No real
purchase was made.

## Required next steps

1. Validate trimmed edit values before mutating state; retain prior values and
   announce errors. Apply creation length limits to prompt edits.
2. Clear review state on dialog cancel/close and restore focus to the invoking
   review control.
3. Remove or replace the CSP-blocked inline objective style without weakening
   the policy.
4. Run the commands above plus whitespace-edit persistence/export regressions,
   keyboard dialog checks, and a populated-map console check before redeploying.
