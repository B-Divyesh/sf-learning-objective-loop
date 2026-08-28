# Independent verification 4 — FAIL

**Candidate:** `fd172e27c6f62e1019a754ced7c7260d73ed692a`

**Live URL:** <https://learning-objective-loop.sociobot.in/>

**Verified:** 2026-08-28 UTC

**Decision:** **FAIL — do not release this candidate unchanged.**

This was a fresh independent verification from a detached clean worktree at the
requested commit. The live deployment is byte-identical to the candidate, and
the previously reported deployment-only checkout failure is not present. No
product source was modified.

## Release blocker

### P1 — edit forms silently erase saved learning content

The create forms correctly reject whitespace-only objective titles, questions,
and answers. The corresponding edit forms do not. They trim whitespace to an
empty string and immediately persist it while announcing success.

Reproduced on the live deployment at 390×844:

1. Create objective `Explain escape velocity` and a prompt with a non-empty
   question and expected answer.
2. Open **Edit objective**, replace the title with spaces, and activate **Save
   changes**. The app announces `Objective updated.` and the saved heading is
   empty.
3. Restore the title, open **Answer, schedule & editing**, replace both the
   prompt question and expected answer with spaces, and activate **Save
   prompt**. The app announces `Prompt updated.` and the prompt heading is
   empty.
4. Reload and export CSV. The loss persists; the exported row is:

```csv
"Explain escape velocity","","","2026-08-29T04:41:48.447Z","no","1"
```

The earlier content is overwritten without confirmation, undo, validation
message, or visible history. This can irreversibly destroy the stated objective
and both sides of a recall prompt—the product's core learning record. In
`src/main.ts`, create handlers validate their trimmed values, while the edit
handlers at lines 333–343 assign the trimmed values and persist without the
equivalent checks. Prompt edit fields also omit the creation form's 400/1,200
character limits.

**Required repair:** validate trimmed edit values before mutating state, retain
the previous saved value on error, apply the same length boundaries as creation,
and add regressions proving whitespace/over-limit edits are rejected with an
announced error and do not change reloads or exports.

## Other defects

### P2 — review dialog Escape and focus lifecycle is incomplete

The native dialog initially focuses the labeled **Close review** button, but its
cancel/close lifecycle is not synchronized with application state:

- Pressing Escape makes `dialog.open` false, but leaves `activeReviewId` set.
- Activating **Data & access** after Escape causes the next render to reopen the
  same modal over the requested page.
- Activating **Close review** explicitly removes the dialog but leaves focus on
  `<body>` rather than returning it to the review trigger.

This is a reproducible keyboard and screen-reader focus-management failure,
although users can escape it through the explicit close button. Handle the
dialog `cancel`/`close` events, clear review state, and restore focus to the
invoking control.

### P2 — populated objective maps emit a production CSP console error

Loading or navigating to a populated objective map logs:

```text
Applying inline style violates the following Content Security Policy directive
'style-src 'self'' ... The action has been blocked.
```

Every objective is rendered with `style="--depth:…"` at `src/main.ts:150`, while
production correctly disallows inline style through `style-src 'self'`. The
custom property is currently unused by the stylesheet, so no visible layout
loss was observed, but a core populated view violates the no-console-error gate
and obscures real browser errors. Remove the inline style (preferred here) or
replace it with a CSP-compatible class; do not weaken the production policy.

## Quality-gate evidence

### Clean checkout, install, tests, and exact build

```text
git rev-parse HEAD
fd172e27c6f62e1019a754ced7c7260d73ed692a

npm ci
61 packages installed; 62 audited; 0 vulnerabilities

npm test
2 files passed; 7/7 tests passed

npm run build
tsc --noEmit passed; Vite 7.3.6 passed; dist/ produced

npm run test:e2e
12/12 Chromium tests passed

npx playwright test tests/service-worker-update.spec.ts --repeat-each=20
20/20 passed

npm run test:live
10/10 passed on the final full run

npm run verify:live
passed; 16 deployed files matched the local dist artifacts
```

There is no lint script or separate lint configuration. Strict TypeScript
checking is part of the exact production build and passed. Packaging into a
consumer does not apply to this static PWA.

An earlier live-suite attempt completed 9/10 cases before the Playwright
Chromium process crashed with `SIGSEGV` while opening the sixth test context.
That case then passed 3/3 in isolation, and the subsequent full live run passed
10/10. There was no page assertion, console error, or product crash associated
with that runner failure.

### Functional, boundary, and recovery coverage

Except for the edit-validation blocker, fresh browser sessions passed:

- objective → evidence link → manually written prompt → reveal → correctness
  and confidence → explained next-review scheduling;
- incorrect/confidence-1 reset to the transparent 1-day interval and
  correct/high-confidence progression in the repository flow;
