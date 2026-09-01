# Adversarial first-read review 5 — Objective Loop

**Verdict: PASS**

Reviewed on 2026-09-01 UTC against
<https://learning-objective-loop.sociobot.in>. Product source was not modified.
Fresh Chromium contexts used 390 × 844 and 1440 × 900 viewports. The review
found zero findings and zero untested claims.

## Cold first read

Before scrolling, I could answer all three questions at both viewport sizes.

- **What does this do?** It plans recall reviews around learning objectives
  and shows when to review next.
- **For whom?** Self-learners using AI or other learning materials.
- **What should I click first?** **Try it with sample data**.

The exact supporting text is “Plan reviews around your learning objectives,”
“For self-learners using AI or other materials who need recall prompts tied to
clear learning objectives,” and “Opens three sample objectives and their due
prompts.” The action, result explanation, three product facts, and price are
visible before scrolling at both sizes. The result explanation ends at y=542
on mobile and y=702 on desktop.

## Findings

None. There are no blocking, major, or minor findings.

## Copy audit

Counts use whitespace-delimited words and ignore punctuation-only separators.
Hyphenated terms, URLs, code tokens, and `$19` each count as one word. Every
sentence is at or below 22 words. No
jargon, banned marketing adjective, inconsistent term, context-free heading,
metaphor heading, slogan, or unclear action label remains.

### Landing page sentences

| Sentence | Words | Check |
| --- | ---: | --- |
| Study data stays on this device. | 6 | Confirmed; registered privacy boundary. |
| See Privacy for license and link exceptions. | 7 | Confirmed; useful route guidance. |
| Plan reviews around your learning objectives | 6 | Confirmed; H1 names the job. |
| For self-learners using AI or other materials who need recall prompts tied to clear learning objectives. | 16 | Confirmed; audience and situation are clear. |
| Start with one outcome you want to demonstrate. | 8 | Confirmed; usable first step. |
| Add a short-answer prompt, then let each answer set the next review date. | 13 | Confirmed; registered workflow outcome. |
| Opens three sample objectives and their due prompts. | 8 | Confirmed; registered demo result. |
| Works offline after the first visit. | 6 | Confirmed; registered offline claim. |
| Study content stays on this device. | 6 | Confirmed; registered privacy boundary. |
| Core reviews, CSV, and backups are free. | 7 | Confirmed; registered price claim. |
| History reports cost $19 once. | 5 | Confirmed; registered price claim. |
| See the reason, interval, and date before you review. | 9 | Confirmed; useful preview instruction. |
| Why is it summer in Australia? | 6 | Confirmed; realistic sample question. |
| New prompt — it has not been reviewed yet. | 8 | Confirmed; plain sample status. |
| State an objective. | 3 | Confirmed; usable step. |
| Name what you want to demonstrate. | 6 | Confirmed; usable instruction. |
| Write a recall prompt. | 4 | Confirmed; usable step. |
| Add the answer you will check. | 6 | Confirmed; usable instruction. |
| Review and inspect. | 3 | Confirmed; usable step. |
| Log your result and see the next date. | 8 | Confirmed; usable outcome. |
| Objectives, prompts, reviews, and backup passphrases stay in this browser. | 10 | Confirmed; registered privacy and passphrase claims. |
| License checks contact Sociobot. | 4 | Confirmed; registered network-boundary claim. |
| Evidence links open only when you select them. | 8 | Confirmed by the full local request check and link behavior. |
| Core reviews, CSV, and backups stay free. | 7 | Confirmed; registered price claim. |
| The one-time archive adds objective recall rates and printable weekly summaries. | 11 | Confirmed; registered license claim. |
| Original AI-generated field-guide artwork. | 4 | Confirmed; provenance is recorded in `.factory/design.md`. |

### Landing headings, labels, and actions

