# Independent verification 3 — FAIL

**Candidate:** `39e69415fc08cb1c67dca157180775f282c2c786`  
**Live URL:** <https://learning-objective-loop.sociobot.in/>  
**Verified:** 2026-08-28 UTC  
**Decision:** **FAIL — do not release this candidate unchanged.**

I tested from a clean checkout at the requested commit. No product source was
modified. The production deployment was checked independently and matches the
candidate, but three release-blocking behaviors remain.

## Release blockers

### P1 — success toasts erase unsaved form and review input

`showToast()` starts a new 3.5-second timer for every successful action. Each
timer later clears the toast and calls `render()`, which replaces the entire
application DOM. Earlier timers are not cancelled, and forms are rendered from
saved state rather than their in-progress controls.

This makes the first-use objective-to-prompt path lose work under ordinary
typing speed. I reproduced it locally and on the live deployment:

1. Create `Explain plate tectonics`.
2. On its detail view, enter `What drives plate movement?` and `Mantle
   convection and gravity.` in the new-prompt form.
3. Wait until the preceding “Objective added” toast reaches 3.5 seconds.
4. The question and answer are both reset to empty without warning.

The live probe recorded the question value changing from `What drives plate
movement?` to `""` after 3.7 seconds. A slower end-to-end review also repeatedly
lost its selected correctness and confidence when an earlier evidence/prompt
toast expired. This directly breaks the smallest useful workflow and discards
user input.

**Required repair:** keep transient UI state out of full `innerHTML` renders,
or cancel/replace the prior toast timer and update only the toast region. Add a
regression that types into the next form, waits past toast expiry, and proves
all values and review selections remain intact.

### P1 — post-update offline reload is intermittent

The repository's required service-worker update test failed in the exact full
quality gate. It passed 7/8 browser tests; the final update/offline test loaded
only the static skip link after the offline reload because the JS and CSS were
not served.

An isolated five-repeat run produced **3 failures and 2 passes**. In each
failure, the test had already proved that the new cache existed and contained
the hashed JavaScript entry. The trace then showed:

- navigation `index.html` returned;
- `/assets/index-BsfIeA0O.js` failed with `net::ERR_INTERNET_DISCONNECTED` /
  `net::ERR_FAILED`;
- `/assets/index-DIKZyffR.css` failed the same way;
- the resulting page contained only “Skip to main content.”

The update notice is emitted when the new worker becomes `installed`, before a
safe controller handoff is guaranteed. An immediate offline/reload transition
therefore has a race despite both shell caches being retained. This violates
the PWA update and offline-reload contract.

**Required repair:** make the update flow wait for and verify
`controllerchange` before suggesting/reloading, provide an explicit update
action, and keep the old controller/cache usable until handoff completes. Make
the two-version test synchronization reflect that user-visible guarantee and
run it repeatedly.

### P1 — the advertised one-time purchase cannot be started

The live UI's `Buy once · $19` link correctly targets:

```text
https://api.sociobot.in/api/v1/products/learning-objective-loop/checkout
```

On 2026-08-28 that endpoint returned HTTP **404** with:

```json
{"error":"enabled factory product","status":404}
```

The verify endpoint itself is reachable, returns CORS for the product origin,
and correctly rejected a synthetic invalid token with HTTP 200 and
`{"valid":false,"reason":"invalid","expires_at":null}`. The UI recovered with
“This license is no longer active…”. Purchase initiation, however, is entirely
unavailable. This appears deployment/billing-registration related rather than
a static-code mismatch, but it is part of the shipped paid-unlock contract.

**Required repair:** enable/register the live factory product in the Sociobot
billing engine and confirm that the checkout link redirects to the hosted
checkout and returns to the product with a usable license.

## Other defect

### P2 — mobile touch-target spacing and size miss the acceptance baseline

At 390×844, the header home link measured **217.2×38 CSS px**, below the required
44 px height. A populated objective link measured **297×40 CSS px**. The three
bottom navigation targets are 62 px high but have only **2 px** between them,
below the required 8 px adjacent-target spacing. Keyboard focus is visible and
axe does not flag these geometry issues, but the supplied accessibility and
design contracts explicitly require the larger targets and spacing.

## Quality-gate evidence

### Clean checkout, install, tests, and build

```text
git rev-parse HEAD
39e69415fc08cb1c67dca157180775f282c2c786

git status --short --branch
## main...origin/main

npm ci
62 packages installed/audited; 0 vulnerabilities

npm test
2 files passed; 7/7 tests passed

npm run build
tsc --noEmit passed; Vite 7.3.6 passed; dist/ produced

npm run test:e2e
7 passed, 1 failed: post-update offline reload

npx playwright test tests/service-worker-update.spec.ts --repeat-each=5
2 passed, 3 failed
```

There is no lint script in `package.json`. Type checking is part of the exact
production build. A final `npm run build` after diagnostics passed and restored
the generated worker exactly.

### Functional, boundary, and recovery coverage

Apart from the defects above, independent browser exercises passed on the local
production artifact and/or the byte-identical live deployment:

- whitespace-only objective rejected with the visible “Write an objective
  before saving” recovery message;
- objective/evidence/prompt limits present at 120/500/100/400/1,200/200
  characters;
- invalid evidence URL blocked by native validation, then accepted after
  correction;
