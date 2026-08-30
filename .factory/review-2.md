# Adversarial first-read review 2 — Objective Loop

**Verdict: FAIL**

Reviewed 2026-08-30 against <https://learning-objective-loop.sociobot.in>
from fresh Chromium contexts at 390 × 844 and 1440 × 900. Product source was
not modified.

## Cold first read

Before scrolling, the product was understandable at both sizes:

- **What it does:** schedules recall reviews around learning objectives and
  explains the next date.
- **For whom:** self-learners using AI or other materials.
- **First action:** **Try it with sample data**; it says this opens three
  sample objectives and their due prompts.

The exact first-screen text was “Plan reviews around your learning objectives,”
“For self-learners using AI or other materials who need recall prompts tied to
clear learning objectives,” and “Try it with sample data.” The action result
is visible without scrolling: its lower edge was y=542 on 390 × 844 and y=702
on 1440 × 900. This check passes.

## Findings

### Blocking

#### F-2-1 — Registered persistence claims are intermittent under the published test flow

- **Quote/location:** `.factory/claims.json`, `verified-license`: “A valid
  returned Sociobot license unlocks objective recall rates and a printable
  weekly summary on that device.” The corresponding assertion is
  `tests/app.spec.ts:451–456`.
- **Observed:** Running every published command sequentially after `npm ci`
  failed the exact `@claim:verified-license` command once. The archive rendered
  as unlocked, but the expected just-recorded review was missing: “0% recall
  across 0 reviews” and “Explain orbital seasons — 0% recall · 0 reviews.”
  An immediate retry passed. A full `npm run test:live` then failed the same
  test and `@claim:nested-objectives-evidence`; the latter reloaded the child
  objective with “0 links,” although it had attached an evidence link. Direct
  live retries passed.
- **Why this fails:** the required claim command is not dependable from a
  clean run, and the failure state is lost saved study data. A passing retry
  does not make a failing registered claim test acceptable.
- **Concrete fix:** identify the IndexedDB/navigation race and ensure every
  save is durably committed before subsequent route changes or reloads. Add a
  regression that repeats create → save → immediate navigation/reload at least
  ten times for prompts/reviews and evidence links, asserting the persisted
  records every time. Run that stability check in CI alongside each exact claim
  command.

### Major

#### F-2-2 — “Core reviews and exports are free” is an unlisted price claim

- **Quote/location:** landing fact line: “Core reviews and exports are free.”
- **Observed:** `one-time-price` registers and tests only that the Study archive
  costs $19 and that CSV export remains free. It does not register or observe
  that reviews are free, or that encrypted backup export is free.
- **Why this fails:** the sentence is a decision-relevant pricing promise. The
  claim manifest must cover the full sentence, not just one export format.
- **Concrete fix:** either change the line to “CSV export is free” or add a
  claim such as “Core reviews, CSV export, and encrypted backup export remain
  free,” with a demo test that completes a review and both exports before and
  after the paid license state.

### Minor

#### F-2-3 — The empty objective-map H1 does not name the page

- **Quote/location:** `/objectives` with no records: “Map what you want to
  know.” Source: `src/main.ts:225`.
- **Why this fails:** heard alone in a heading list, it does not identify the
  section or the product’s object. It also changes the otherwise consistent
  “learning objectives” language into a vague slogan.
- **Concrete fix:** use the same direct H1 in both states: “Your learning
  objectives.”

#### F-2-4 — The 404 H1 uses notebook metaphor instead of the error state

- **Quote/location:** `/404.html`: “This page is not in the notebook.”
- **Why this fails:** a first-time visitor and screen-reader heading list need
  the error named directly. The visible kicker does say “Page not found,” but
  the H1 is the page headline.
- **Concrete fix:** change the H1 to “Page not found.” Keep the explanatory
  sentence and return action.

## Copy audit