- whitespace-only creation rejected with an inline alert; invalid URL retained
  with native `Please enter a URL.` feedback and accepted after correction;
- exact creation boundaries of 120/500 characters for objectives and 400/1,200/
  200 for prompt question/answer/note accepted;
- incomplete grading focused the first missing required radio and recovered
  after correctness and confidence were supplied;
- a manual review date persisted through reload and **Use calculated date**
  restored the inspectable schedule;
- objective/evidence/prompt deletion confirmations preserved data when
  dismissed and named the affected record when accepted;
- IndexedDB persistence survived reload; an independently forced IndexedDB
  failure wrote to and reloaded from the documented localStorage fallback;
- encrypted export used `PBKDF2-SHA256`, 250,000 iterations, and AES-GCM, with
  no objective or prompt plaintext in the downloaded payload;
- wrong-passphrase import produced `Could not decrypt this file. Check the file
  and passphrase.`; correct-passphrase import named replacement counts and
  restored the deleted record;
- CSV export contained the objective, due date, override flag, and review count.

### Accessibility, responsive behavior, and browser health

- Axe WCAG 2 A/AA scans found **0 serious and 0 critical** findings in desktop,
  dark, populated 390×844, privacy, and terms states.
- Live pages expose `lang=en`, a descriptive title, one `h1`, one `main`, labels,
  meaningful image alt text, and a working skip link. The legal pages each have
  one `h1`/`main` and no mobile overflow.
- At 390 px, body text is 17 px, `scrollWidth === clientWidth === 390`, the home
  and objective targets are at least 44 px high, and dock targets have 8 px
  spacing.
- Keyboard Tab/Enter/Space use, visible focus, dark mode, and reduced motion
  passed outside the dialog-lifecycle defect. Reduced transition durations were
  at most 0.001 seconds.
- `/opt/fleet/lib/verify-url.sh` returned HTTP 200, load 716 ms, one `h1`, a
  main landmark, no missing alt text or unlabeled buttons, and no empty-state
  console/page errors. The populated-map CSP error is documented above.

### PWA, privacy, deployment, and billing

- Manifest parsing reported zero Chromium errors and confirmed standalone mode,
  versioned `/?v=1#/today` start URL, 192/512 icons, and a maskable icon.
- Normal service-worker control plus offline reload passed live. The synthetic
  two-version update exercised controller change, the visible update notice and
  explicit reload action, precached hashed JS/CSS, and offline reload 20/20.
- Free product flows requested only
  `https://learning-objective-loop.sociobot.in`; no analytics, remote fonts,
  third-party scripts, or study-data egress were observed. License verification
  is the sole configured external fetch.
- Root/index and `sw.js` use revalidation with `max-age=0`; hashed JS, CSS, and
  artwork use `public, max-age=31536000, immutable`.
- Production sends CSP, HSTS with subdomains, `X-Frame-Options: DENY`, nosniff,
  strict referrer policy, and a restrictive permissions policy. Privacy, terms,
  offline, and manifest routes returned 200.
- The live checkout now returns HTTP 303 to
  `checkout.dodopayments.com/session/...`, whose hosted page returned 200. The
  live verify endpoint returned HTTP 200, product-origin CORS, and
  `{ valid: false, reason: "invalid" }` for the synthetic invalid token. No real
  charge was submitted.

### Deployment identity and budgets

`npm run verify:live` matched all 16 public files in `dist/` byte-for-byte.

```text
index.html SHA-256
4c6a30f15bf5fad622a0ba6c357db0e53189ee7ab1ba4e6245ccb3e65f77b812

sw.js SHA-256
71079ac50b2cfaa07b94f5d424a43c2d67530a832ab72844d07f738344cfb973
```

| Asset | Raw | Gzip | Contract |
| --- | ---: | ---: | ---: |
| Initial JavaScript | 35.38 KB | 11.77 KB | ≤ 200 KB raw |
| Initial CSS | 19.52 KB | 5.06 KB | ≤ 50 KB raw |
| Mobile onboarding WebP | 18.51 KB | — | ≤ 300 KB |
| Fonts | 0 KB | — | ≤ 120 KB |

Lighthouse 12.8.2 mobile against production scored **100 performance / 100
accessibility / 100 best practices / 100 SEO**: FCP 1.3 s, LCP 1.3 s, TBT 20 ms,
CLS 0, and Speed Index 1.3 s. Lab Lighthouse did not produce an INP value; the
20 ms TBT and exercised interaction flows are the available lab evidence.

## Retest criteria

1. Reject and preserve prior state for blank/over-limit objective and prompt
   edits, with announced errors and reload/export regressions.
2. Synchronize Escape with review state and restore focus on every dialog close.
3. Eliminate the populated-map CSP console error without weakening CSP.
4. Rerun all repository, repeated service-worker, live identity, axe, keyboard,
   responsive, and Lighthouse checks against the repaired candidate.
