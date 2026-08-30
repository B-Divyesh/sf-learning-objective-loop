# Independent verification 5 — FAIL

**Candidate:** `f751936990dd57c4da3e40c08c375318f653cf49`

**Live URL:** <https://learning-objective-loop.sociobot.in/>

**Verified:** 2026-08-30 UTC

**Decision:** **FAIL — do not release this candidate unchanged.**

This was a fresh independent verification from the clean requested commit. The
live deployment is byte-for-byte identical to the candidate. The previously
reported checkout/deployment failure is not present. No product source was
modified.

## Release blocker

### P1 — the cold first screen does not plainly say who the product is for

The required one-click demo exists and works, but the first-read contract says
the candidate fails unless the first screen plainly answers what the product
does, who it is for, and what to click first.

Cold read at both 1440×900 and 390×844:

- What it appears to do: attach short-answer prompts to outcomes and schedule
  another review after each answer.
- Who it is for: **not stated in the first viewport**. The only audience copy,
  `Made for deliberate learners`, is in the footer below the first screen and
  is less specific than the researched self-learner situation.
- What to click first: **Try it with sample data** is clear and opens a useful
  sample in one click.

The semantic headline also fails the required shape. The sole `<h1>` is the
product name, `Objective Loop`; the visible job statement, `Turn an intention
into a review you can explain.`, is an `<h2>`. `intention` and `loop` require
interpretation instead of naming the concrete objective-aware review job.

At 390×844 the CTA and all three facts fit above the dock, but no audience
statement is present. Evidence:
`/work/.evidence/learning-objective-loop-verify-5/objective-loop-mobile-cold.png`
and `objective-loop-cold-desktop.png` in the same directory.

This finding independently triggers the explicit acceptance-contract FAIL.

## Other defects

### P2 — route changes are not announced and discard keyboard focus

The app uses hash-only routes for its real screens (`#/today`, `#/data`,
`#/objective/...`) instead of real History API routes. After activating **Data
& access**, focus becomes `<body>`, the page title remains `Objective Loop —
explainable learning reviews`, and no route-change live region announces the
new screen. Browser Back restores the content but again leaves focus on
`<body>`. The sole `<h1>` remains the wordmark on every route; screen titles
such as `Your learning record belongs to you`, `Privacy`, and `Terms` are
`<h2>` elements.

This violates the site-structure and screen-reader routing contract. Move
focus to the new page `<h1>`, update `document.title`, announce the route, and
use real paths for real screens.

### P2 — required error route and page metadata are absent

- `GET /definitely-missing-verifier-route` returns HTTP 200 and the normal
  landing screen. There is no `public/404.html`, so the required designed 404
  response does not exist.
- The root document has no canonical link, Open Graph title/image, or Twitter
  card metadata.
- The shared footer omits `Built by Param Factory` and a version/build id.
- `/privacy/` and `/terms/` keep the root title rather than their required
  route-specific titles.
- The separately shipped `/privacy/index.html` and `/terms/index.html` files
  each emit a CSP console error because their inline stylesheet is blocked by
  production `style-src 'self'`. The routed `/privacy/` and `/terms/` screens
  do not emit that error because the deployment serves the SPA shell there.

### P2 — evidence links accept unsafe/non-web URL schemes

The **Web address** field relies only on HTML `type="url"`. A plain invalid
value such as `not a url` is correctly rejected with `Please enter a URL.`, but
both `javascript:alert(document.domain)` and
`data:text/html,<h1>test</h1>` pass validation, are persisted, and render as
clickable evidence links with those exact `href` values. Restrict stored links
to `https:` and, if intentionally supported, `http:`.

## Claim gate — 10/10 PASS

`.factory/claims.json` exists. Every listed command was run exactly as written
from the clean candidate; every selected claim test passed. Browser claim
tests used fresh Playwright contexts and the shipped demo/sample where the
claim specifies it.