Counts treat hyphenated terms, URLs, and `$19` as one word. Labels and headings
are included because they are reader-facing landing copy. `OK` means no
plain-words flag in this review.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Objective Loop | 2 | OK — product name |
| Study data stays here | 4 | OK — status; explained below |
| Review | 1 | OK — navigation |
| Objective map | 2 | OK — navigation |
| Data & access | 3 | OK — navigation |
| Try sample data | 3 | OK — result-naming action |
| Create objective | 2 | OK — result-naming action |
| Study data stays on this device. | 6 | OK — listed privacy boundary |
| See Privacy for license and link exceptions. | 8 | OK |
| Plan reviews around your learning objectives | 6 | OK |
| For self-learners using AI or other materials who need recall prompts tied to clear learning objectives. | 15 | OK |
| Start with one outcome you want to demonstrate. | 8 | OK |
| Add a short-answer prompt, then let each answer set the next review date. | 13 | OK |
| Try it with sample data | 5 | OK — result-naming action |
| Opens three sample objectives and their due prompts. | 8 | OK — listed demo claim |
| Create your first objective | 4 | OK — result-naming action |
| Works offline after the first visit. | 6 | OK — listed claim |
| Study content stays on this device. | 6 | OK — listed privacy boundary |
| Core reviews and exports are free. | 6 | F-2-2 |
| History reports cost $19 once. | 6 | OK — listed price/output claims |
| State an objective | 3 | OK |
| Write a recall prompt | 4 | OK |
| Review with evidence | 3 | OK |
| Sample review queue | 3 | OK |
| See the reason, interval, and date before you review. | 10 | OK |
| Due | 1 | OK — status |
| Why is it summer in Australia when it is winter in Europe? | 12 | OK — sample question |
| New prompt — it has not been reviewed yet. | 8 | OK |
| Review this prompt | 3 | OK — result-naming action |
| How it works | 3 | OK |
| State an objective. | 3 | OK |
| Name what you want to demonstrate. | 6 | OK |
| Write a recall prompt. | 4 | OK |
| Add the answer you will check. | 6 | OK |
| Review and inspect. | 3 | OK |
| Log your result and see the next date. | 8 | OK |
| What stays on this device | 5 | OK |
| Objectives, prompts, reviews, and backup passphrases stay in this browser. | 10 | OK — listed privacy/passphrase claims |
| License checks contact Sociobot. | 4 | OK — listed network-boundary claim |
| Evidence links open only when you select them. | 8 | OK |
| Study archive — $19 once | 4 | OK |
| Core reviews and CSV exports stay free. | 7 | F-2-2 |
| The one-time archive adds objective recall rates and printable weekly summaries. | 11 | OK — listed license claim |
| See data and access options | 5 | OK — result-naming link |
| Original AI-generated field-guide artwork. | 4 | OK — provenance |
| Privacy | 1 | OK |
| Terms | 1 | OK |
| Built by Param Factory | 4 | OK |
| build 1.0.2-polish-1 | 2 | OK |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Objective Loop | 2 | OK — heading |
| Objective Loop is a private review notebook for self-learners. | 10 | OK |
| It works without internet after the first visit. | 8 | OK — listed claim |
| It keeps hand-written recall prompts tied to learning objectives and explains every due date. | 13 | OK — listed workflow claim |
| Live product: https://learning-objective-loop.sociobot.in | 3 | OK |
| Try the isolated sample notebook: https://learning-objective-loop.sociobot.in/demo. | 6 | OK |
| Use Reset demo to restore the sample. | 7 | OK |
| Use Open my notebook to discard demo changes and return to your notebook. | 13 | OK |
| Older ?demo=1#/today links redirect to /demo. | 6 | OK |
| What it does | 3 | OK — heading |
| Builds nested learning objectives with evidence links. | 7 | OK — listed claim |
| Attaches hand-written short-answer prompts to each objective. | 7 | OK — listed workflow claim |
| Logs correctness and 1–5 confidence after the expected answer is revealed. | 11 | OK — listed workflow claim |
| Schedules the disclosed 1, 3, 7, 14, 30, 60, and 120-day steps. | 12 | OK — listed claim |
| Allows visible manual review-date overrides. | 5 | OK — listed claim |
| Uses IndexedDB for study records, with localStorage as a fallback. | 10 | OK — listed claim |
| Exports password-protected .loop backups and readable CSV. | 8 | OK — listed claims |
| Offers a one-time $19 Study archive license for recall rates and printable weekly summaries. | 14 | OK — listed claims |
| You write each prompt. | 5 | OK |
| Objective Loop does not import course content or choose dates with a hidden model. | 14 | OK — listed claim |
| Run locally | 2 | OK — heading |
| Requires Node.js 20 or newer. | 5 | OK |
| Open the URL printed by Vite. | 6 | OK |
| No environment variables are needed for the core app. | 9 | OK |
| To test license checks against Sociobot’s test server, set VITE_BILLING_API_BASE=https://pilot-api.sociobot.in/api/v1 before building. | 10 | OK — setup instruction |
| Test and build | 3 | OK — heading |
| The production build command is npm run build; deploy dist/. | 9 | OK |
| Playwright 1.58.2 is pinned for browser tests. | 8 | OK |
| Claims and their exact commands are listed in .factory/claims.json. | 9 | OK |
| Data and privacy | 3 | OK — heading |
| Study content stays on this device. | 6 | OK — listed privacy boundary |
| The core app has no analytics, ads, third-party fonts, or third-party JavaScript. | 12 | OK — listed claim |
| License purchase and verification contact Sociobot. | 6 | OK — listed claim |
| Evidence links open their site only when you select them. | 9 | OK |
| See /privacy and /terms in the app. | 6 | OK |
| See .factory/brief.json for scope and .factory/design.md for the visual system and image sources. | 11 | OK |
| See .factory/demo.md for demo isolation. | 6 | OK |
| See .factory/handoff.md for release checks. | 6 | OK |
| License | 1 | OK — heading |
| MIT © 2026 Sociobot (Param Factory). | 6 | OK |

