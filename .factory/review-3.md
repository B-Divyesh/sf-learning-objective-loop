# Adversarial first-read review 3 — Objective Loop

**Verdict: FAIL**

Reviewed 2026-09-01 against https://learning-objective-loop.sociobot.in from fresh Chromium contexts at 390 × 844 and 1440 × 900. Product source was not modified. The deployed artifacts match 572ba6d1f75e03096fdbc229a666050e080a662c (19 files).

## Cold first read

Before scrolling, the first screen answered all required questions at both sizes.

- What it does: schedules recall reviews around stated learning objectives and shows the next date.
- For whom: self-learners using AI or other learning materials.
- First click: **Try it with sample data**, which says it opens three sample objectives and their due prompts.

The exact text was “Plan reviews around your learning objectives,” “For self-learners using AI or other materials who need recall prompts tied to clear learning objectives,” and “Opens three sample objectives and their due prompts.” The action hint ended at y=542 on mobile and y=702 on desktop, inside both first viewports. This check passes.

## Findings

### Blocking

#### F-3-1 — The registered price claim test is intermittent in a clean clone

- **Quote/location:** .factory/claims.json, one-time-price: “Core reviews, CSV export, and encrypted backup export remain free before and after a one-time $19 Sociobot Study archive purchase.”
- **Observed:** After npm ci in a fresh clone at the reviewed commit, the exact published command npm run test:e2e -- --grep "@claim:one-time-price" failed. After the controlled checkout return to /?license=price-license-token#/data, the page did not render “Study archive · unlocked” within Playwright’s five-second assertion window. The exact command passed on immediate retry; the full local 33-test suite and live 30-test suite also passed.
- **Why this fails:** A registered claim command must pass consistently from a clean checkout. A retry does not confirm that a purchaser sees the returned-license state reliably.
- **Concrete fix:** Make completion of returned-license verification a deterministic state before rendering the unlocked archive panel, with a clear retry/error state if it cannot complete. Add a regression that repeats this exact returned-license flow in fresh contexts and asserts the unlocked panel, recall rate, and print action each time.

## Copy audit

Counts use whitespace-delimited words; a URL, hyphenated word, and $19 each count as one word. No sentence exceeds 22 words. No jargon, marketing adjective, inconsistent term, context-free heading, metaphor heading, or non-result-naming action was found.

### Landing page

| Sentence | Words | Result |
| --- | ---: | --- |
| Study data stays on this device. | 6 | OK |
| See Privacy for license and link exceptions. | 8 | OK |
| Plan reviews around your learning objectives | 6 | OK — H1 names the job |
| For self-learners using AI or other materials who need recall prompts tied to clear learning objectives. | 15 | OK |
| Start with one outcome you want to demonstrate. | 8 | OK |
| Add a short-answer prompt, then let each answer set the next review date. | 13 | OK |
| Opens three sample objectives and their due prompts. | 8 | OK |
| Works offline after the first visit. | 6 | OK |
| Study content stays on this device. | 6 | OK |
| Core reviews, CSV, and backups are free. | 7 | OK |
| History reports cost $19 once. | 6 | OK |
| See the reason, interval, and date before you review. | 10 | OK |
| Why is it summer in Australia? | 6 | OK |
| New prompt — it has not been reviewed yet. | 8 | OK |
| State an objective. | 3 | OK |
| Name what you want to demonstrate. | 6 | OK |
| Write a recall prompt. | 4 | OK |
| Add the answer you will check. | 6 | OK |
| Review and inspect. | 3 | OK |
| Log your result and see the next date. | 8 | OK |
| Objectives, prompts, reviews, and backup passphrases stay in this browser. | 10 | OK |
| License checks contact Sociobot. | 4 | OK |
| Evidence links open only when you select them. | 8 | OK |
| Core reviews, CSV, and backups stay free. | 7 | OK |
| The one-time archive adds objective recall rates and printable weekly summaries. | 11 | OK |
| Original AI-generated field-guide artwork. | 4 | OK — provenance is in .factory/design.md |

The labels and headings Review, Objective map, Data & access, Try sample data, Create objective, Sample review queue, How it works, What stays on this device, and Study archive — $19 once identify a destination or section. The actions Try it with sample data, Create your first objective, Review this prompt, and See data and access options name their results.

### README

