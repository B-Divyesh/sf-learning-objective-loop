# Polish 2 — cumulative finding closure map

Repair commit: `609587184846cb662f01a1129135d52c2ea724ab`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept exact frozen-date, interval, grade, reload, and calculation assertions. | `@claim:objective-review-workflow` |
| F-1-2 | Kept separate real/demo stores and real-record survival through demo reset/exit. | `@claim:demo-sandbox` |
| F-1-3 | Kept objective recall-rate and printable-summary assertions after recorded license verification. | `@claim:verified-license` |
| F-1-4 | Kept the full local-study request-recording flow. | `@claim:private-core` |
| F-1-5 | Kept the precise local-data boundary and license/evidence exceptions. | `@claim:private-core`, `@claim:sociobot-network-boundary` |
| F-1-6 | Kept the manual-input/no-hidden-model wording and visible calculation check. | `@claim:manual-input-only` |
| F-1-7 | Kept nested parent/child and HTTP(S) evidence reload coverage. | `@claim:nested-objectives-evidence` |
| F-1-8 | Kept saved correctness and confidence assertions after reload. | `@claim:objective-review-workflow` |
| F-1-9 | Kept accurate IndexedDB/fallback wording and separate demo namespace test. | `@claim:study-storage` |
| F-1-10 | Kept request inspection for analytics, ads, third-party fonts, and JavaScript. | `@claim:no-tracking-or-third-party-runtime` |
| F-1-11 | Kept controlled checkout/verification request-boundary coverage. | `@claim:sociobot-network-boundary` |
| F-1-12 | Kept named confirmation, cancel, wrong-passphrase, and replacement restore coverage. | `@claim:encrypted-restore` |
| F-1-13 | Kept passphrase local-only storage/request assertions. | `@claim:passphrase-local-only` |
| F-1-14 | Kept the live preview, How it works, privacy boundary, and archive section. | landing accessibility and first-screen tests |
| F-1-15 | Kept route-specific Review queue and objective-detail titles. | route/title test |
| F-1-16 | Kept static 404 description and canonical metadata. | static 404 test |
| F-1-17 | Kept 404 Privacy/Terms footer links and build information. | static 404 test |
| F-1-18 | Kept external-site text for evidence and checkout links. | nesting and price claim tests |
| F-1-19 | Kept the demo-result hint within 390px and 1440px first viewports. | first-screen test |
| F-1-20 | Kept `learning objectives` terminology. | `.factory/copy-audit.md` |
| F-1-21 | Kept the bounded local-data status and Privacy link. | first-screen/privacy tests |
| F-1-22 | Kept the removed decorative landing kicker. | `.factory/copy-audit.md` |
| F-1-23 | Kept `Create objective` navigation wording. | navigation tests |
| F-1-24 | Kept archive outputs defined beside the $19 price. | `@claim:verified-license` |
| F-1-25 | Kept plain offline documentation. | `@claim:offline-reload` |
| F-1-26 | Kept password-protected backup wording before technical detail. | Data & access browser test |
| F-1-27 | Kept the documented test billing base setting. | README review |
| F-1-28 | Kept split documentation-reference sentences. | README review |
| F-1-29 | Kept explicit demo discard/return wording. | `@claim:demo-sandbox` |
| F-1-30 | Kept `Review this prompt` controls. | workflow test |
| F-1-31 | Kept the named external checkout control. | `@claim:one-time-price` |
| F-1-32 | Kept `Due reviews` route label. | review-route test |
| F-1-33 | Kept `Evidence links` heading. | objective-detail test |
| F-1-34 | Kept `New objective` route label. | route test |
| F-1-35 | Kept the direct Data & access H1. | route/focus test |
| F-1-36 | Kept the populated map H1. | route test |
| F-2-1 | Saves now wait for IndexedDB transaction completion, serialize snapshots, journal an interrupted save locally per namespace, reconcile the newest record at load, and block competing edits during a save. | ten-cycle create/evidence/prompt/review/immediate-navigation/reload regression, repeated 3×; full browser suite |
| F-2-2 | Rewrote the full free-tier sentence and expanded its registered claim to cover reviews, CSV, and encrypted backups before and after the recorded valid license state. | `@claim:one-time-price` |
| F-2-3 | Uses `Your learning objectives` as the objective-map H1 in both empty and populated states. | route/title test |
| F-2-4 | Uses `Page not found` on static and in-app missing-page states. | static 404 test |

## Verification evidence

- Clean clone: `/tmp/learning-objective-loop-clean.jwNvah` ran `npm ci`, every command listed in `.factory/claims.json`, `npm test`, `npm run build`, and `npm run test:e2e` successfully.
- Local browser suite: 32 Playwright tests passed; the three-run durability stress check ran 30 create/evidence/prompt/review/reload cycles with no lost record.
- Local first load: the test suite includes axe WCAG 2 A/AA scans, 390px checks, offline reload, service-worker update, security/header route checks, and same-origin request assertions.
- Live recheck: `npm run test:live` passed all 29 application tests against `https://learning-objective-loop.sociobot.in`; `npm run verify:live` passed with index SHA-256 `117f3ef022e0f994cf948663870980220aabb1b5daa48505421c4c22e0b480f9` and 19 matched deployed artifacts. The cold desktop/mobile evidence is in `.factory/polish-2-artifacts/cold-desktop.png` and `.factory/polish-2-artifacts/cold-mobile.png`; `verify-url` evidence is under `.factory/polish-2-artifacts/verify-url/`.
