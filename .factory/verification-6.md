# Independent verification 6 — FAIL

**Candidate:** `5f5a16cceab69b83268707a9b5aeb6ca0206294f`

**Live URL:** <https://learning-objective-loop.sociobot.in/>

**Verified:** 2026-08-30 UTC

**Decision:** **FAIL — do not release while the paid path is unavailable and its claim test can pass without testing the promised result.**

This was a fresh independent verification from the clean requested commit. No
product source was modified. The live static deployment matches the candidate,
and the previously reported first-screen/routing defects are repaired. A fresh
production dependency failure blocks this release.

## Release blockers

### P1 — checkout and license verification are unavailable in production

The product sells **Study archive** as a one-time $19 purchase. From the live
`/data` screen, activating **Buy once · $19** navigated to the configured
Sociobot endpoint and received:

```text
GET https://api.sociobot.in/api/v1/products/learning-objective-loop/checkout
HTTP 503
title/h1: 503 Service Unavailable
```

The license verification endpoint also returned HTTP 503. Three later direct
retries of each endpoint all returned 503. `npm run verify:live` consequently
failed with `Error: checkout returned 503`.

The app handles failed license verification without breaking the free notebook
and shows `License verification is unavailable. Your core notebook still works
offline.` That recovery is good, but customers cannot buy the advertised paid
feature or verify/restore a license while the dependency is unavailable.

The required rate-limit behavior could not be demonstrated. From one client,
requests 1–35 to the verification endpoint all returned **503**; none returned
429 and no response included `Retry-After`. Therefore there is no observable
allowance to report for this candidate. Restore the production API, then prove
the configured allowance with a 429 plus `Retry-After` after the limit.

Evidence:

- `/work/.evidence/learning-objective-loop-verify-6/checkout-live.json`
- `/work/.evidence/learning-objective-loop-verify-6/checkout-503.png`
- `/work/.evidence/learning-objective-loop-verify-6/license-503-recovery.json`

### P1 — the price claim regression checks a link, not the purchase result

The tagged `@claim:one-time-price` test passed while checkout was down because
it only asserts the checkout link's `href` and the presence of the free CSV
button. It does not follow the link or assert the promised Sociobot hosted
checkout response. This violates the claim contract's requirement to test the
observable result rather than the existence of a control, and it allowed a
false-green release gate.

The claim test should assert the checkout handoff reaches the hosted checkout
(without submitting a purchase), using a controlled fixture in the sandbox and
the live endpoint in post-deploy verification.

## Mandatory first-read and demo gate — PASS

Cold at 1440×900 and 390×844, the first screen plainly answered all three
questions:

- What it does: **“Plan reviews around your learning objectives.”**
- Who it is for: self-learners using AI or other materials who need recall
  prompts tied to explainable goals.
- What to click: **Try it with sample data**, with the adjacent explanation
  that it opens three sample objectives and their due prompts.

The action opens `/demo` in one click. The first demo screen already contains
three objectives, three prompts, two due prompts, an upcoming prompt, evidence,
and review history. The persistent banner says the sample is not saved to the
real notebook and exposes **Reset demo** and **Start for real**.

The independent mobile flow reviewed the seasons prompt, blocked an incomplete
grade, accepted `Not yet` plus confidence 1, explained
`An incorrect answer resets the prompt to the 1-day step. Next review: 1 day.`,
and retained that review after a fresh route load.

Evidence:

- `/work/.evidence/learning-objective-loop-verify-6/screenshot-desktop.png`
- `/work/.evidence/learning-objective-loop-verify-6/screenshot-mobile.png`
- `/work/.evidence/learning-objective-loop-verify-6/live-demo-reviewed-mobile.png`
- `/work/.evidence/learning-objective-loop-verify-6/independent-live-flow.json`

## Claim gate — commands 10/10 PASS, one test is inadequate

`.factory/claims.json` exists. Every listed command was run exactly from the
clean candidate and every selected test passed:

| Claim | Result | Evidence |
| --- | --- | --- |
| `objective-review-workflow` | PASS — 1 Playwright test | objective → prompt → reveal → grade → explanation → reload |
| `explained-scheduling` | PASS — 1 Vitest test | disclosed 1/3/7/14/30/60/120 ladder |
| `manual-override` | PASS — 1 Playwright test | set, reload, and clear override |
| `csv-export` | PASS — 1 Playwright test | download content and unchanged saved state |
| `encrypted-backup` | PASS — 1 Vitest test | PBKDF2/AES-GCM round trip without plaintext |
| `offline-reload` | PASS — 1 Playwright test | isolated context, offline reload |
| `private-core` | PASS — 1 Playwright test | same-origin request log |
| `demo-sandbox` | PASS — 1 Playwright test | enter, mutate, reset, and leave demo |
| `one-time-price` | PASS mechanically, **contract FAIL** | only checks link/control presence; see P1 |
| `verified-license` | PASS — 1 Playwright test | recorded valid response, token storage, URL cleanup |

The full suite also verifies that every registered claim has exactly one tag.
The price finding above is about test substance, not tag presence.

## Clean install, tests, and production build

```text
git rev-parse HEAD
5f5a16cceab69b83268707a9b5aeb6ca0206294f

git status --short                 clean before verification documentation
npm ci                             PASS — 61 packages; 0 vulnerabilities
npm test                           PASS — 2 files; 8/8 tests
npx tsc --noEmit                   PASS
npm run build                      PASS — TypeScript + Vite; dist/ produced
npm run test:e2e                   PASS — 24/24 Chromium tests
npm run test:live                  PASS — 21/21 live Chromium tests
npm run verify:live                FAIL — checkout returned HTTP 503
npx playwright test tests/service-worker-update.spec.ts --repeat-each=20
                                   PASS — 20/20
```

There is no lint script or lint configuration. Strict TypeScript is the
available static check. Library/CLI consumer-pack testing is not applicable to
this static PWA.

## Functional, boundary, and recovery coverage

Local and live Playwright checks passed the smallest useful workflow and these
edge cases:

- objective creation, evidence, prompt creation, reveal-before-grade review,
  correctness/confidence scheduling, reload persistence, and readable CSV;
- blank edits and over-limit values at 120/500/400/1,200 characters preserve
  the last saved objective and prompt and focus the invalid field;
- `javascript:` and `data:` evidence URLs are rejected before persistence;
- a manual review date survives reload and **Use calculated date** restores the
  inspectable scheduler;
- incomplete review grading is blocked; incorrect confidence-1 review resets
  visibly to one day; schedule stages cap at the disclosed 120-day interval;
- expiring toasts preserve unsaved form and review input;
- evidence deletion names the record and URL, preserves it when dismissed, and
  removes it only after confirmation;
- review-dialog Escape/close restores the invoking control;
- real-route titles, History API Back, focus, announcements, legal routes, and
  the designed HTTP 404 work.

An independent live encrypted-backup exercise rejected a seven-character
passphrase, downloaded a 3,551-byte envelope declaring PBKDF2-SHA256 with
250,000 iterations and AES-256-GCM (16-byte salt, 12-byte IV), contained no
sample objective or prompt plaintext, rejected a wrong passphrase with the
documented recovery message, named the 3→3 objective replacement in its
confirmation, and restored successfully.

Evidence:
`/work/.evidence/learning-objective-loop-verify-6/independent-backup-flow.json`.

## Accessibility, mobile, keyboard, and browser health

- Playwright axe WCAG 2 A/AA scans found **0 serious and 0 critical** findings
  in light, dark, demo, populated, review-dialog, and 390 px states.
- The supplied `verify-url.sh` passed: HTTP 200 in 943 ms, title, `lang=en`, one
  `<h1>`, `<main>`, image alt text, labeled buttons, and no console/page errors.
- Keyboard tests pass the visible skip link, focus transfer to `<main>`, route
  focus/announcements, theme control, dialog focus, Escape, and trigger focus
  restoration.
