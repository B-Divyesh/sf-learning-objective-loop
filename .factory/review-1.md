# Adversarial first-read review 1 — Objective Loop

**Verdict: FAIL**

Reviewed on 2026-08-30 against
<https://learning-objective-loop.sociobot.in> from fresh Chromium contexts at
390 × 844 and 1440 × 900. The one-click demo and all ten registered claim
commands work, but this round has 36 findings. Four are blocking because parts
of registered claims remain untested. A PASS requires zero findings and no
untested claim.

## Cold first read

Before scrolling or interacting, my answers were:

- **What does this do?** It schedules recall reviews around learning
  objectives and explains why each review is due.
- **For whom?** Self-learners using AI or other learning materials.
- **What should I click first?** **Try it with sample data**.

This check passes at both viewport sizes. The exact copy that supplied the
answers was “Plan reviews around your learning objectives,” “For self-learners
who use AI or other materials…,” and “Try it with sample data.” At desktop,
however, the separate action explanation begins at pixel 895 in a 900-pixel
viewport and is not readable without scrolling; see F-1-19.

Evidence:

- `.factory/review-1-artifacts/cold-mobile.png`
- `.factory/review-1-artifacts/cold-desktop.png`
- `.factory/review-1-artifacts/cold-first-screen.json`

## Findings

### Blocking

#### F-1-1 — The objective-workflow claim test does not assert the promised next review date

- **Quote/location:** `.factory/claims.json`, `objective-review-workflow`:
  “each answer produces an explained next review date.”
- **Observed:** the tagged test selects correctness and confidence, checks only
  text matching “advances one interval,” reloads, and checks that the objective
  title exists. It never asserts the calculated date, interval, or the date
  after reload.
- **Why this fails:** the most important observable result in the registered
  claim is not covered, so the claim remains untested even though its command
  exits successfully.
- **Concrete fix:** freeze the clock, submit a review, assert the exact next
  date and interval in the UI, reload, and assert the same date plus the
  disclosed calculation.

#### F-1-2 — The demo-isolation claim test starts with an empty real notebook

- **Quote/location:** `.factory/claims.json`, `demo-sandbox`: “remains separate
  from the learner’s real notebook”; `tests/app.spec.ts` only checks that a
  demo-only objective is absent after returning to an initially empty real
  namespace.
- **Observed:** a bug that erased existing real data would pass this test. An
  independent live check did create “Private control objective” first and
  confirmed it survived demo mutation, reset, and exit, but that protection is
  absent from the registered regression.
- **Why this fails:** “real data untouched” is a blocking demo requirement and
  must be protected by the claim test, not by a one-off review.
- **Concrete fix:** create and persist a real objective before entering
  `/demo`; mutate and reset the demo; choose **Start for real**; open Objective
  map and assert that the real objective remains and the demo objective does
  not.

#### F-1-3 — The paid-feature tests assert an unlock label, not the features sold

- **Quote/location:** `/data`: “Unlock objective-level recall rates and
  printable weekly summaries for a one-time $19 purchase.”
- **Observed:** `@claim:verified-license` asserts “Study archive · unlocked”
  and token storage. It does not create review history, verify the recall-rate
  calculation, or invoke/inspect the printable weekly summary.
- **Why this fails:** a buyer could receive an “unlocked” badge while the paid
  output is wrong or missing, and every registered test would still pass.
- **Concrete fix:** register the quoted paid-output claim. Seed reviews, return
  a recorded valid license response, assert the expected objective-level rate,
  trigger **Print weekly summary**, and inspect the print layout/content.

#### F-1-4 — The privacy claim test covers one narrow flow under a broad claim

- **Quote/location:** `.factory/claims.json`, `private-core`: “Core study
  actions send requests only to the product origin.”
- **Observed:** the test creates one objective and opens Objective map. It does
  not exercise adding evidence, prompts, grading a review, manual dates, CSV,
  encrypted backup, restore, deletion, or demo reset.
- **Why this fails:** the phrase “core study actions” covers substantially more
  behavior than the test observes.
- **Concrete fix:** run the full core workflow in one fresh context while
  recording requests. Assert no request body contains seeded study text and
  that every request is same-origin. Test billing separately as the documented
  exception.

### Major

#### F-1-5 — The strongest privacy sentence is unlisted and overbroad

- **Quote/location:** desktop navigation: “Nothing leaves this device unless
  you choose to export it.” Related landing/README copy says “Study content
  stays in this browser” and “Study content remains on the device.”