| Text | Words | Check |
| --- | ---: | --- |
| Objective Loop | 2 | Confirmed; product name. |
| Study data stays here | 4 | Confirmed; short status label explained nearby. |
| Switch color theme | 3 | Confirmed; result-naming accessible button name. |
| Review | 1 | Confirmed; navigation destination. |
| Objective map | 2 | Confirmed; navigation destination. |
| Data & access | 2 | Confirmed; navigation destination. |
| Try sample data | 3 | Confirmed; result-naming action. |
| Create objective | 2 | Confirmed; result-naming action. |
| Try it with sample data | 5 | Confirmed; result-naming primary action. |
| Create your first objective | 4 | Confirmed; result-naming action. |
| State an objective | 3 | Confirmed; process label. |
| Write a recall prompt | 4 | Confirmed; process label. |
| Review with evidence | 3 | Confirmed; process label. |
| Sample review queue | 3 | Confirmed; section heading. |
| Due | 1 | Confirmed; sample status. |
| Review this prompt | 3 | Confirmed; result-naming action. |
| How it works | 3 | Confirmed; section heading. |
| What stays on this device | 5 | Confirmed; section heading. |
| Study archive — $19 once | 4 | Confirmed; section heading with exact price. |
| See data and access options | 5 | Confirmed; destination-naming action. |
| Privacy | 1 | Confirmed; destination. |
| Terms | 1 | Confirmed; destination. |
| Built by Param Factory | 4 | Confirmed; attribution. |
| build 1.0.6-polish-4 | 2 | Confirmed; build identifier. |

### README sentences

| Sentence | Words | Check |
| --- | ---: | --- |
| Objective Loop is a private review notebook for self-learners. | 9 | Confirmed; plain product description. |
| It works without internet after the first visit. | 8 | Confirmed; registered offline claim. |
| It keeps hand-written recall prompts tied to learning objectives and explains every due date. | 14 | Confirmed; registered workflow claim. |
| Live product: https://learning-objective-loop.sociobot.in | 3 | Confirmed; useful destination. |
| Try the isolated sample notebook: https://learning-objective-loop.sociobot.in/demo or https://learning-objective-loop.sociobot.in/?demo=1. | 8 | Confirmed; demo entry points. |
| Use Reset demo to restore the sample. | 7 | Confirmed; reset instruction. |
| Use Open my notebook to discard demo changes and return to your notebook. | 13 | Confirmed; exit instruction. |
| Older `?demo=1#/today` links redirect to `/demo`. | 6 | Confirmed; compatibility behavior. |
| Builds nested learning objectives with evidence links. | 7 | Confirmed; registered claim. |
| Attaches hand-written short-answer prompts to each objective. | 7 | Confirmed; registered workflow claim. |
| Logs correctness and 1–5 confidence after the expected answer is revealed. | 11 | Confirmed; registered workflow claim. |
| Schedules the disclosed 1, 3, 7, 14, 30, 60, and 120-day steps. | 12 | Confirmed; registered scheduling claim. |
| Allows visible manual review-date overrides. | 5 | Confirmed; registered claim. |
| Uses IndexedDB for study records, with localStorage as a fallback. | 10 | Confirmed; registered storage claim. |
| Exports password-protected `.loop` backups and readable CSV. | 7 | Confirmed; registered export claims. |
| Keeps reviews, CSV export, and encrypted backup export free before and after a one-time $19 Sociobot Study archive purchase. | 19 | Confirmed; registered price claim. |
| You write each prompt. | 4 | Confirmed; registered manual-input claim. |
| Objective Loop does not import course content or choose dates with a hidden model. | 14 | Confirmed; registered manual-input claim. |
| Requires Node.js 20 or newer. | 5 | Confirmed; setup requirement. |
| Open the URL printed by Vite. | 6 | Confirmed; run instruction. |
| No environment variables are needed for the core app. | 9 | Confirmed; run instruction. |
| To test license checks against Sociobot’s test server, set `VITE_BILLING_API_BASE=https://pilot-api.sociobot.in/api/v1` before building. | 12 | Confirmed; optional test instruction. |
| The production build command is `npm run build`; deploy `dist/`. | 10 | Confirmed; deployment instruction. |
| Playwright 1.58.2 is pinned for browser tests. | 7 | Confirmed; package configuration. |
| Claims and their exact commands are listed in `.factory/claims.json`. | 9 | Confirmed; documentation reference. |
| Study content stays on this device. | 6 | Confirmed; registered privacy boundary. |
| The core app has no analytics, ads, third-party fonts, or third-party JavaScript. | 12 | Confirmed; registered runtime claim. |
| License purchase and verification contact Sociobot. | 6 | Confirmed; registered network-boundary claim. |
| Evidence links open their site only when you select them. | 10 | Confirmed by the full local request check and link behavior. |
| See `/privacy` and `/terms` in the app. | 7 | Confirmed; route guidance. |
| See `.factory/brief.json` for scope and `.factory/design.md` for the visual system and image sources. | 13 | Confirmed; documentation reference. |
| See `.factory/demo.md` for demo isolation. | 5 | Confirmed; documentation reference. |
| See `.factory/handoff.md` for release checks. | 5 | Confirmed; documentation reference. |
| MIT © 2026 Sociobot (Param Factory). | 5 | Confirmed; license statement. |

