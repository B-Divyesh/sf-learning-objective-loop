# Objective Loop — independent verification 10

## Verdict: PASS

- **Candidate commit:** `d1ff30163565f132553765738da3151025f424ea`
- **Live URL:** <https://learning-objective-loop.sociobot.in>
- **Verified:** 2026-08-30 UTC
- **Decision:** **PASS — the candidate meets the researched brief and release contract.**
- **Scope:** clean-checkout and deployed-PWA verification. Product source was
  not modified.

## Cold first read

A fresh 1440×900 browser context opened the live root with no stored state.
The first screen says **“Plan reviews around your learning objectives,”** says
it is **for self-learners using AI or other materials**, and makes **“Try it
with sample data”** the prominent first action. The adjacent text says it opens
three sample objectives and their due prompts. The action is above the fold on
desktop and 390×844 mobile and opens `/demo` in one click.

The demo immediately shows three objectives, two due prompts, one upcoming
prompt, evidence, and prior review history. Its persistent banner says **“Demo
— sample data, nothing is saved to your notebook”** and exposes **Reset demo**
and **Open my notebook**. The plain-words and one-click sandbox gates pass.

## Claims gate

`.factory/claims.json` exists and contains 17 unique claims. Before broader
repository inspection, every listed command was invoked. As expected for an
unbootstrapped clone, those first invocations reported missing `tsc`/`vitest`.
After the required `npm ci`, every exact command was rerun and **17/17 passed**:

`objective-review-workflow`, `explained-scheduling`, `manual-override`,
`csv-export`, `encrypted-backup`, `offline-reload`, `private-core`,
`demo-sandbox`, `one-time-price`, `verified-license`, `manual-input-only`,
`nested-objectives-evidence`, `study-storage`,
`no-tracking-or-third-party-runtime`, `sociobot-network-boundary`,
`encrypted-restore`, and `passphrase-local-only`.

The registry regression also confirms one and only one tagged test per claim.
Landing-page and README capability, privacy, offline, storage, scheduling,
export, and price statements map to registered claims. No material unlisted
claim was found.

## Clean local gates and deployment identity

```text
git status --short                PASS — clean before verification
git rev-parse HEAD                d1ff30163565f132553765738da3151025f424ea
npm ci                            PASS — 61 packages; 0 vulnerabilities
claims.json commands              PASS — 17/17 after install
npm test                          PASS — 8/8
npm run build                     PASS — TypeScript; dist/ produced
npm run test:e2e                  PASS — 33/33 in Chromium
npm run verify:live               PASS — 19 deployed artifacts matched dist/
npm run test:live                 PASS — 30/30 against the public URL
```

There is no lint script or separate lint configuration; `tsc --noEmit` is part
of the production build. The live and local `index.html` SHA-256 is
`60c262fcdbd61f27caed4982fde1779a1fad79690563feb8df0e3ac1d6441028`.
The deployed site therefore matches the candidate byte-for-byte.

## End-to-end behavior and recovery

A separate fresh 390×844 live context completed the smallest useful workflow:

- blank objective and prompt submissions stayed on the form, focused the
  invalid required field, and exposed the browser validation message;
- a `javascript:` evidence URL was rejected with “Use an HTTP(S) web address,”
  then a valid HTTPS link saved successfully;
- an objective, evidence statement, evidence link, prompt, expected answer,
  and review note saved and survived reload;
- an incorrect confidence-1 answer displayed “resets the prompt to the 1-day
  step” and “Next review: 1 day”;
- a manual 2026-09-15 review date remained visibly marked after reload;
- CSV contained the saved objective and answer;
- the 1,715-byte encrypted backup contained no plaintext objective text; and
- the same data route reloaded offline with the offline status visible.

The full suite additionally passed exact boundary and recovery cases: 120/500
character objective limits, 400/1,200 character prompt limits, wrong backup
passphrase, cancelled and confirmed restore, manual-date removal, named delete
confirmation, ten immediate-navigation durability cycles, and real/demo
namespace separation.

## Accessibility, keyboard, and responsive behavior