| Claim | Result | Evidence |
| --- | --- | --- |
| `objective-review-workflow` | PASS, 1 test | `objective-loop-claim-1-objective-review-workflow.log` |
| `explained-scheduling` | PASS, 1 test | `objective-loop-claim-2-explained-scheduling.log` |
| `manual-override` | PASS, 1 test | `objective-loop-claim-3-manual-override.log` |
| `csv-export` | PASS, 1 test | `objective-loop-claim-4-csv-export.log` |
| `encrypted-backup` | PASS, 1 test | `objective-loop-claim-5-encrypted-backup.log` |
| `offline-reload` | PASS, 1 test | `objective-loop-claim-6-offline-reload.log` |
| `private-core` | PASS, 1 test | `objective-loop-claim-7-private-core.log` |
| `demo-sandbox` | PASS, 1 test | `objective-loop-claim-8-demo-sandbox.log` |
| `one-time-price` | PASS, 1 test | `objective-loop-claim-9-one-time-price.log` |
| `verified-license` | PASS, 1 test | `objective-loop-claim-10-verified-license.log` |

The logs are under
`/work/.evidence/learning-objective-loop-verify-5/`. The full test suite also
checks that each registered claim has exactly one tagged regression.

## Clean install, tests, and production build

```text
git rev-parse HEAD
f751936990dd57c4da3e40c08c375318f653cf49

npm ci
PASS — 61 packages installed; 62 audited; 0 vulnerabilities

npm test
PASS — 2 files; 8/8 unit tests

npx tsc --noEmit
PASS

npm run build
PASS — TypeScript plus Vite 7.3.6; dist/index.html produced

npm run test:e2e
PASS — 20/20 Chromium tests

npm run test:live
PASS — 17/17 tests against production

npm run verify:live
PASS — 18 deployed files matched dist byte-for-byte
```

There is no lint script or lint configuration. Strict TypeScript is the
available static source gate. Package/consumer installation is not applicable
to this static PWA.

## Functional, boundary, and recovery evidence

The smallest useful flow passed on production: open the one-click sample,
choose a due prompt, reveal its expected answer, mark it correct at confidence
5, and save. The visible explanation was: `A correct answer with high
confidence advances one interval. Next review: 3 days.` The demo banner stayed
visible, and only the product origin was requested.

Repository and live browser coverage also passed:

- create an objective, evidence link, prompt, and review; reload persistence;
- incorrect answers reset to one day; confidence 3 repeats a stage;
  confidence 5 advances; stage 7 remains capped at 120 days;
- blank and over-limit edits at 120/500/400/1,200 characters preserve the last
  saved content and focus the invalid field;
- a manual date survives reload and **Use calculated date** restores the
  scheduler;
- named destructive confirmations preserve data when dismissed;
- CSV retains objective, prompt, answer, due date, override, and review count;
- review-dialog Escape/close behavior restores the invoking control;
- demo reset removes demo changes and **Start for real** proves the real
  notebook remains empty.

An independent encrypted-backup flow downloaded a 3,551-byte `.loop` file
declaring PBKDF2-SHA256 with 250,000 iterations, a 16-byte salt, and a 12-byte
IV. Neither the sample objective nor prompt appeared in plaintext. A seven-
character passphrase was rejected, a wrong passphrase produced `Could not
decrypt this file. Check the file and passphrase.`, and the correct passphrase
restored the sample.

## Accessibility, keyboard, mobile, and browser health

- Axe WCAG 2 A/AA: **0 serious, 0 critical** in independently scanned light
  landing, 390×844 demo, and dark/reduced-motion states. The suite also scans
  the review dialog and populated mobile state.
- `/opt/fleet/lib/verify-url.sh`: PASS — HTTP 200, 825 ms load, title,
  `lang=en`, one `<h1>`, one `<main>`, no missing image alt text, no unlabeled
  buttons, and no root-load console/page errors.