### README headings

| Heading | Words | Check |
| --- | ---: | --- |
| Objective Loop | 2 | Confirmed; product name. |
| What it does | 3 | Confirmed; section name. |
| Run locally | 2 | Confirmed; section name. |
| Test and build | 3 | Confirmed; section name. |
| Data and privacy | 3 | Confirmed; section name. |
| License | 1 | Confirmed; section name. |

Terminology is consistent: **learning objective** is the outcome, **prompt** is
the question, **review** is an attempt, **evidence link** is a source, **review
queue** holds due prompts, **manual date** is an override, **demo** is the
isolated sample, and **Study archive** is the paid report feature.

## Demo and sandbox

I confirmed and checked that **Try it with sample data** opens `/demo` in one
click. Its first usable screen shows three active objectives, three recall
prompts, two due prompts, one prior review, and realistic seasons,
cell-division, and escape-velocity content.

The persistent banner says “Demo — sample data, nothing is saved to your
notebook,” with **Reset demo**, **Open my notebook**, and “Discards demo
changes.” Reset restores the original sample. The registered check creates a
real objective first, changes and resets the demo, exits, and confirms the real
objective remains.

The source uses IndexedDB database `objective-loop-demo` and fallback key
`demo:objective-loop:state` for the sample. Real mode uses `objective-loop` and
`objective-loop:state`. The offline check reloads the installed demo after
network access is disabled. Live phone and desktop request logs contain only
the product origin, with no console or page errors.

## Claims and quality gates

I created the fresh clone
`/tmp/objective-loop-review-5.WGD6Hr/clone`, ran `npm ci`, and then ran every
exact command in `.factory/claims.json` serially.

| Claim | Result |
| --- | --- |
| `objective-review-workflow` | PASS |
| `explained-scheduling` | PASS |
| `manual-override` | PASS |
| `csv-export` | PASS |
| `encrypted-backup` | PASS |
| `offline-reload` | PASS |
| `private-core` | PASS |
| `demo-sandbox` | PASS |
| `one-time-price` | PASS |
| `verified-license` | PASS |
| `manual-input-only` | PASS |
| `nested-objectives-evidence` | PASS |
| `study-storage` | PASS |
| `no-tracking-or-third-party-runtime` | PASS |
| `sociobot-network-boundary` | PASS |
| `encrypted-restore` | PASS |
| `passphrase-local-only` | PASS |

All claim-like landing and README sentences have a matching registered claim
or are direct instructions, route guidance, provenance, or setup facts. There
is no unlisted claim and no untested claim.

The same clean clone passed `npm test` (8/8), `npm run build` with `dist/`
produced, and `npm run test:e2e` (35/35). `npm run verify:live` matched all 19
deployed files; the live `index.html` SHA-256 is
`968b3bc94c72d8e905ff3fb8e24a348d47cb43c146727c60bccea0110bae7565`.
`npm run test:live` passed 32/32.

The worker URL check reported a 674 ms browser load, no console errors,
`lang="en"`, one H1, one main landmark, no image missing an `alt` attribute,
and no unnamed button. The Playwright suite includes axe WCAG 2 A/AA checks
with no serious or critical results.

## Structure, links, and visual identity

I confirmed and checked the live `/`, `/today`, `/demo`, `/objectives`,
`/new-objective`, `/data`, `/privacy`, `/terms`, and `/404.html` routes. Each
has a route-specific title and description, one H1, a canonical URL, one main
landmark, header, footer, and Privacy and Terms links. The static 404 returns
200 at `/404.html`; an unknown route returns the same designed page with HTTP
404. Root metadata includes canonical, Open Graph, Twitter card, product
social image, favicon, apple-touch icon, theme color, and English language.

All internal links collected from the root, demo, data, privacy, terms, and
404 views returned 200. The browser suite confirms deep links, Back navigation,
route-change focus, the polite route announcement, keyboard operation, 44 px
mobile targets, reduced-motion behavior, and console cleanliness. The initial
JavaScript bundle is 16.11 KB gzip.

The warm paper, cobalt and vermilion inks, registration marks, serif study
copy, condensed labels, stamped due states, and field-guide illustration match
`.factory/design.md`. The visual system is distinct and does not present as a
generic SaaS template.

## Earlier finding confirmation