- **Observed:** `private-core` promises only product-origin requests. The
  absolute sentence also ignores license verification and outbound evidence
  links, neither of which is an export.
- **Why this fails:** a privacy-sensitive visitor can reasonably read “nothing”
  literally, while the registered claim and actual network boundary are
  narrower.
- **Concrete fix:** use “Study content stays on this device. License checks
  contact Sociobot; opening an evidence link visits that site.” Register this
  exact boundary and test both the local core flow and the stated exceptions.

#### F-1-6 — The README’s negative product-scope claim is unlisted

- **Quote/location:** README: “It does not generate cards, ingest course
  content, or hide scheduling behind a recommendation model.”
- **Why this fails:** this is useful purchase/use guidance, but no claims entry
  or tagged test covers any of the three limits.
- **Concrete fix:** either remove it or register a `manual-input-only` claim
  whose test confirms there is no generation/import path and that every shown
  schedule exposes its interval calculation. Plain rewrite: “You write each
  prompt. Objective Loop does not import course content or choose dates with a
  hidden model.”

#### F-1-7 — Nested objectives and evidence links are an unlisted capability

- **Quote/location:** README: “Builds nested learning objectives with evidence
  links.”
- **Why this fails:** no claim entry tests parent-child persistence, deep links,
  or evidence persistence together.
- **Concrete fix:** add a `nested-objectives-evidence` claim and a tagged test
  that creates a parent, child, and HTTP(S) evidence link, reloads, and asserts
  the tree and link.

#### F-1-8 — Logged correctness and confidence are an unlisted capability

- **Quote/location:** README: “Logs correctness and 1–5 confidence after the
  expected answer is revealed.”
- **Why this fails:** the workflow test selects these values but does not assert
  that either value is saved or displayed after reload.
- **Concrete fix:** add the fields to the workflow claim and assert the exact
  correctness and confidence values in Recent evidence after reload.

#### F-1-9 — “Stores everything in IndexedDB” is unlisted and technically imprecise

- **Quote/location:** README: “Stores everything in IndexedDB and works after
  an offline reload.”
- **Observed:** study state normally uses IndexedDB, but the implementation has
  a localStorage fallback and stores theme/license data in localStorage.
- **Why this fails:** “everything” gives a false storage model and the listed
  offline claim does not assert the storage mechanism.
- **Concrete fix:** rewrite as “Study records use IndexedDB, with localStorage
  as a fallback. The app reloads offline after your first visit.” Register and
  test the first sentence separately if it remains.

#### F-1-10 — The no-tracking/runtime-assets sentence is an unlisted claim

- **Quote/location:** README: “There are no analytics, ads, third-party fonts,
  or runtime scripts.”
- **Why this fails:** the current request log supports the intent, but
  `claims.json` has no matching claim and the same-origin-only test would not
  detect same-origin analytics.
- **Concrete fix:** register `no-tracking-or-third-party-runtime`; inspect all
  requests during the complete demo flow and assert that scripts/fonts are
  shipped only from the product origin and no analytics endpoint is called.
  Rewrite “runtime scripts” as “third-party JavaScript.”

#### F-1-11 — The stated Sociobot network exception is unlisted

- **Quote/location:** README: “Only license purchase/verification contacts
  Sociobot.”
- **Why this fails:** this is a network-boundary promise. No one tagged test
  proves both that core actions avoid Sociobot and that only the two named
  actions can call it.
- **Concrete fix:** register `sociobot-network-boundary` and cover core, checkout,
  and verification flows in one request-matrix test.

#### F-1-12 — Backup replacement is an unlisted destructive behavior

- **Quote/location:** `/data`, Restore a backup: “Import replaces the current
  record after confirmation.”
- **Why this fails:** there is no claim entry or end-to-end restore test. A
  destructive import path needs a regression that proves confirmation,
  replacement, and recovery from the exported file.
- **Concrete fix:** register `encrypted-restore`; export known state, add a
  sentinel record, import the backup, accept the named confirmation, and assert
  exact restored state. Also test cancel and wrong-passphrase preservation.

#### F-1-13 — Passphrase non-recovery is an unlisted operational claim

- **Quote/location:** `/data`: “Encrypted backups use your passphrase; we never
  receive it.” `/privacy`: “We cannot recover it.”
- **Why this fails:** `encrypted-backup` checks ciphertext contents and a local
  round trip, but does not record requests during export/import or define what
  “we cannot recover” means.
- **Concrete fix:** replace both with the testable sentence “The passphrase is
  used only in this browser and is not saved.” Add request and storage
  assertions to the encrypted-backup claim.

