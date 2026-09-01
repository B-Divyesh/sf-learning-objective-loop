# Adversarial first-read review 4 — Objective Loop

**Verdict: FAIL**

Reviewed on 2026-09-01 UTC against
<https://learning-objective-loop.sociobot.in>. Product source was not modified.
Fresh Chromium contexts used 390 × 844 and 1440 × 900 viewports. Claim checks
ran from a fresh local clone at `3d81124`.

## Cold first read

Before scrolling, I could answer all required questions at both sizes.

- **What it does:** It plans recall reviews around learning objectives and shows when to review next.
- **For whom:** Self-learners using AI or other learning materials.
- **What to click first:** **Try it with sample data**.

The exact supporting text is “Plan reviews around your learning objectives,”
“For self-learners using AI or other materials who need recall prompts tied to
clear learning objectives,” and “Opens three sample objectives and their due
prompts.” The action hint ends at y=542 on mobile and y=702 on desktop, within
both initial viewports. This check passes.

## Findings

### Major

#### F-4-1 — The empty Review route presents the landing page under a different route title

- **Location:** Direct fresh visit to `/today`; `src/main.ts:361–364`.
- **Observed:** The document title is “Review queue — Objective Loop,” but the only H1 is “Plan reviews around your learning objectives.” The rendered view is the landing/onboarding content, not a review-queue empty state.
- **Why this matters:** A person following the **Review** navigation item, a saved `/today` link, or a browser Back action receives a page whose route title says “Review queue” while its heading describes a different task. This makes the page purpose less clear and does not confirm that the empty review queue is working as a real route.
- **Concrete fix:** Choose one page purpose for the no-records state. Either render a Review queue empty state with `<h1>Review queue</h1>` and a direct “Create objective” action, or keep the landing/onboarding view and set its `/today` title and description to the landing wording. Add a fresh-context deep-link test that checks the title, H1, and primary action agree.

## Copy audit

Word counts use whitespace-delimited words. A URL, hyphenated term, `$19`, and
code token each count as one word. The sentence audit found no length issue,
jargon, marketing adjective, terminology conflict, context-free heading,
metaphor heading, or non-result-naming primary action. F-4-1 is structural,
not a landing-copy finding.

### Landing page sentences

| Sentence | Words | Check |
| --- | ---: | --- |
| Study data stays on this device. | 6 | Listed privacy boundary. |
| See Privacy for license and link exceptions. | 8 | Useful route guidance. |
| Plan reviews around your learning objectives | 6 | Concrete H1. |
| For self-learners using AI or other materials who need recall prompts tied to clear learning objectives. | 15 | Audience and situation. |
| Start with one outcome you want to demonstrate. | 8 | Usable first step. |
| Add a short-answer prompt, then let each answer set the next review date. | 13 | Product outcome. |
| Opens three sample objectives and their due prompts. | 8 | Demo result. |
| Works offline after the first visit. | 6 | Listed claim. |
| Study content stays on this device. | 6 | Listed privacy boundary. |
| Core reviews, CSV, and backups are free. | 7 | Listed price claim. |
| History reports cost $19 once. | 6 | Listed price claim. |
| See the reason, interval, and date before you review. | 10 | Useful preview instruction. |
| Why is it summer in Australia? | 6 | Realistic sample question. |
| New prompt — it has not been reviewed yet. | 8 | Plain sample status. |
| State an objective. | 3 | Usable step. |
| Name what you want to demonstrate. | 6 | Usable instruction. |
| Write a recall prompt. | 4 | Usable step. |
| Add the answer you will check. | 6 | Usable instruction. |
| Review and inspect. | 3 | Usable step. |
| Log your result and see the next date. | 8 | Usable outcome. |
| Objectives, prompts, reviews, and backup passphrases stay in this browser. | 10 | Listed privacy and passphrase claims. |
| License checks contact Sociobot. | 4 | Listed network-boundary claim. |
| Evidence links open only when you select them. | 8 | Useful privacy boundary. |
| Core reviews, CSV, and backups stay free. | 7 | Listed price claim. |
| The one-time archive adds objective recall rates and printable weekly summaries. | 11 | Listed license claim. |
| Original AI-generated field-guide artwork. | 4 | Provenance disclosure; source is in `.factory/design.md`. |

The headings **Sample review queue**, **How it works**, **What stays on this
device**, and **Study archive — $19 once** name their sections. The actions
**Try it with sample data**, **Create your first objective**, and **Review this
prompt** name their results. The navigation labels name destinations.

### README sentences

