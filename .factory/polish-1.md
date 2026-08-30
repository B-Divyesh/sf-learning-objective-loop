# Polish 1 — finding closure map

Candidate repaired from `108ee3f8150d201eb0ff8e1c187940160677eb50`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Froze the review clock and asserted the exact saved 3-day date, calculation, and grade after reload. | `@claim:objective-review-workflow` |
| F-1-2 | Claim test now creates a persisted real objective before demo mutation, reset, and exit. | `@claim:demo-sandbox` |
| F-1-3 | Archive now shows per-objective recall rates; test seeds history and asserts rate plus print action. | `@claim:verified-license` |
| F-1-4 | Privacy test runs objective, evidence, prompt, manual date, review, CSV, and encrypted backup flow. | `@claim:private-core` |
| F-1-5 | Replaced absolute privacy copy with the local-data boundary and named license/evidence exceptions. | `@claim:private-core`, `@claim:sociobot-network-boundary` |
| F-1-6 | Registered and tested manual prompt input, no course import, and visible calculations. | `@claim:manual-input-only` |
| F-1-7 | Registered and tested parent/child objective plus evidence persistence. | `@claim:nested-objectives-evidence` |
| F-1-8 | Workflow test now asserts saved correctness and confidence after reload. | `@claim:objective-review-workflow` |
| F-1-9 | Corrected IndexedDB/fallback wording and asserted real IndexedDB plus demo namespace. | `@claim:study-storage` |
| F-1-10 | Registered and tested no third-party scripts, fonts, analytics, or ads in demo flow. | `@claim:no-tracking-or-third-party-runtime` |
| F-1-11 | Registered the Sociobot billing boundary and asserted controlled verification plus checkout endpoint. | `@claim:sociobot-network-boundary` |
| F-1-12 | Registered restore behavior and tested wrong passphrase, cancel, confirmation, and exact replacement. | `@claim:encrypted-restore` |
| F-1-13 | Rewrote passphrase wording and tested no passphrase request or localStorage persistence. | `@claim:passphrase-local-only` |
| F-1-14 | Added sample queue, How it works, local-data boundary, and paid-output sections below the first screen. | landing screenshot in final verification; accessibility test |
| F-1-15 | Added Review queue and content-derived objective titles with route assertions. | route/title test |
| F-1-16 | Added 404 description and canonical metadata. | static 404 test |
| F-1-17 | Added 404 navigation, Privacy, Terms, Param Factory attribution, and build id. | static 404 test |
| F-1-18 | Added screen-reader external-destination text to evidence and checkout links. | `@claim:nested-objectives-evidence`, checkout test |
| F-1-19 | Kept the demo-result hint inside a 1440×900 first viewport and asserted its bounding box. | first-screen test |
| F-1-20 | Replaced “goals” with “learning objectives.” | `.factory/copy-audit.md` |
| F-1-21 | Replaced vague header status and expanded its privacy boundary. | first-screen and privacy checks |
| F-1-22 | Removed the decorative landing kicker. | `.factory/copy-audit.md` |
| F-1-23 | Changed the navigation action to “Create objective.” | navigation tests |
| F-1-24 | Defined what the paid output provides before naming its price. | landing and archive tests |
| F-1-25 | Rewrote README offline wording in plain language. | `.factory/copy-audit.md` |
| F-1-26 | Led backup copy with password protection and placed technical details second. | Data page test |
| F-1-27 | Defined the Sociobot test-server setting in README. | README review |
| F-1-28 | Split the documentation reference sentence. | `.factory/copy-audit.md` |
| F-1-29 | Replaced “Start for real” with “Open my notebook” and named disposal of demo changes. | `@claim:demo-sandbox` |
| F-1-30 | Changed review controls to “Review this prompt.” | workflow tests |
| F-1-31 | Changed purchase control to “Buy Study archive · $19” with external-checkout context. | `@claim:one-time-price` |
| F-1-32 | Changed “Review desk” to “Due reviews.” | review route test |
| F-1-33 | Changed “Evidence shelf” to “Evidence links.” | objective detail test |
| F-1-34 | Changed “New field note” to “New objective.” | route test |
| F-1-35 | Changed the Data H1 to “Export, restore, or unlock reports.” | route/focus test |
| F-1-36 | Changed populated map H1 to “Your learning objectives.” | map test |

The final handoff records the clean-clone claim run, local browser checks, and live URL recheck.