- HTML-like objective text remained escaped and did not create executable DOM;
- objective → evidence → short-answer prompt → reveal → correctness/confidence
  → explained 1-day and 3-day scheduling flows worked when toast expiry was
  allowed to settle first;
- incomplete review grading remained in the dialog until both required choices
  were supplied;
- manual date override persisted through reload and “Use calculated date”
  restored the computed schedule;
- IndexedDB state survived reload and an offline reload;
- encrypted export used `PBKDF2-SHA256`, 250,000 iterations, and AES-256-GCM;
  its payload did not contain plaintext study content;
- CSV export contained the prompt and review count;
- wrong-passphrase import produced a clear error, then the correct passphrase
  restored data after named confirmation;
- invalid license verification contacted only the declared Sociobot endpoint,
  stored the token locally, and showed a quiet recovery notice.

### Accessibility, keyboard, responsive behavior, and browser health

- Playwright axe WCAG 2 A/AA scans on the populated 390 px local flow, live
  desktop post-review flow, and live 390 px dark treatment found **0 serious and
  0 critical** violations.
- Live has `lang="en"`, the expected title, one `h1`, one `main`, labeled forms,
  meaningful onboarding alt text, and a first-focus skip link.
- A keyboard-only live objective creation reached every control with Tab and
  submitted with Enter. Focus outlines measured 3 px throughout.
- At 390 px, body text is 17 px and document width equals viewport width (no
  horizontal overflow). Desktop 1440×900 and 390×844 were visually inspected.
- Under `prefers-reduced-motion: reduce`, tested animation and transition
  duration were each `0.01ms`.
- No console errors or uncaught page errors occurred in the passing local/live
  desktop and mobile workflows.

### Privacy, requests, manifest, and response policy

- A fresh free workflow made requests only to
  `https://learning-objective-loop.sociobot.in`; no analytics, tracking,
  external fonts/scripts, or study-data egress was observed.
- Study records use IndexedDB with a localStorage fallback. Exports are produced
  in-browser. The only configured external runtime request is the explicit
  Sociobot license verification call.
- Chromium `Page.getAppManifest` parsed the live manifest with **0 errors**. It
  has standalone display, versioned start URL, 192/512 icons, and a maskable
  icon.
- Ordinary controlled offline reload passed locally and live. The update
  boundary is the intermittent failure described above.
- Root/index and `sw.js` return `public, must-revalidate, max-age=0`; hashed JS,
  CSS, and WebP return `public, max-age=31536000, immutable`.
- Live responses include CSP (`default-src 'self'`, restricted connect source,
  `frame-ancestors 'none'`), HSTS, `X-Frame-Options: DENY`, `nosniff`, strict
  referrer policy, and a restrictive permissions policy. `/privacy`, `/terms`,
  `/offline.html`, and the manifest return 200.

### Bundle and Lighthouse budgets

| Measure | Result | Contract |
| --- | ---: | ---: |
| Initial JavaScript | 34.77 KB raw / 11.60 KB gzip | ≤ 200 KB |
| Initial CSS | 19.07 KB raw / 4.99 KB gzip | ≤ 50 KB |
| Mobile onboarding WebP | 18.51 KB | ≤ 300 KB |
| Lighthouse performance | 90 | ≥ 90 |
| Lighthouse accessibility | 100 | ≥ 95 |
| Lighthouse best practices / SEO | 100 / 92 | informational |
| FCP / LCP | 1.0 s / 1.4 s | LCP < 2.5 s |
| CLS | 0 | < 0.1 |
| TBT | 420 ms | informational |
| Total transfer | 29 KiB | informational |

Lighthouse 12.8.2 used its mobile profile against the local production preview.
INP has no lab value without field interaction data; TBT is reported rather
than mislabelled as INP.

## Deployment identity

The live deployment is the candidate build, not a stale predecessor. SHA-256
matched between local `dist/` and production for every user-facing generated
file: `index.html`, `sw.js`, JS, CSS, source map, manifest, offline page, privacy
and terms pages, all icons, and both onboarding images. Key hashes:

```text
index.html                 f2a82959297002dbab17f6c133a43bf05894d0a083a9afdc613e0cb8c6771ac9
sw.js                      8ebe7c4d40b08c997ec48bad8a611381274c73915a3aeb655acdd3e5e20b691f
assets/index-BsfIeA0O.js   62d402bf1ec216d32f838577e6cae60ebe6c47a61ea5356f912d0d2c971643df
assets/index-DIKZyffR.css  c5b571c2139661c285fad7c9aa637ecc5662d2f51a97068dd876c086cb5426bc
```

`staticwebapp.config.json` correctly returns 404 from the public site because
it is deployment configuration, not a public asset; its effects were confirmed
through the live headers above.

## Defects by severity

| Severity | Finding | Release impact |
| --- | --- | --- |
| P1 | Toast expiry performs a full render and silently erases unsaved prompt/form/review input. | Core first-use workflow is unreliable and loses work. |
| P1 | Post-update offline reload failed 3/5 isolated repeats and the exact full E2E gate. | Required PWA update/offline guarantee is not reliable. |
| P1 | Live `$19` checkout endpoint returns HTTP 404. | Advertised one-time purchase cannot be completed. |
| P2 | Observed mobile targets are 38/40 px high and bottom-nav spacing is 2 px. | Misses the explicit 44 px target / 8 px spacing baseline. |

No P0 defects were observed.