I read every earlier review, every `polish-*.md`, and the existing handoff. I
confirmed each prior finding in the live product and in current source or its
registered regression.

| Earlier finding | Current confirmation |
| --- | --- |
| F-1-1 | Fixed: the workflow check asserts the exact date, interval, grade, calculation, and reload state. |
| F-1-2 | Fixed: the demo check starts with real data and confirms it survives demo reset and exit. |
| F-1-3 | Fixed: license checks assert objective recall rates and the printable summary action. |
| F-1-4 | Fixed: the privacy check completes the full study and export workflow while recording requests. |
| F-1-5 | Fixed: live privacy copy names device-local data and the license and evidence-link exceptions. |
| F-1-6 | Fixed: README and the manual-input check confirm user-written prompts and visible scheduling. |
| F-1-7 | Fixed: the nesting check persists a parent, child, and HTTP(S) evidence link through reload. |
| F-1-8 | Fixed: correctness and confidence are asserted after reload. |
| F-1-9 | Fixed: README, storage source, and tests use IndexedDB with a localStorage fallback. |
| F-1-10 | Fixed: the runtime request check confirms no analytics, ads, third-party fonts, or third-party JavaScript. |
| F-1-11 | Fixed: the billing-boundary check isolates purchase and verification requests to Sociobot. |
| F-1-12 | Fixed: restore checks cover confirmation, cancel, wrong passphrase, and exact replacement. |
| F-1-13 | Fixed: passphrase checks confirm browser-only use and no saved passphrase. |
| F-1-14 | Fixed: live landing includes a sample preview, How it works, local-data boundary, and priced archive section. |
| F-1-15 | Fixed: live review and objective-detail routes use specific titles. |
| F-1-16 | Fixed: the live designed 404 has a description and canonical URL. |
| F-1-17 | Fixed: the live 404 footer includes Privacy, Terms, Param Factory, and build information. |
| F-1-18 | Fixed: evidence and checkout controls identify their external destinations. |
| F-1-19 | Fixed: the demo-result hint ends within both initial viewports. |
| F-1-20 | Fixed: live and README copy consistently use learning objectives. |
| F-1-21 | Fixed: the header says study data stays here and links to the stated exceptions. |
| F-1-22 | Fixed: the decorative landing kicker is absent. |
| F-1-23 | Fixed: the live navigation action says Create objective. |
| F-1-24 | Fixed: live copy names the archive outputs beside the $19 price. |
| F-1-25 | Fixed: README describes offline behavior in plain language. |
| F-1-26 | Fixed: README leads with password-protected backup output. |
| F-1-27 | Fixed: README names Sociobot’s test server and exact setting. |
| F-1-28 | Fixed: README uses short, separate documentation references. |
| F-1-29 | Fixed: the live demo exit says Open my notebook and states that changes are discarded. |
| F-1-30 | Fixed: live prompt controls say Review this prompt. |
| F-1-31 | Fixed: the purchase control names Study archive, $19, and the external checkout. |
| F-1-32 | Fixed: the live route label says Due reviews. |
| F-1-33 | Fixed: the live objective detail heading says Evidence links. |
| F-1-34 | Fixed: the live creation route uses New objective. |
| F-1-35 | Fixed: the live Data H1 says Export, restore, or unlock reports. |
| F-1-36 | Fixed: empty and populated maps use Your learning objectives. |
| F-2-1 | Fixed: serialized durable saves and the ten-cycle regression pass in the full suite. |
| F-2-2 | Fixed: the registered price check covers reviews, CSV, and encrypted backups before and after purchase. |
| F-2-3 | Fixed: the empty objective map uses Your learning objectives. |
| F-2-4 | Fixed: static and in-app missing states use Page not found. |
| F-3-1 | Fixed: the exact price claim and three fresh-context returned-license repetitions pass. |
| F-4-1 | Fixed: a fresh live `/today` has title Review queue — Objective Loop, H1 Review queue, a clear empty state, and Create objective. |

No earlier finding is unfixed, partial, or regressed.

## Missed leverage

I confirmed and checked that no additional AI feature is implied. The brief
requires manually written prompts and an inspectable schedule. AI drafting
would introduce an unnecessary network and key path. CSV export and encrypted
backup restore already cover portable data. Cloud sync is not implied by this
local-first product.

## What would make this perfect

Nothing remains within the reviewed scope. No copy, demo, claim, route,
accessibility, privacy, visual-system, or product feature change is recommended.