#### F-1-14 — The landing route stops after the hero instead of using the required site skeleton

- **Quote/location:** `/` moves from the hero’s unlabelled numbered list
  directly to the footer.
- **Why this fails:** there is no live product preview, no `How it works`
  heading, no plain “what it does not do/privacy” section, and no paid section
  naming what $19 unlocks. The image and three fragments do not provide the
  required semantic sections.
- **Concrete fix:** below the first screen, add a real read-only sample preview,
  `How it works` with the three steps, `What stays on this device` with the
  network exceptions, and `Study archive — $19 once` naming recall reports and
  printable weekly summaries.

#### F-1-15 — Two real routes do not have useful route-specific titles

- **Quote/location:** `/today` uses “Objective Loop — explainable learning
  reviews”; `/objectives/demo-seasons?demo=1` uses “Objective — Objective Loop.”
- **Why this fails:** `/today` is not distinguished from `/`, and “Objective”
  does not identify the opened objective.
- **Concrete fix:** use “Review queue — Objective Loop” for `/today` and a
  capped content title such as “Seasons by hemisphere — Objective Loop” for the
  objective detail route. Add title assertions for both.

#### F-1-16 — The designed 404 omits required metadata

- **Quote/location:** `/404.html` and an unknown URL have no meta description
  and no canonical link.
- **Why this fails:** the static error page falls below the metadata standard
  applied to the app routes.
- **Concrete fix:** add a plain meta description and canonical URL to
  `public/404.html`; retain `noindex`. Test both `/404.html` and a rewritten
  unknown URL.

#### F-1-17 — The 404 footer is inconsistent and omits Privacy and Terms

- **Quote/location:** 404 footer: “Built by Param Factory · Objective Loop.”
- **Why this fails:** every other route has Privacy and Terms links. A visitor
  arriving on a bad deep link loses both required legal links.
- **Concrete fix:** use the same wordmark/header and footer link set as the app,
  including Privacy, Terms, Param Factory, and the build id.

#### F-1-18 — External links do not say that they leave the product

- **Quote/location:** demo evidence link “Axial tilt notes” opens a new tab;
  `/data` purchase action “Buy once · $19” navigates to Sociobot/Dodo.
- **Why this fails:** neither accessible name tells a keyboard or screen-reader
  user that the destination is external.
- **Concrete fix:** append visible or screen-reader text: “Axial tilt notes
  (opens external site)” and “Buy Study archive · $19 at Sociobot (opens
  external checkout).”

#### F-1-19 — The desktop first screen hides the action-result explanation

- **Quote/location:** at 1440 × 900, “Opens three sample objectives and their
  due prompts.” starts at y=895 and ends at y=950.
- **Why this fails:** the mandatory explanation beside the primary action is
  effectively below the first screen, so the button’s result is not available
  before scrolling.
- **Concrete fix:** reduce the desktop headline/image height or place the hint
  inline with the button. Add a viewport assertion that the hint’s bottom is at
  or above `window.innerHeight`.

### Minor / copy

#### F-1-20 — “Goals” breaks the product’s objective terminology

- **Quote/location:** landing audience sentence: “recall prompts tied to goals
  they can explain.” Everywhere else the concept is “objectives.”
- **Why this fails:** two words for one concept make the core model less crisp.
- **Concrete fix:** “For self-learners using AI or other materials who need
  recall prompts tied to clear learning objectives.”

#### F-1-21 — “Local · private” is a vague status label

- **Quote/location:** header: “Local · private.”
- **Why this fails:** “local” is technical shorthand and “private” is an
  unexplained claim.
- **Concrete fix:** “Study data stays here,” with the full network exceptions
  on Privacy.

#### F-1-22 — “Objective-aware study reviews” is a decorative jargon label

- **Quote/location:** landing kicker: “Objective-aware study reviews.”
- **Why this fails:** it repeats the headline and uses the abstract adjective
  “objective-aware” instead of naming a section.
- **Concrete fix:** delete the kicker, or replace it with a real section label
  such as “Review planner.”

#### F-1-23 — “New objective” is not a result-naming verb

- **Quote/location:** persistent navigation action: “New objective.”
- **Why this fails:** the label names an object rather than the result of the
  action.
- **Concrete fix:** “Create objective.”

#### F-1-24 — The first-screen price fact uses an unexplained tier name