- Reduced motion makes transition durations effectively zero. Light and dark
  axe scans pass.
- At 390×844, body text is 17 px, page width is exactly 390 px with no
  horizontal overflow, first-screen facts remain above the dock, and tested
  navigation/objective targets are at least 44 px with 8 px separation.
- Independent live demo and backup flows recorded no console or page errors.

## Privacy, PWA, headers, and caching

- Complete independent demo/review and encrypted export/restore request logs
  contacted only `https://learning-objective-loop.sociobot.in`. No analytics,
  remote fonts, ads, or third-party runtime scripts were observed. The optional
  license action alone contacts the documented Sociobot API.
- Browser-observed root headers include restrictive CSP with
  `frame-ancestors 'none'`, HSTS with subdomains, `X-Frame-Options: DENY`,
  `nosniff`, strict-origin referrer policy, and a restrictive permissions
  policy.
- Root/index and `sw.js` use `public, must-revalidate, max-age=0`; hashed JS,
  CSS, and artwork use `public, max-age=31536000, immutable`.
- Chromium parses the standalone manifest without error; it includes versioned
  start URL, 192/512 icons, and a maskable icon.
- A fresh live context obtained service-worker control and reloaded the demo
  offline with sample data and the offline status intact.
- The synthetic two-version update test passed 20/20: new worker activation,
  update notice, current hashed app-shell precache, and offline reload.

Browser header evidence:
`/work/.evidence/learning-objective-loop-verify-6/browser-response-headers.json`.

There is no sign-in, product-owned backend, health endpoint, or remote study
data store. Entra and backend concurrency/persistence checks are not applicable.
The Sociobot billing endpoints are applicable and failed as documented above.

## Deployment identity and performance

All 19 candidate files other than deployment configuration matched production
byte-for-byte. The live root also matched `dist/index.html`.

```text
index.html SHA-256
b15fc7a3fa6c80f7e5193b6d135ee8017b6991ca2a21871c9e36a9cde42aad8f

sw.js SHA-256
e771f072cf0439c685012bc3ae6061dc1f77091d41de9d6966563ab138755055
```

| Asset/measure | Result | Contract |
| --- | ---: | ---: |
| Initial JavaScript | 46,579 B raw / 14,806 B gzip | ≤ 200 KB |
| Initial CSS | 20,988 B raw / 5,351 B gzip | ≤ 50 KB |
| Mobile hero WebP | 18,514 B | ≤ 300 KB |
| Fonts | 0 B | ≤ 120 KB |

Fresh Lighthouse 12.8.2 mobile against production scored **97 performance /
100 accessibility / 100 best practices / 100 SEO**. FCP was 0.972 s, LCP
1.197 s, TBT 194.5 ms, CLS 0, Speed Index 1.144 s, and total transfer 23,643
bytes. Lab Lighthouse did not report INP.

Evidence:

- `/work/.evidence/learning-objective-loop-verify-6/deployment-identity.json`
- `/work/.evidence/learning-objective-loop-verify-6/lighthouse.json`

## Defects by severity

| Severity | Finding | Release impact |
| --- | --- | --- |
| P1 | Production checkout and license verification return 503; 35 requests never reach 429 and have no `Retry-After`. | Paid purchase/restore is unavailable and required rate limiting cannot be verified. |
| P1 | `@claim:one-time-price` asserts only link/control presence, so it passes while checkout is broken. | Claim gate is false-green and does not meet the acceptance contract. |
| P2 | None observed. | — |
| P3 | None observed. | — |

## Retest criteria

1. Restore both production Sociobot billing routes and confirm checkout returns
   the hosted 303 redirect and invalid verification returns the documented JSON.
2. From one client, exceed the documented allowance and observe 429 plus a
   valid `Retry-After`; record the allowance.
3. Strengthen `@claim:one-time-price` to test the checkout handoff outcome, not
   only the link target.
4. Rerun all ten claim commands, full local/live suites, artifact identity,
   offline/update checks, axe, headers, and Lighthouse.
