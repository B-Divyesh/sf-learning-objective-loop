# Polish 3 — complete finding closure map

Repair commits: `37fe0bb` (deterministic checkout return) and the final
metadata/evidence commit recorded in the handoff. Live target:
<https://learning-objective-loop.sociobot.in>.

Shared live evidence: `npm run verify:live` matched 19 deployed artifacts;
`npm run test:live` passed all 31 app checks; `verify-url.sh` recorded no
console errors, one H1, a main landmark, language, and image alt text in
`polish-3-artifacts/verify-live/`; cold desktop/mobile screenshots are in that
directory. `live-demo-direct-mobile.png` and `live-checkout-return.png` show
the direct sandbox and returned-license states.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept frozen exact date, interval, calculation, saved correctness, confidence, and reload assertions. | `@claim:objective-review-workflow`; live app suite. |
| F-1-2 | Kept real-before-demo isolation; added direct `/?demo=1` banner/reset coverage. | `@claim:demo-sandbox`; `live-demo-direct-mobile.png`. |
| F-1-3 | Kept recall-rate and printable-summary checks; returned licenses now wait for their own verified result. | `@claim:verified-license`, `@claim:one-time-price`; `live-checkout-return.png`. |
| F-1-4 | Kept full local workflow request recording. | `@claim:private-core`; live app suite. |
| F-1-5 | Kept precise local-study wording and license/evidence exceptions. | `@claim:private-core`, `@claim:sociobot-network-boundary`; live privacy route. |
| F-1-6 | Kept manual-prompt/no-hidden-model wording and visible schedule calculation. | `@claim:manual-input-only`; live app suite. |
| F-1-7 | Kept nested parent/child and HTTP(S) evidence persistence. | `@claim:nested-objectives-evidence`; live app suite. |
| F-1-8 | Kept saved correctness and confidence after reload. | `@claim:objective-review-workflow`; live app suite. |
| F-1-9 | Kept IndexedDB/fallback wording and isolated storage namespaces. | `@claim:study-storage`; live app suite. |
| F-1-10 | Kept complete request inspection for analytics, ads, third-party fonts, and third-party JavaScript. | `@claim:no-tracking-or-third-party-runtime`; live app suite. |
| F-1-11 | Kept controlled checkout and verification request-boundary coverage. | `@claim:sociobot-network-boundary`; live app suite. |
| F-1-12 | Kept named restore confirmation, cancel, wrong-passphrase, and replacement checks. | `@claim:encrypted-restore`; live app suite. |
| F-1-13 | Kept passphrase local-only request and storage checks. | `@claim:passphrase-local-only`; live Privacy route. |
| F-1-14 | Kept landing preview, How it works, local-data boundary, and priced archive section. | first-screen test; `verify-live/screenshot-desktop.png`. |
| F-1-15 | Kept review-queue and content-derived objective route titles. | route/title test; live app suite. |
| F-1-16 | Kept 404 description and canonical metadata. | static-404 test; live `/404.html`. |
| F-1-17 | Kept 404 Privacy/Terms footer and current build id. | static-404 test; live `/404.html`. |
| F-1-18 | Kept external-site context on evidence and checkout controls. | `@claim:nested-objectives-evidence`, `@claim:one-time-price`; live app suite. |
| F-1-19 | Kept demo-result hint inside desktop and mobile first viewports. | first-screen test; `verify-live/screenshot-mobile.png`. |
| F-1-20 | Kept `learning objectives` terminology. | `.factory/copy-audit.md`; live landing. |
| F-1-21 | Kept bounded local-data status and Privacy exception link. | route/privacy checks; live landing. |
| F-1-22 | Kept decorative landing kicker removed. | `.factory/copy-audit.md`; live landing. |
| F-1-23 | Kept the `Create objective` action label. | navigation test; live app suite. |
| F-1-24 | Kept paid outputs named next to the $19 price. | `@claim:verified-license`; live Data & access route. |
| F-1-25 | Kept plain offline wording. | `@claim:offline-reload`; README review. |
| F-1-26 | Kept password-protected backup wording before technical details. | Data & access browser check; live route. |
| F-1-27 | Kept documented billing test-server setting. | README review; clean clone. |
| F-1-28 | Kept short, separate documentation references. | `.factory/copy-audit.md`; README review. |
| F-1-29 | Kept explicit demo disposal and return wording. | `@claim:demo-sandbox`; `live-demo-direct-mobile.png`. |
| F-1-30 | Kept `Review this prompt` controls. | workflow test; live app suite. |
| F-1-31 | Kept named one-time checkout control. | `@claim:one-time-price`; live checkout fixture check. |
| F-1-32 | Kept `Due reviews` route language. | review-route test; live app suite. |
| F-1-33 | Kept `Evidence links` detail heading. | objective-detail test; live app suite. |
| F-1-34 | Kept `New objective` route language. | route test; live app suite. |
| F-1-35 | Kept the direct Data & access H1. | route/focus test; live app suite. |
| F-1-36 | Kept `Your learning objectives` in both objective-map states. | route test; live app suite. |
| F-2-1 | Kept serialized durable IndexedDB saves, fallback journal, and ten immediate navigation/reload cycles. | `commits prompt reviews and evidence before immediate navigation or reload across ten saves`; clean clone. |
| F-2-2 | Kept the full free-tier claim covering reviews, CSV, and encrypted backup before and after a valid license. | `@claim:one-time-price`; clean clone and live suite. |
| F-2-3 | Kept `Your learning objectives` for empty and populated maps. | route/title test; live app suite. |
| F-2-4 | Kept `Page not found` in static and in-app missing states. | static-404 test; live `/404.html`. |
| F-3-1 | Checkout returns now use a distinct checking state, force a fresh verdict for the returned token, bind verdict caches to that token, retain cached offline licenses only for the same token, and offer retry on a network failure. The claim blocks service workers, awaits the controlled return, asserts archive/rate/print, and repeats three fresh-context returns. | first clean clone: exact `@claim:one-time-price` passed; live `@claim:one-time-price`; `live-checkout-return.png`. |

## Final evidence

- Fresh clone `/tmp/learning-objective-loop-clean.oOVv89`: `npm ci`, all 17
  commands in `.factory/claims.json`, `npm test`, `npm run build`, and
  `npm run test:e2e` passed on the first run.
- Live artifact identity: 19 files matched after deployment. The index SHA-256
  was `2bb26823565d4e2b732d139244de5a074749f775ab6a02c0556d2d2ddeb822ee`.
- Lighthouse mobile: performance 100, accessibility 100, best practices 100,
  SEO 100; LCP 1.1 s, CLS 0, TBT 10 ms. See `lighthouse-live.json`.
- The standalone `@axe-core/cli` Selenium launcher could not start Chrome in
  this container. The equivalent `@axe-core/playwright` WCAG 2 A/AA scans ran
  in the product’s installed browser as part of the passed local and live app
  suites.