- **Quote/location:** “Core notebook free; Study archive $19 once.”
- **Why this fails:** a cold visitor cannot tell what “Study archive” unlocks.
- **Concrete fix:** “Core reviews and exports are free. History reports cost
  $19 once.”

#### F-1-25 — “Offline-first” is README jargon

- **Quote/location:** “Objective Loop is a private, offline-first review
  notebook for self-learners.”
- **Concrete fix:** “Objective Loop is a private review notebook for
  self-learners. It works without internet after the first visit.”

#### F-1-26 — The backup bullet leads with unexplained cryptography terms

- **Quote/location:** “Exports encrypted `.loop` backups (PBKDF2 + AES-256-GCM)
  and readable CSV.”
- **Why this fails:** the user-facing result is obscured by implementation
  jargon.
- **Concrete fix:** “Exports password-protected `.loop` backups and readable
  CSV. Technical details: PBKDF2-SHA256 with 250,000 iterations and
  AES-256-GCM.”

#### F-1-27 — “Staging” is undefined in the setup instruction

- **Quote/location:** “To point license checks at staging, set
  `VITE_BILLING_API_BASE=…` before building.”
- **Concrete fix:** “To test license checks against Sociobot’s test server, set
  `VITE_BILLING_API_BASE=…` before building.”

#### F-1-28 — One README sentence exceeds 22 words and uses “provenance”

- **Quote/location:** “The researched scope is recorded in
  `.factory/brief.json`, the original visual system and image provenance in
  `.factory/design.md`, the demo isolation in `.factory/demo.md`, and release
  verification in `.factory/handoff.md`.” (26 words)
- **Concrete fix:** “See `.factory/brief.json` for scope and
  `.factory/design.md` for the visual system and image sources. See
  `.factory/demo.md` for demo isolation. See `.factory/handoff.md` for release
  checks.”

#### F-1-29 — “Start for real” does not name the destination

- **Quote/location:** demo banner and README: “Start for real.”
- **Why this fails:** it does not say that demo data is discarded and the
  learner’s notebook opens.
- **Concrete fix:** button “Open my notebook”; nearby text “Discards demo
  changes.”

#### F-1-30 — Prompt buttons use the noun “Review” as an action

- **Quote/location:** due rows and objective prompt cards: “Review.”
- **Concrete fix:** “Review this prompt,” retaining the prompt question in the
  accessible name.

#### F-1-31 — The purchase button does not name the purchased result

- **Quote/location:** `/data`: “Buy once · $19.”
- **Concrete fix:** “Buy Study archive · $19,” plus the external-checkout note
  from F-1-18.

#### F-1-32 — “Review desk” is a mood heading

- **Quote/location:** demo/Review route kicker: “Review desk.”
- **Concrete fix:** “Due reviews.”

#### F-1-33 — “Evidence shelf” is a metaphor heading

- **Quote/location:** objective detail heading: “Evidence shelf.”
- **Concrete fix:** “Evidence links.”

#### F-1-34 — “New field note” is brand-lore copy

- **Quote/location:** new-objective route kicker: “New field note.”
- **Concrete fix:** “New objective.”

#### F-1-35 — The Data page H1 is a slogan, not the page job

- **Quote/location:** `/data`: “Your learning record belongs to you.”
- **Concrete fix:** “Export, restore, or unlock reports.”

#### F-1-36 — The populated Objective map H1 does not name the section

- **Quote/location:** populated `/objectives`: “Your learning has a visible
  structure.”
- **Concrete fix:** “Your learning objectives.”

## Copy audit

Counts treat a hyphenated term or URL as one word and ignore punctuation-only
separators. `PASS` means no length, jargon, terminology, slogan, or action-label
flag was found in this review.

### Landing page

| Text | Words | Result |
| --- | ---: | --- |
| Objective Loop | 2 | PASS — product name |
| Local · private | 2 | F-1-21 |
| Review | 1 | PASS — navigation |
| Objective map | 2 | PASS — navigation |
| Data & access | 3 | PASS — navigation |
| New objective | 2 | F-1-23 |
| Nothing leaves this device unless you choose to export it. | 10 | F-1-5 |
| Objective-aware study reviews | 3 | F-1-22 |
| Plan reviews around your learning objectives | 6 | PASS |
| For self-learners who use AI or other materials and need recall prompts tied to goals they can explain. | 18 | F-1-20 |
| Start with one outcome you want to demonstrate. | 8 | PASS |
| Add a short-answer prompt, then let each answer set the next review date. | 13 | PASS |
| Try it with sample data | 5 | PASS — result-naming action |
| Opens three sample objectives and their due prompts. | 8 | F-1-19 at desktop only |
| Create your first objective | 4 | PASS |
| Works offline after the first visit. | 6 | PASS — listed claim |
| Study content stays in this browser. | 6 | F-1-5 |
| Core notebook free; Study archive $19 once. | 7 | F-1-24 |
| State an objective | 3 | PASS |
| Write a recall prompt | 4 | PASS |
| Review with evidence | 3 | PASS |
| Original AI-generated field-guide artwork. | 4 | PASS — asset disclosure |
| Privacy | 1 | PASS |
| Terms | 1 | PASS |
| Built by Param Factory | 4 | PASS |
| build 1.0.1-repair-6 | 2 | PASS |