Terminology is otherwise consistent: **objective**, **prompt**, **review**,
**evidence link**, **review queue**, **manual date**, **demo**, and **Study
archive**. There is no banned marketing language or sentence over 22 words.

## Demo and sandbox

The one-click demo check passes. **Try it with sample data** opens `/demo`;
the first screen contains three objectives, three prompts, two due prompts, a
realistic seasons question, and an existing review. The persistent banner reads
“Demo — sample data, nothing is saved to your notebook,” with **Reset demo**
and **Open my notebook**. Real data created before entry remained after exit;
the live demo reloaded offline after service-worker control. The online demo
request log contained only the product origin and no console/page errors.

The failed persistence cases in F-2-1 mean the isolation/persistence evidence
is not yet sufficient for a PASS despite those successful manual checks.

## Claims and test evidence

`npm ci` succeeded (61 packages, no vulnerabilities). `npm test` passed 8/8;
`npm run build` passed and produced `dist/`; the final local `npm run test:e2e`
passed 31/31. All 17 published command forms were exercised. The scheduler and
crypto commands passed; the exact browser commands passed on individual rerun.

However, the clean sequential execution produced the F-2-1
`@claim:verified-license` failure, and a subsequent live full suite failed
both `@claim:verified-license` and `@claim:nested-objectives-evidence` before
their individual retries passed. These are failing claim-test observations, so
F-2-1 remains blocking.

## Structure, links, accessibility, and identity

Confirmed on the live site:

- Root, demo, review, objectives, new-objective, data, privacy, terms, and
  static 404 routes return the expected status; a missing route returns the
  designed HTTP 404.
- Each checked route has a title, description, canonical URL, one H1, main,
  header, and footer. Root has OG/Twitter metadata and product artwork.
- The app routes, footer links, navigation, back-button focus, and route
  announcements passed the local full suite. Internal links discovered on the
  checked routes returned 200; `mailto:` is explicit. External destinations
  were not opened under this work order’s resource boundary.
- Live response headers include CSP, frame protection, referrer policy,
  permissions policy, and immutable caching for hashed assets. Core first-load
  requests were same-origin only. The live first load had no console errors.
- The field-guide paper/ink/registration-mark visual system is distinct and
  matches `.factory/design.md`; it is not a generic SaaS template.

The two heading defects are F-2-3 and F-2-4. No additional AI feature is
expected: the brief specifically calls for manual prompts and an inspectable
local schedule. Import/export is already present, and sync is not implied.

## Earlier finding closure check

Read `review-1.md`, `polish-1.md`, all `verification*.md`, and the previous
handoff. Every F-1 finding was rechecked in live UI and source/tests:

| Earlier IDs | Result |
| --- | --- |
| F-1-1–F-1-4 | Fixed in the claim tests: exact saved review/date, real-before-demo isolation, paid outputs, and full core request flow are present. F-2-1 is a new stability regression in those flows. |
| F-1-5–F-1-13 | Fixed: revised privacy boundary, registered manual input/nesting/storage/runtime/network/restore/passphrase claims, and matching tests are present. |
| F-1-14–F-1-19 | Fixed: landing preview/How it works/privacy/paid sections, route titles, 404 metadata/footer, external link wording, and first-screen action hint all work. |
| F-1-20–F-1-36 | Fixed: objective terminology, plain button labels, price explanation, README revisions, demo exit wording, and named page headings are present. F-2-3 is a new empty-state H1 variant; F-2-4 is a new assessment of the 404 H1 wording. |

## What would make this perfect

Make saved records durable before navigation/reload and prove that reliability
with repeated live and local claim runs. Then register or narrow the full free
pricing statement, replace the two vague H1s, and rerun the complete checklist
from a clean clone. A PASS requires zero findings and no intermittent or
untested claim.
