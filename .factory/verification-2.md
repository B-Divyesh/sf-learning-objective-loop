# Independent verification — FAIL

**Candidate:** `2797015d36ecae4513e607be623d6f6a962e654f`  
**Live URL:** <https://learning-objective-loop.sociobot.in/>  
**Verified:** 2026-08-28 UTC  
**Decision:** **FAIL — do not release this candidate unchanged.**

I tested from a clean checkout at the stated candidate. No product source was
modified. The production deployment was independently checked rather than
trusting the preceding repair handoff.

## Release blocker

### P1 — offline reload fails after a service-worker update

The PWA contract requires a versioned app-shell precache, `skipWaiting`,
`clientsClaim`, an update notice, and an offline reload. This candidate only
precache-lists `/`, `index.html`, `offline.html`, the manifest, icons, and the
onboarding images. It omits the built JavaScript and CSS.

`public/sw.js` deletes every cache other than the new cache during activation.
Consequently, an update removes the cache that contains the prior app bundle,
but the new cache does not contain the new bundle. A navigation can return
cached `index.html`, then its JS/CSS requests miss Cache Storage and fail while
offline.

I reproduced this with an isolated same-origin static server serving the exact
candidate build with `Cache-Control: no-store`: register cache
`objective-loop-shell-v2`, reload to obtain a controller, serve the same worker
with only its cache name advanced to `objective-loop-shell-v3`, call
`registration.update()`, observe the in-app **“An update is ready. Reload to
use it.”** toast and the v3 cache, go offline, then reload. `page.reload()` did
not reach `load` within 8 seconds; the app shell was unavailable. This is the
failure mode a learner encounters when a new deployment changes the hashed
entry files and they accept/receive its worker update before an online reload.

The normal offline-reload test passes only before this cache transition because
the current worker runtime-caches assets it has already fetched. It does not
cover the required update boundary.

**Required repair:** generate a precache manifest for every current app-shell
file, including the hashed JS and CSS (for example, Workbox `precacheAndRoute`
or a Vite-generated manifest), version it with the release, and retain the
current update notification. Add a two-version test that disables HTTP caching,
updates the worker and hashed entry assets, and proves an offline reload renders
the app shell.

## Evidence that passed

### Clean candidate and repository gates

```sh
git rev-parse HEAD       # 2797015d36ecae4513e607be623d6f6a962e654f
git status --short       # clean before verification documentation
npm ci                   # 60 packages audited; 0 vulnerabilities
npm test                 # 7/7 passed
npm run build            # tsc --noEmit + Vite passed; dist/ produced
npm run test:e2e         # 6/6 passed
```

There is no lint script. The available type check is part of `npm run build`.

The exact production build emitted 34,774 B JS (11.60 KB gzip), 19,066 B CSS
(4.99 KB gzip), and an 18,514 B mobile onboarding WebP. These pass the 200 KB
initial-JS, 50 KB CSS, and 300 KB mobile-image budgets. A local mobile
Lighthouse 12.8.2 run against the built preview scored **100 performance / 100
accessibility**, with LCP 1.5 s and CLS 0. (There was no field interaction for
an INP measurement.)

### Product workflow, error recovery, and storage

Independent Playwright exercise at 390×844 passed:

- creates an objective, attaches evidence, creates a manual short-answer
  prompt, reveals the expected answer before grading, records an incorrect /
  confidence-1 answer, and shows the inspectable 1-day explanation;
- rejects whitespace-only objectives with a visible recovery error; native URL
  validation holds an invalid evidence URL in place until corrected;
- enforces the specified 120 / 500 / 400 / 1,200 character form limits;
- blocks incomplete review grading until correctness and confidence are chosen;
- sets a manual next date, visibly restores the calculated date, and retains
  data after reload;
- after normal service-worker control, reloads offline showing
  **Offline · saved here**.

The live desktop smoke repeated the real objective → evidence → prompt →
reveal → correct/confidence-5 review flow. It confirmed evidence removal opens
a native confirmation naming both the evidence label and saved URL; dismissal
preserves the record and acceptance removes it.

### Accessibility, responsive behavior, and browser health

- Desktop post-workflow and live 390×844 axe WCAG 2 A/AA scans reported **0
  serious and 0 critical** violations.
- Live has one `h1`, one `main`, `lang=en`, a title, meaningful image alt text,
  labels, and a keyboard skip link. At 390 px, body text is 17 px,
  `scrollWidth === clientWidth === 390`, and the designed solid focus outline
  is visible.
- With reduced motion, calculated transition duration was 0.01 ms; no browser
  console or page errors occurred in the tested desktop or mobile flows.

### Privacy, policies, PWA normal path, and deployment identity

- Fresh free-flow browser requests went only to
  `https://learning-objective-loop.sociobot.in`; source and request inspection
  found no analytics, remote fonts, third-party scripts, or study-data egress.
  The optional Sociobot license API is the sole configured external fetch.
  Study data is local IndexedDB with a localStorage fallback; encrypted export
  tests passed.
- Live responses for HTML and `sw.js` are `public, must-revalidate, max-age=0`;
  hashed JS, CSS, and WebP are `public, max-age=31536000, immutable`.
  CSP, HSTS, `X-Frame-Options: DENY`, `nosniff`, referrer policy, and a
  restrictive permissions policy are present. `/privacy`, `/terms`, and the
  manifest return 200.
- SHA-256 matched local `dist/` and production for `index.html`, `sw.js`,
  manifest, offline page, privacy and terms pages, JS, CSS, and both responsive
  onboarding WebPs. The deployment therefore is this candidate, including the
  service-worker defect.

## Defects by severity

| Severity | Finding | Release impact |
| --- | --- | --- |
| P1 | Post-update offline app shell is not precached and cannot reload. | Block release until repaired and regression-tested. |
| P2 | None observed. | — |
| P3 | None observed. | — |