| Sentence | Words | Check |
| --- | ---: | --- |
| Objective Loop is a private review notebook for self-learners. | 10 | Plain product description. |
| It works without internet after the first visit. | 8 | Listed claim. |
| It keeps hand-written recall prompts tied to learning objectives and explains every due date. | 13 | Listed workflow claim. |
| Live product: https://learning-objective-loop.sociobot.in | 3 | Useful destination. |
| Try the isolated sample notebook: https://learning-objective-loop.sociobot.in/demo or https://learning-objective-loop.sociobot.in/?demo=1. | 8 | Demo entry points. |
| Use Reset demo to restore the sample. | 7 | Reset instruction. |
| Use Open my notebook to discard demo changes and return to your notebook. | 13 | Exit instruction. |
| Older `?demo=1#/today` links redirect to `/demo`. | 6 | Documented compatibility behavior. |
| Builds nested learning objectives with evidence links. | 7 | Listed claim. |
| Attaches hand-written short-answer prompts to each objective. | 7 | Listed workflow claim. |
| Logs correctness and 1–5 confidence after the expected answer is revealed. | 11 | Listed workflow claim. |
| Schedules the disclosed 1, 3, 7, 14, 30, 60, and 120-day steps. | 12 | Listed claim. |
| Allows visible manual review-date overrides. | 5 | Listed claim. |
| Uses IndexedDB for study records, with localStorage as a fallback. | 10 | Listed claim. |
| Exports password-protected `.loop` backups and readable CSV. | 8 | Listed export claims. |
| Keeps reviews, CSV export, and encrypted backup export free before and after a one-time $19 Sociobot Study archive purchase. | 20 | Listed price claim. |
| You write each prompt. | 5 | Listed manual-input claim. |
| Objective Loop does not import course content or choose dates with a hidden model. | 14 | Listed manual-input claim. |
| Requires Node.js 20 or newer. | 5 | Setup requirement. |
| Open the URL printed by Vite. | 6 | Run instruction. |
| No environment variables are needed for the core app. | 9 | Run instruction. |
| To test license checks against Sociobot’s test server, set `VITE_BILLING_API_BASE=https://pilot-api.sociobot.in/api/v1` before building. | 12 | Optional test instruction. |
| The production build command is `npm run build`; deploy `dist/`. | 10 | Deployment instruction. |
| Playwright 1.58.2 is pinned for browser tests. | 7 | Package configuration. |
| Claims and their exact commands are listed in `.factory/claims.json`. | 9 | Documentation reference. |
| Study content stays on this device. | 6 | Listed privacy boundary. |
| The core app has no analytics, ads, third-party fonts, or third-party JavaScript. | 12 | Listed runtime claim. |
| License purchase and verification contact Sociobot. | 6 | Listed network-boundary claim. |
| Evidence links open their site only when you select them. | 9 | Useful privacy boundary. |
| See `/privacy` and `/terms` in the app. | 7 | Route guidance. |
| See `.factory/brief.json` for scope and `.factory/design.md` for the visual system and image sources. | 11 | Documentation reference. |
| See `.factory/demo.md` for demo isolation. | 6 | Documentation reference. |
| See `.factory/handoff.md` for release checks. | 6 | Documentation reference. |
| MIT © 2026 Sociobot (Param Factory). | 6 | License statement. |

The README headings **What it does**, **Run locally**, **Test and build**,
**Data and privacy**, and **License** name their sections. All functional,
privacy, offline, storage, export, price, and scheduling statements in the
landing page and README have a matching claims entry. No new unlisted product
claim was found.

## Demo and sandbox checks

I confirmed and checked that **Try it with sample data** opens `/demo` in one
click. After loading, its first usable screen shows three active objectives,
three recall prompts, two due prompts, one reviewed upcoming prompt, and
realistic seasons, cell-division, and escape-velocity content. The persistent
banner reads “Demo — sample data, nothing is saved to your notebook,” and
provides **Reset demo** and **Open my notebook**.

I confirmed and checked that the fresh-context demo claim creates a real
objective before entering demo, changes and resets demo data, leaves demo, and
verifies that the real objective remains. It also checks direct `/demo` entry
and reset. The documented demo namespace is `objective-loop-demo` with
`demo:objective-loop:state` fallback; real mode uses a separate namespace.
Manual live-demo request logs contained only the product origin.

## Claims and quality gates

I created a fresh clone at `3d81124`, ran `npm ci`, then ran every exact
command in `.factory/claims.json` serially. All 17 passed.

| Claim check | Result |
| --- | --- |
| objective-review-workflow | PASS |
| explained-scheduling | PASS |
| manual-override | PASS |
| csv-export | PASS |
| encrypted-backup | PASS |
| offline-reload | PASS |
| private-core | PASS |
| demo-sandbox | PASS |
| one-time-price | PASS |
| verified-license | PASS |
| manual-input-only | PASS |
| nested-objectives-evidence | PASS |
| study-storage | PASS |
| no-tracking-or-third-party-runtime | PASS |
| sociobot-network-boundary | PASS |
| encrypted-restore | PASS |
| passphrase-local-only | PASS |