| Sentence | Words | Result |
| --- | ---: | --- |
| Objective Loop is a private review notebook for self-learners. | 10 | OK |
| It works without internet after the first visit. | 8 | OK |
| It keeps hand-written recall prompts tied to learning objectives and explains every due date. | 13 | OK |
| Live product: https://learning-objective-loop.sociobot.in | 3 | OK |
| Try the isolated sample notebook: https://learning-objective-loop.sociobot.in/demo. | 6 | OK |
| Use Reset demo to restore the sample. | 7 | OK |
| Use Open my notebook to discard demo changes and return to your notebook. | 13 | OK |
| Older ?demo=1#/today links redirect to /demo. | 6 | OK |
| Builds nested learning objectives with evidence links. | 7 | OK |
| Attaches hand-written short-answer prompts to each objective. | 7 | OK |
| Logs correctness and 1–5 confidence after the expected answer is revealed. | 11 | OK |
| Schedules the disclosed 1, 3, 7, 14, 30, 60, and 120-day steps. | 12 | OK |
| Allows visible manual review-date overrides. | 5 | OK |
| Uses IndexedDB for study records, with localStorage as a fallback. | 10 | OK |
| Exports password-protected .loop backups and readable CSV. | 8 | OK |
| Keeps reviews, CSV export, and encrypted backup export free before and after a one-time $19 Sociobot Study archive purchase. | 20 | F-3-1 |
| You write each prompt. | 5 | OK |
| Objective Loop does not import course content or choose dates with a hidden model. | 14 | OK |
| Requires Node.js 20 or newer. | 5 | OK |
| Open the URL printed by Vite. | 6 | OK |
| No environment variables are needed for the core app. | 9 | OK |
| To test license checks against Sociobot’s test server, set VITE_BILLING_API_BASE=https://pilot-api.sociobot.in/api/v1 before building. | 12 | OK |
| The production build command is npm run build; deploy dist/. | 9 | OK |
| Playwright 1.58.2 is pinned for browser tests. | 7 | OK |
| Claims and their exact commands are listed in .factory/claims.json. | 9 | OK |
| Study content stays on this device. | 6 | OK |
| The core app has no analytics, ads, third-party fonts, or third-party JavaScript. | 12 | OK |
| License purchase and verification contact Sociobot. | 6 | OK |
| Evidence links open their site only when you select them. | 9 | OK |
| See /privacy and /terms in the app. | 6 | OK |
| See .factory/brief.json for scope and .factory/design.md for the visual system and image sources. | 11 | OK |
| See .factory/demo.md for demo isolation. | 6 | OK |
| See .factory/handoff.md for release checks. | 6 | OK |
| MIT © 2026 Sociobot (Param Factory). | 6 | OK |

README headings What it does, Run locally, Test and build, Data and privacy, and License name their sections. Apart from the registered F-3-1 claim, all landing and README functional, privacy, offline, pricing, storage, export, and scheduling statements have a claims entry and tagged test. No additional unlisted functional claim was found.

## Demo and privacy sandbox

The one-click /demo path immediately shows three active objectives, realistic prompts, due controls, and an upcoming reviewed prompt. Its persistent banner reads “Demo — sample data, nothing is saved to your notebook,” with Reset demo and Open my notebook.

In a fresh live context, I created a real “Private control objective,” entered demo, added a demo-only objective, reset demo, and opened the real notebook. Reset removed the demo-only record; the real record remained. Demo landing requests were product-origin only. The published offline-reload test passed from a fresh demo context. This gate passes.

## Claims and quality gates

I cloned the reviewed checkout to a new temporary directory, ran npm ci, then invoked every exact .factory/claims.json command.

| Claim IDs | Result |
| --- | --- |
| objective-review-workflow, explained-scheduling, manual-override, csv-export, encrypted-backup, offline-reload, private-core, demo-sandbox | PASS |
| one-time-price | FAIL once as F-3-1; PASS on immediate exact retry |
| verified-license, manual-input-only, nested-objectives-evidence, study-storage, no-tracking-or-third-party-runtime, sociobot-network-boundary, encrypted-restore, passphrase-local-only | PASS |

The clean clone also passed npm test (8 tests), npm run build (dist produced), and npm run test:e2e (33 tests). Those passes do not clear F-3-1 because the required individual claim command failed once.

## Structure, accessibility, and identity