- Keyboard smoke: first Tab exposes and focuses **Skip to main content** with a
  3 px visible outline; Enter moves focus to `<main>`. Dialog initial focus,
  Escape, close, and trigger restoration pass.
- Reduced motion uses 0.01 ms transition/animation durations and automatic
  scrolling. Light and dark axe scans pass.
- At 390×844, there is no horizontal overflow; body text is 17 px, primary and
  navigation targets meet 44 px, and dock items have at least 8 px separation.
- Root/demo flows emitted no console or page errors. The two direct legal-file
  CSP errors are recorded under the metadata defect above.

The `<h1>` count check is mechanically green, but its content is wrong under
the plain-words/page-heading contract; that is the P1 finding above.

## PWA, privacy, headers, and rate limiting

- Chromium parsed the manifest without errors: standalone display, versioned
  start URL, 192/512 icons, and a 512 maskable icon.
- Live demo obtained service-worker control from `/sw.js`, used cache
  `objective-loop-shell-42dfd829fef5`, then reloaded offline with the banner,
  sample prompt, and `Offline · saved here` intact.
- The synthetic two-version update test passed **20/20**: controller handoff,
  update notice, explicit reload, hashed-asset precache, and offline recovery.
- Independent request logging across demo review and encrypted export/restore
  observed only `https://learning-objective-loop.sociobot.in`. There are no
  analytics, remote fonts, or third-party runtime scripts in those flows.
- Root responses send restrictive CSP, HSTS with subdomains, `DENY` framing,
  nosniff, strict-origin referrer policy, and restrictive permissions policy.
- Root/index and `sw.js` revalidate; hashed JS, CSS, and artwork are immutable
  for one year.
- Billing checkout returns HTTP 303 to `checkout.dodopayments.com`. An invalid
  verification token returns HTTP 200, `valid:false`, `reason:"invalid"`,
  product-origin CORS, and `no-store`.
- Rate-limit probe from one client: requests 1–30 returned 200; request **31**
  returned **429** with `Retry-After: 4` and `Too Many Requests! Wait for 4s`.
  The observed allowance is therefore 30 requests per window. No purchase was
  submitted.

There is no sign-in, product backend, health endpoint, or persistence service;
the corresponding backend/auth checks are not applicable.

## Deployment identity, caching, and budgets

```text
dist/index.html and live /
5161b785e07e5f6ebb0570897bacbaa068d1e595019839d5960c82fa9c68f4eb

dist/sw.js and live /sw.js
38ad02b225da970e3a585e4163cddc8910a9044bee1d74a1053e876f9aaf9fcb
```

| Asset/measure | Result | Contract |
| --- | ---: | ---: |
| Initial JavaScript | 41,118 B raw / 13,411 B gzip | ≤ 200 KB raw |
| Initial CSS | 20,390 B raw / 5,246 B gzip | ≤ 50 KB raw |
| Mobile onboarding WebP | 18,514 B | ≤ 300 KB |
| Fonts | 0 B | ≤ 120 KB |

Fresh Lighthouse 12.8.2 mobile scored **99 performance / 100 accessibility /
100 best practices / 100 SEO**. FCP was 1.1 s, LCP 1.2 s, TBT 100 ms, CLS 0,
Speed Index 1.2 s, and total transfer 49 KiB. Lab Lighthouse did not report INP.
Raw report: `/work/.evidence/learning-objective-loop-verify-5/objective-loop-lighthouse.json`.

## Retest criteria

1. Put a concrete job headline in the single `<h1>` and name self-learners on
   the initial 1440×900 and 390×844 screens while retaining the one-click demo.
2. Implement real page routes with route-specific titles/headings, focus and
   announcements; add a true 404 response.
3. Add canonical/social metadata and the required footer provenance/build id.
4. Remove the direct legal-page CSP errors.
5. Reject non-HTTP(S) evidence URLs before saving them.
6. Rerun every claim command, full local/live suites, repeated SW update test,
   deployment identity check, axe scans, first-read screenshots, and Lighthouse.
