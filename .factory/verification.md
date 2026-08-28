# Verification report — FAIL

**Candidate:** `723d8907346b4a6b9c1cc0b57936026289b99fd4`  
**Production checked:** <https://learning-objective-loop.sociobot.in/>  
**Verified:** 2026-08-28 (UTC)  
**Result:** **FAIL — do not release this candidate unchanged.**

This was an independent verification from a clean checkout at the candidate commit. No product source was changed.

## Release-blocking defects

### P1 — evidence deletion is irreversible and unconfirmed

The acceptance contract requires destructive changes to be reversible or to be confirmed with specifics. In a fresh production browser context, I created an objective, attached an evidence link, and activated **Remove evidence Evidence link**. The link changed from present (`1`) to absent (`0`) immediately; no confirmation dialog was shown (`0` dialogs) and the only feedback was the non-reversible toast `Evidence link removed.` There is no undo action.

This can silently destroy the source/work-sample connection that is central to the objective-aware learning record. Require a named confirmation or an undo that restores the exact evidence record before release.

### P1 — production does not provide immutable caching for hashed assets

The performance/PWA acceptance contract requires long-lived immutable caching for hashed static assets. Fresh HTTPS `HEAD` responses from production returned the same policy for the fingerprinted application files:

| Resource | Cache-Control |
| --- | --- |
| `/assets/index-D6R1I6cl.js` | `public, must-revalidate, max-age=30` |
| `/assets/index-DIKZyffR.css` | `public, must-revalidate, max-age=30` |
| `/assets/objective-field-map.webp` | `public, must-revalidate, max-age=30` |

The content-addressed JS and CSS should be served with a long `max-age` and `immutable`; the HTML and service worker can remain short-lived. This is a deployment configuration failure despite the correct candidate artifacts being served.

## Non-blocking findings

### P2 — missing browser security policies

Production sends HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Content-Type-Options: nosniff`, but sends no `Content-Security-Policy`, `frame-ancestors`/`X-Frame-Options`, or `Permissions-Policy`. Add a restrictive CSP (including `connect-src` for the optional Sociobot billing endpoint), frame protection, and a minimal permissions policy at the deployment layer.

### P3 — Lighthouse could not run in this container

`lighthouse@12.8.2` was invoked against the built local preview. It could not attach to the preinstalled Playwright Chromium (`Unable to connect to Chrome`), so no Lighthouse score is asserted here. This is a verifier-container tooling limitation, not evidence of a product defect. The measured bundle sizes below are within the stated static budgets.

## Evidence that passed

### Clean install and repository quality gates

```sh
git rev-parse HEAD                 # 723d8907346b4a6b9c1cc0b57936026289b99fd4
npm ci                             # 60 packages audited; 0 vulnerabilities
npm test                           # 7/7 passed
npm run build                      # passed; tsc --noEmit + Vite; dist/ produced
npm run test:e2e                   # 4/4 passed
```

There is no `lint` script in `package.json`; the available type check runs as part of `npm run build` and passed.

The independent end-to-end run exercised objective creation, evidence entry, prompt creation, reveal-before-grade review, correctness/confidence scheduling, refresh persistence, keyboard skip navigation, dark treatment, and an offline reload after service-worker control. Boundary and recovery checks also covered 120-character objective input, 400-character question input, 1,200-character expected-answer input, whitespace-only objective recovery, invalid URL native validation/recovery, incomplete review native validation/recovery, incorrect low-confidence scheduling, and the visible manual-date override / calculated-date restore controls.

### Accessibility, responsive behavior, and interaction

- Playwright axe WCAG 2 A/AA scans: no serious or critical findings in the desktop empty/dark states (`npm run test:e2e`) or an independent 390×844 mobile scan (`[]`).
- Exactly one `h1`, `main`, `lang=en`, title, skip link, labels, and visible `:focus-visible` styling are present. Keyboard-only smoke coverage passed.
- At 390 px: 17 px body text, fixed bottom navigation, and no horizontal page overflow. Production and local mobile views loaded with no console or page errors.
- CSS implements reduced-motion overrides (`.01ms` animation/transition, single iteration) and no looping animation remains under the preference.

### PWA, privacy, and outbound requests

- Production live test: HTTP 200, one `h1`, one `main`, no console/page errors, no outbound requests in the free empty-state flow.
- After service-worker control, a 390 px production page reloaded offline and displayed `OFFLINE · SAVED HERE` with the Objective Loop heading intact.
- Manifest is present with standalone display, version query start URL, 192/512/maskable icons, theme/background colors, and the live service worker is byte-identical to the candidate. Its cache/update implementation was inspected; the candidate uses a versioned cache, `skipWaiting`, and `clientsClaim`. A naturally occurring production update was not available to observe the in-app update toast end-to-end.
- Source and request inspection found no analytics, third-party scripts, remote fonts, or free-flow data egress. The only configured external fetch is optional license verification at `https://api.sociobot.in/api/v1`; evidence links open only when a learner activates them. Local persistence uses IndexedDB with a localStorage fallback; encrypted-export unit tests passed.

### Candidate/deployment identity and budgets

Byte-for-byte SHA-256 comparison confirmed that production serves the candidate `index.html`, hashed JS/CSS, `sw.js`, manifest, offline page, and `/privacy` and `/terms` documents. Local production build sizes:

| Asset | Raw | Gzip |
| --- | ---: | ---: |
| Initial JS | 34.60 KB | 11.52 KB |
| Initial CSS | 19.07 KB | 4.99 KB |
| Total initial JS + CSS gzip |  | 16.51 KB |
| Mobile onboarding WebP | 18.51 KB | — |
| Desktop onboarding WebP | 62.99 KB | — |

The JavaScript, CSS, font (none shipped), and mobile-image budgets pass.

## Retest criteria

1. Deploy a build where evidence removal has a specific confirmation or undo.
2. Configure immutable, long-lived caching for fingerprinted `/assets/*` while retaining appropriate short caching for `index.html` and `sw.js`.
3. Add CSP, frame protection, and permissions policy, then rerun the response-header check and the full verification suite.
