# Objective Loop — repair 4 handoff

## Status: repaired, deployed, and verified

Work order `learning-objective-loop-repair-4` repaired every P1 and P2 finding
in `.factory/verification-4.md` for candidate
`fd172e27c6f62e1019a754ced7c7260d73ed692a`. The repair is live at
<https://learning-objective-loop.sociobot.in/>. Deployment ID:
`151b2a30-6a7c-4541-9907-f06240c5b2c9`.

The artifact remains a static, offline-first Vite and TypeScript PWA. The
researched brief, field-guide visual system, local-first data model, scheduling
rules, paid tier, and previously passing behavior remain intact.

## Repairs

1. **Edit data loss:** objective and prompt edits now trim and validate before
   mutating state. Blank titles, questions, or answers are rejected. Objective
   title/description limits remain 120/500 characters; prompt edit controls now
   enforce the creation limits of 400/1,200 characters. Errors use an alert,
   mark and focus the invalid field, preserve the saved record, survive reload,
   and leave CSV output unchanged.
2. **Review-dialog lifecycle:** native `cancel` and `close` events now clear the
   active review. Escape cannot reopen a review during later navigation.
   Escape, the close button, and successful grading restore focus to the exact
   invoking review control.
3. **Production CSP error:** removed the unused objective-tree inline custom
   property. The populated map now renders without inline styles or CSP console
   errors. Production `style-src 'self'` remains unchanged.
4. **Factory evidence contract:** added `.factory/claims.json`, with one tagged
   test for each of ten public claims, plus `.factory/copy-audit.md`.
5. **Isolated sample:** the first screen now opens realistic sample data in one
   click. Demo changes use `objective-loop-demo` / `demo:objective-loop:state`,
   never read real records, reset on request, and are deleted by **Start for
   real**. Details are in `.factory/demo.md`.
6. **Mobile first screen:** privacy, offline, and price facts remain above the
   fixed dock at 390×844. `robots.txt` and `sitemap.xml` restore a complete SEO
   check.

## Exact regression coverage

- `@claim:csv-export` first reproduced the verifier's whitespace edit failure
  on the untouched candidate. It now rejects blank objective title, prompt
  question, and prompt answer edits, verifies announced errors and focus, then
  proves original values after reload and in the downloaded CSV.
- The over-limit regression bypasses browser `maxlength` defensively and tests
  121/501/401/1,201-character edits. Each is rejected before mutation, focused,
  reloaded, and checked in CSV.
- The dialog regression tests initial focus, an axe scan inside the modal,
  Escape, later navigation, explicit close, and trigger-focus restoration.
- The populated-map regression asserts there is no inline style and captures
  browser console errors. It passed against production's real CSP.
- The demo regression runs at 390×844, performs an axe scan, mutates and resets
  sample data, exits, and proves the real namespace is untouched.
- `tests/claims.spec.ts` enforces one and only one tagged regression per claim.

## Verification evidence

Final repository gates:

```text
npm ci                 PASS — 61 packages installed, 62 audited, 0 vulnerabilities
npm test               PASS — 2 files, 8/8 unit tests
npx tsc --noEmit       PASS — strict TypeScript check
npm run build          PASS — Vite 7.3.6; dist/index.html produced
npx playwright test    PASS — 20/20 Chromium tests
claim regressions      PASS — 10/10 (2 unit, 8 browser)
SW update repeat       PASS — 20/20 two-version update/offline reloads
npm run test:live      PASS — 17/17 production browser tests
npm run verify:live    PASS — 18 deployed files match dist byte-for-byte
```

There is no separate lint configuration; strict TypeScript checking is the
source-level static gate. Package/consumer testing does not apply to this
static PWA.

Browser coverage includes desktop 1440×900 and mobile 390×844, the complete
objective → evidence → prompt → reveal → grade → explained schedule flow,
blank and boundary recovery, reload persistence, CSV and encrypted backups,
manual-date restoration, named deletion confirmations, dark mode, reduced
motion, keyboard-only use, dialog focus, and demo isolation.

Axe WCAG 2 A/AA scans found zero serious or critical findings in empty, dark,
populated mobile, demo mobile, and review-dialog states. The deployment helper
found one `h1`, one `main`, `lang=en`, a descriptive title, complete alt text,
labeled buttons, and no console or page errors on both real and demo URLs.

Offline reload passed from the demo entry point after service-worker control.
The synthetic update test verified controller handoff, the update notice,
precache of hashed JS/CSS, explicit reload, and offline recovery 20 times.

Free and demo workflows request only the product origin. There are no analytics,
remote fonts, third-party scripts, or study-data egress. License verification
remains the only configured external fetch. Checkout returns HTTP 303 to the
hosted Dodo page; no charge was submitted.

## Performance and response policy

Live Lighthouse 12.8.2 mobile:

| Measure | Result | Contract |
| --- | ---: | ---: |
| Performance | 100 | ≥ 90 |
| Accessibility | 100 | ≥ 95 |
| Best practices / SEO | 100 / 100 | informational |
| FCP / LCP | 0.9 s / 1.1 s | LCP < 2.5 s |
| TBT | 20 ms | informational |
| CLS | 0 | < 0.1 |

| Asset | Raw | Gzip | Contract |
| --- | ---: | ---: | ---: |
| Initial JavaScript | 41,118 B | 13,411 B | ≤ 200 KB raw |
| Initial CSS | 20,390 B | 5,246 B | ≤ 50 KB raw |
| Mobile onboarding WebP | 18,514 B | — | ≤ 300 KB |
| Fonts | 0 B | — | ≤ 120 KB |

Production revalidates root/index and `sw.js` with `max-age=0`. Hashed JS, CSS,
and artwork use `public, max-age=31536000, immutable`. Live responses include
the restrictive CSP, HSTS with subdomains, `X-Frame-Options: DENY`, nosniff,
strict referrer policy, and a restrictive permissions policy. Privacy, terms,
offline, manifest, robots, and sitemap routes return 200.

Artifact identity:

```text
index.html  5161b785e07e5f6ebb0570897bacbaa068d1e595019839d5960c82fa9c68f4eb
sw.js       38ad02b225da970e3a585e4163cddc8910a9044bee1d74a1053e876f9aaf9fcb
```

Screenshots, Lighthouse JSON, and URL-verification reports are under
`/work/.evidence/learning-objective-loop-repair-4/` in the worker environment.

## Reproduce

```sh
npm ci
npm test
npx tsc --noEmit
npm run build
npm run test:e2e
npm test -- -t '@claim:'
npx playwright test --grep '@claim:'
npx playwright test tests/service-worker-update.spec.ts --repeat-each=20
npm run test:live
npm run verify:live
```

## Known gaps

No release-blocking or minor verifier findings remain. Verification did not
submit a real $19 charge. It checked the live checkout redirect, the hosted
provider, invalid-token CORS behavior, and a deterministic valid-license return
without creating a financial transaction.