- A fresh axe scan found **0 serious and 0 critical** findings on `/`,
  `/today`, `/demo`, `/objectives`, `/new-objective`, `/data`, `/privacy`,
  `/terms`, and `/404.html` at 1440×900 and 390×844.
- Demo review-dialog and dark-theme scans also found 0 serious/critical issues.
- Every checked route has `lang=en`, one H1, one main landmark, an appropriate
  route title, labels, and image alternatives.
- All rendered links, buttons, fields, selects, summaries, and dialog controls
  measured at least 44×44 CSS px on both viewports. No route had horizontal
  overflow.
- Keyboard Tab/Enter/Space navigation, the first-target skip link, a visible
  3 px focus ring, route focus/announcement, dialog focus containment and
  restoration, and Escape closing passed.
- With `prefers-reduced-motion: reduce`, transition and animation durations
  reduce to 0.01 ms and smooth scrolling is disabled.

This independently confirms the repair for verification 9's undersized mobile
link finding.

## Privacy, headers, routes, and billing boundary

Cold load, the full study workflow, demo interaction, CSV export, encrypted
backup, and offline reload contacted only
`https://learning-objective-loop.sociobot.in`. There were no analytics, ads,
remote fonts, third-party scripts, console errors, page errors, or failed
requests. The tested passphrase did not appear in the backup payload, storage,
or requests.

Root responses include CSP with `frame-ancestors 'none'`, HSTS with
`includeSubDomains`, `X-Frame-Options: DENY`, `X-Content-Type-Options:
nosniff`, a strict-origin referrer policy, and a restrictive permissions
policy. HTML and `sw.js` use `max-age=0` revalidation; a conditional root
request returned 304. Hashed assets use one-year immutable caching. All 13
same-origin links discovered across public routes returned 200. An unknown
route returned the designed page with HTTP 404.

This product has no product-owned server endpoint. Billing behavior was tested
with intercepted Sociobot responses: correct product URLs, returned-token URL
cleanup, daily verdict caching, valid/invalid handling, free-core behavior,
and offline failure recovery all passed. The external billing API was not
contacted in this run because the work order explicitly forbids connecting to
resources outside `sf-learning-objective-loop`. The immediately preceding
independent record (`verification-9.md`) observed an allowance of 30 accepted
verification requests, request 31 returning 429, and `Retry-After: 4`; the
candidate changes only touch-target CSS, its regression, and documentation.

There is no sign-in, product backend, shared database, library, or CLI, so
Entra, backend concurrency/health, and consumer-package checks do not apply.

## PWA and performance

- Chromium parsed the standalone manifest with no errors; it has a versioned
  start URL, 192/512 icons, and a maskable icon.
- The live app gained service-worker control and reloaded the populated route
  offline. The local two-version worker test updated the cache, announced the
  update, retained the hashed shell, activated, and reloaded offline.
- Production payload: 49,284 B JavaScript (15,514 B gzip), 22,700 B CSS
  (5,655 B gzip), 18,514 B mobile hero WebP, and 0 B fonts.
- Fresh local mobile Lighthouse: **97 performance, 100 accessibility, 100 best
  practices, 100 SEO**; FCP 1.06 s, LCP 1.66 s, TBT 188 ms, CLS 0.
- Three fresh live mobile runs scored **89 / 100 / 98 performance** (median
  98), with 100/100/100 for the other categories on every run. Median LCP was
  1.12 s and CLS was 0. One run had a transient 455.5 ms TBT; the other two
  measured 5 ms and 175.5 ms. A live review interaction sample measured a
  worst interaction total of 144 ms.

The exact local build and median live run meet the performance contract. The
single low live run is recorded as variance, not hidden or treated as a stable
product defect.

## Defects by severity

| Severity | Findings |
| --- | --- |
| P0 | None. |
| P1 | None. |
| P2 | None. |
| P3 | None. |

## Final decision

**PASS.** The live deployment matches candidate
`d1ff30163565f132553765738da3151025f424ea`; the claims, end-to-end learning
loop, sandbox, local storage and encrypted ownership path, offline/update
behavior, accessibility, responsive design, privacy boundary, headers, and
performance gates are verified.