The deployed root, review queue, demo, objective map, new-objective, data, privacy, terms, static 404, robots, and sitemap routes return 200. A missing route returns the designed HTTP 404. The live root has a plain route title, description, canonical, Open Graph/Twitter metadata, favicon, lang, one H1, and main landmark. The static 404 has its own Page not found — Objective Loop title, description, canonical, return link, and Privacy/Terms footer.

npm run build followed by npm run verify:live passed with 19 matching deployed artifacts. npm run test:live passed 30/30. These checks cover titles, deep links, back-button focus, route announcements, header/footer consistency, keyboard use, target sizes, reduced motion, and axe serious/critical checks. Fresh mobile and desktop landing request logs contained only the product origin and no console errors.

The warm paper, cobalt/vermilion print marks, registration-dot background, condensed labels, serif reading copy, and explanatory objective-map art form a distinct field-guide system that follows .factory/design.md. It is not a generic SaaS template.

No further AI feature is expected. The brief explicitly requires manually written prompts and an inspectable schedule. CSV and encrypted-backup export exist, while cloud sync would conflict with the stated local-first model.

## Earlier finding closure check

Each prior finding was rechecked in source/tests and live UI.

| Earlier ID(s) | Result |
| --- | --- |
| F-1-1 | Fixed: exact saved date, interval, grade, and reload assertions are present. |
| F-1-2 | Fixed: real-before-demo survival is asserted and confirmed live. |
| F-1-3 | Archive outputs are present; F-3-1 requires returned-license stability. |
| F-1-4 | Fixed: full core workflow request recording is present. |
| F-1-5 | Fixed: privacy copy names local storage and exceptions. |
| F-1-6 | Fixed: manual-only input and visible calculations are tested. |
| F-1-7 | Fixed: nesting/evidence persistence test passed. |
| F-1-8 | Fixed: correctness and confidence survive reload. |
| F-1-9 | Fixed: IndexedDB/fallback wording and test are present. |
| F-1-10 | Fixed: no-third-party-runtime test passed. |
| F-1-11 | Fixed: billing boundary test passed. |
| F-1-12 | Fixed: restore confirmation, cancel, and wrong-passphrase checks passed. |
| F-1-13 | Fixed: passphrase local-only test passed. |
| F-1-14 | Fixed: preview, How it works, privacy, and paid sections appear on landing. |
| F-1-15 | Fixed: routes have specific titles. |
| F-1-16 | Fixed: static 404 metadata is present. |
| F-1-17 | Fixed: static 404 has Privacy and Terms. |
| F-1-18 | Fixed: evidence and checkout controls identify external destinations. |
| F-1-19 | Fixed: demo action hint is above both first-screen bounds. |
| F-1-20 | Fixed: learning-objectives terminology is used. |
| F-1-21 | Fixed: local-data status links to exceptions. |
| F-1-22 | Fixed: decorative landing kicker is absent. |
| F-1-23 | Fixed: action is Create objective. |
| F-1-24 | Fixed: paid output is named beside price. |
| F-1-25 | Fixed: README says offline behavior plainly. |
| F-1-26 | Fixed: backup copy leads with the user result. |
| F-1-27 | Fixed: test-server setup is named. |
| F-1-28 | Fixed: documentation references are short separate sentences. |
| F-1-29 | Fixed: demo exit names its destination and disposal. |
| F-1-30 | Fixed: review control names its result. |
| F-1-31 | Fixed: purchase control names the archive and price. |
| F-1-32 | Fixed: route says Due reviews. |
| F-1-33 | Fixed: detail section says Evidence links. |
| F-1-34 | Fixed: creation route says New objective. |
| F-1-35 | Fixed: Data & access H1 names its actions. |
| F-1-36 | Fixed: objective-map H1 is direct in both states. |
| F-2-1 | Durability regression coverage is present and the full 33-test run passed. |
| F-2-2 | Full free-tier wording is registered; F-3-1 records its remaining stability issue. |
| F-2-3 | Fixed: empty map has the direct section H1. |
| F-2-4 | Fixed: static and in-app missing states say Page not found. |

## What would make this perfect

Make the returned-license flow stable under repeated fresh-context claim runs and keep the exact one-time-price command green every time. Then repeat the entire cold-read, demo, claims, privacy, routing, accessibility, and copy check from a clean clone. A PASS requires zero findings and no intermittent or untested claim.