I confirmed and checked that the fresh clone passes `npm test` (8/8),
`npm run build` (producing `dist/`), and `npm run test:e2e` (34/34). A separate
serial `npm run test:live` run passed 31/31. `npm run verify:live` confirmed
that all 19 deployed artifacts byte-match the current build; live `index.html`
SHA-256 is `2bb26823565d4e2b732d139244de5a074749f775ab6a02c0556d2d2ddeb822ee`.

## Structure, accessibility, links, and identity

I confirmed and checked that the root, demo, objectives, new-objective, data,
privacy, terms, static 404, and missing-route views have one H1, one main
landmark, a route title, description, canonical URL, header, footer, and
Privacy/Terms links. The static and missing-route pages return the designed
HTTP 404 view. The root also provides OG/Twitter data, a product-derived social
image, favicon, `lang="en"`, and theme color.

I confirmed and checked that internal links collected from the real and demo
routes return HTTP 200. Checkout and mail links use explicit external
destinations and were not opened during this product-only review. The full live
browser suite confirms deep links, Back navigation, focus movement to the new
H1, route announcements, keyboard operation, 44 px mobile targets,
reduced-motion behavior, console cleanliness, and axe serious/critical checks.

I confirmed and checked that first-load landing requests at both viewports use
only the product origin. The paper stock palette, cobalt/vermilion print marks,
registration details, serif study copy, condensed labels, and field-guide
illustration match `.factory/design.md` and form a distinct product identity.

## Earlier finding closure check

I read every prior review, polish record, and handoff. Each earlier finding was
checked in the current source and live product.

| Earlier finding | Current check |
| --- | --- |
| F-1-1 | Fixed: saved date, interval, grade, and reload are asserted. |
| F-1-2 | Fixed: real-before-demo data survival is asserted. |
| F-1-3 | Fixed: recall-rate and printable-summary outputs are asserted. |
| F-1-4 | Fixed: the full core workflow records request origins. |
| F-1-5 | Fixed: privacy copy names storage and exceptions. |
| F-1-6 | Fixed: manual input and visible calculations are asserted. |
| F-1-7 | Fixed: nesting and evidence persistence are asserted. |
| F-1-8 | Fixed: correctness and confidence persist after reload. |
| F-1-9 | Fixed: IndexedDB and fallback wording and checks are present. |
| F-1-10 | Fixed: the no-third-party-runtime check passes. |
| F-1-11 | Fixed: the billing network-boundary check passes. |
| F-1-12 | Fixed: restore confirmation, cancel, and wrong-passphrase checks pass. |
| F-1-13 | Fixed: passphrase local-only checks pass. |
| F-1-14 | Fixed: preview, How it works, privacy, and price sections are present. |
| F-1-15 | Fixed for populated routes; F-4-1 records the remaining empty `/today` inconsistency. |
| F-1-16 | Fixed: static 404 metadata is present. |
| F-1-17 | Fixed: static 404 includes Privacy and Terms. |
| F-1-18 | Fixed: evidence and checkout controls identify external destinations. |
| F-1-19 | Fixed: the demo action hint fits both first viewports. |
| F-1-20 | Fixed: learning-objective terminology is consistent. |
| F-1-21 | Fixed: the local-data status links to exceptions. |
| F-1-22 | Fixed: the decorative landing kicker is absent. |
| F-1-23 | Fixed: the action says Create objective. |
| F-1-24 | Fixed: paid output is named beside its price. |
| F-1-25 | Fixed: README describes offline behavior plainly. |
| F-1-26 | Fixed: backup copy leads with the user result. |
| F-1-27 | Fixed: the test-server setup is named. |
| F-1-28 | Fixed: documentation references are short sentences. |
| F-1-29 | Fixed: demo exit names its destination and disposal. |
| F-1-30 | Fixed: review controls name their result. |
| F-1-31 | Fixed: the purchase control names the archive and price. |
| F-1-32 | Fixed: route says Due reviews. |
| F-1-33 | Fixed: detail section says Evidence links. |
| F-1-34 | Fixed: creation route says New objective. |
| F-1-35 | Fixed: Data H1 names its actions. |
| F-1-36 | Fixed: objective-map H1 is direct in both states. |
| F-2-1 | Fixed: durability regression coverage and full suite pass. |
| F-2-2 | Fixed: the full free-tier wording is registered and tested. |
| F-2-3 | Fixed: empty objective map uses a direct H1. |
| F-2-4 | Fixed: static and in-app missing states say Page not found. |
| F-3-1 | Fixed: serial fresh-clone `one-time-price` passes. |

## Missed leverage

I confirmed and checked that no additional AI feature is required by the brief.
The brief calls for manually written prompts and an inspectable schedule; AI
drafting would add an unnecessary network and key-management path. CSV and a
password-protected backup already provide export and restore. Cloud sync is not
implied by this local-first product.

## What would make this perfect

Resolve F-4-1 by making the fresh `/today` route’s title, H1, and displayed
empty state describe the same destination. Add the stated direct-route test,
then repeat the fresh-clone claim run, full browser suite, and mobile/desktop
cold read. A PASS requires that check to leave zero findings.