### README

| Text | Words | Result |
| --- | ---: | --- |
| Objective Loop | 2 | PASS — heading |
| Objective Loop is a private, offline-first review notebook for self-learners. | 10 | F-1-25 |
| It keeps recall prompts attached to explicit learning objectives and explains every due date. | 14 | PASS — listed workflow claim |
| It does not generate cards, ingest course content, or hide scheduling behind a recommendation model. | 15 | F-1-6 |
| Live product: https://learning-objective-loop.sociobot.in | 3 | PASS |
| Try the isolated sample notebook: https://learning-objective-loop.sociobot.in/demo. | 6 | PASS |
| Use Reset demo to restore the sample or Start for real to discard it and return to your own notebook. | 20 | F-1-29 |
| Older ?demo=1#/today links redirect to /demo. | 6 | PASS |
| What it does | 3 | PASS — heading |
| Builds nested learning objectives with evidence links. | 7 | F-1-7 |
| Attaches hand-written short-answer prompts to each objective. | 7 | PASS — listed workflow claim |
| Logs correctness and 1–5 confidence after the expected answer is revealed. | 11 | F-1-8 |
| Schedules transparent 1, 3, 7, 14, 30, 60, and 120-day review steps. | 12 | PASS — listed scheduling claim |
| Allows visible manual due-date overrides. | 5 | PASS — listed claim |
| Stores everything in IndexedDB and works after an offline reload. | 10 | F-1-9 |
| Exports encrypted `.loop` backups (PBKDF2 + AES-256-GCM) and readable CSV. | 10 | F-1-26; capabilities are listed claims |
| Offers an optional $19 one-time Study archive license through Sociobot billing; all core study and export features remain free. | 19 | F-1-24; price is a listed claim |
| Run locally | 2 | PASS — heading |
| Requires Node.js 20 or newer. | 5 | PASS — required tool name |
| Open the URL printed by Vite. | 6 | PASS — build-tool name |
| No environment variables are needed for the core app. | 9 | PASS — setup instruction verified by clean build |
| To point license checks at staging, set `VITE_BILLING_API_BASE=…` before building. | 10 | F-1-27 |
| Test and build | 3 | PASS — heading |
| The exact production build command is `npm run build`; deploy the generated `dist/` directory. | 14 | PASS |
| Playwright 1.58.2 is pinned for the browser tests. | 8 | PASS — test-tool name |
| Tested product claims and their exact commands are listed in `.factory/claims.json`. | 11 | PASS |
| Data and privacy | 3 | PASS — heading |
| Study content remains on the device. | 6 | F-1-5 |
| There are no analytics, ads, third-party fonts, or runtime scripts. | 10 | F-1-10 |
| Only license purchase/verification contacts Sociobot. | 5 | F-1-11 |
| See `/privacy` and `/terms` in the app. | 7 | PASS |
| The researched scope is recorded in `.factory/brief.json`, the original visual system and image provenance in `.factory/design.md`, the demo isolation in `.factory/demo.md`, and release verification in `.factory/handoff.md`. | 26 | F-1-28 |
| License | 1 | PASS — heading |
| MIT © 2026 Sociobot (Param Factory). | 6 | PASS |

Terminology observed: `objective` for a learning outcome, `prompt` for a
question, `review` for an attempt, `evidence` for a source/work sample, `queue`
for due prompts, `manual date` for an override, `demo` for the isolated sample,
and `Study archive` for the paid reports. F-1-20 is the one direct concept-term
break (`goals` versus `objectives`); F-1-24 asks that the paid term be defined
before use.

## Demo and sandbox result

The one-click path itself passes:

- **Try it with sample data** opens `/demo` in one click.
- The first demo screen already shows 3 objectives, 3 prompts, 2 due prompts,
  one prior review, and a realistic seasons question.
- The persistent banner says “Demo — sample data, nothing is saved to your
  notebook,” with **Reset demo** and **Start for real**.
- Reset removed a created demo objective and restored the sample.
- A real “Private control objective” created before demo remained in the real
  Objective map after leaving demo; the demo-only objective did not.
- IndexedDB used separate `objective-loop` and `objective-loop-demo`
  databases. After **Start for real**, only the real database remained.
- The demo reloaded offline with sample content visible.
- Every request during the online demo flow used
  `https://learning-objective-loop.sociobot.in`; there were no console errors.

Evidence:

- `.factory/review-1-artifacts/demo-first-screen-mobile.png`
- `.factory/review-1-artifacts/demo-one-click.json`
- `.factory/review-1-artifacts/demo-isolation.json`

## Registered claims

All commands were run exactly as listed from clean clone
`/tmp/objective-loop-review-1.lTX6Zk` after `npm ci` (61 packages, 0 reported
vulnerabilities).

| Claim | Command result | Coverage result |
| --- | --- | --- |
| `objective-review-workflow` | PASS, 1/1 | BLOCKING gap F-1-1 |
| `explained-scheduling` | PASS, 1/1 | Covered |
| `manual-override` | PASS, 1/1 | Covered |
| `csv-export` | PASS, 1/1 | Covered |
| `encrypted-backup` | PASS, 1/1 | Covered; related privacy wording needs F-1-13 |
| `offline-reload` | PASS, 1/1 | Covered |
| `private-core` | PASS, 1/1 | BLOCKING gap F-1-4 |
| `demo-sandbox` | PASS, 1/1 | BLOCKING gap F-1-2 |
| `one-time-price` | PASS, 1/1 | Checkout/price covered; paid output gap F-1-3 |
| `verified-license` | PASS, 1/1 | BLOCKING paid output gap F-1-3 |

Unlisted claim findings are F-1-5 through F-1-13. No registered command
failed; the FAIL comes from untested portions and unlisted claims.

## Structure, links, accessibility, and identity

Confirmed:

- Valid app routes return 200; an unknown route returns the designed 404 with
  HTTP 404.
- Each tested app route has one H1, one main, a header, and a footer.
- SPA navigation moves focus to the new H1, announces it, and Back restores the
  prior route and H1 focus.
- All discovered internal links returned 200. Wikipedia returned 200. The
  checkout endpoint returned 303 to `checkout.dodopayments.com`; `mailto:` was
  treated as an explicit scheme.
- Root metadata includes description, canonical, OG/Twitter image, SVG
  favicon, apple-touch icon, English `lang`, and theme color.
- The worker `verify-url.sh` passed with no console errors, one H1, one main,
  and no missing alt text or unnamed buttons.
- Playwright axe reported zero WCAG 2 A/AA violations on `/`, `/demo`, `/data`,
  `/privacy`, `/terms`, a demo objective deep link, and the unknown-route 404.
- The dithered field-guide layout, paper/ink palette, condensed labels,
  halftone art, registration marks, and stamp motifs are product-specific and
  do not resemble a generic SaaS hero/card template.

Failures are recorded in F-1-14 through F-1-19. Raw results are in
`.factory/review-1-artifacts/structure.json`, `axe.json`, and `verify-url/`.

## History check

No earlier `.factory/review-*.md` or `.factory/polish-*.md` existed before this
file. I read the current `.factory/handoff.md`, which reports verification 7 as
PASS with no known gaps, and inspected `.factory/verification-7.md`. Its claims
about the live artifact, demo operation, local gates, request origins,
accessibility, and distinctive presentation were rechecked and still hold.
That handoff did not contain earlier finding IDs to re-raise. This review finds
claim-coverage, copy, and static-404 gaps outside the acceptance assertions in
that handoff.

## Missed leverage

No additional AI feature is justified by the brief. The brief explicitly asks
for manually written prompts and an inspectable, non-opaque schedule. Adding
AI drafting would add key handling and network/privacy complexity without being
necessary for the core job. Import/export is already present through encrypted
backup restore and readable CSV. Sync is not implied by the local-first scope.

## What would make this perfect

Resolve every F-1 finding, especially the four blocking claim-test gaps and the
unlisted privacy/paid/restore claims. Then rerun every claims command from a new
clone, the full unit/build/e2e gates, the live request log, route crawl,
desktop/390px cold reads, 404 metadata/footer checks, and axe. PASS is
appropriate only when that rerun produces zero findings and no copy or feature
claim lacks a matching observable test.
