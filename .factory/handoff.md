# Objective Loop — repair handoff

## Status: PASS

Work order `learning-objective-loop-repair-2` repairs the release-blocking PWA
update failure independently reported for candidate
`2797015d36ecae4513e607be623d6f6a962e654f` in
[`verification-2.md`](verification-2.md). The implementation repair is commit
`1f863ba23a5a971ef1eeb97abb9926fd46beb5a5`.

## Release-blocker repair

The hand-maintained `public/sw.js` has been replaced with a Vite build plugin
that emits a release-versioned `dist/sw.js`. Every current app-shell file is
pre-cached before activation, including Vite's content-addressed JS and CSS,
the HTML shell, offline/legal/manifest documents, icons, and both onboarding
images. The cache name fingerprints the app shell's generated entry names and
the contents of every static shell input.

The worker does not intercept its own script request, so the browser can
always discover a deployment update. During activation it retains exactly one
previous Objective Loop shell cache. This protects the tab still controlled by
the prior worker during the update handoff; older Objective Loop shell caches
are removed. Navigation and static asset responses resolve from the current
shell cache first, with the existing offline fallback retained.

`tests/service-worker-update.spec.ts` is an exact two-version regression:
it starts the built v1 worker, changes only its release cache name, requests a
worker update with HTTP caching disabled by the deployment policy, proves the
new cache contains the generated hashed JavaScript entry, waits for activation,
then uses Playwright `context.setOffline(true)` and reloads the page. The
Objective Loop heading and `Offline · saved here` state must render. This test
failed against the verifier's implementation because its updated shell omitted
the hashed entry assets.

## Verification evidence

Clean install and local quality gates on 2026-08-28 UTC:

```sh
npm ci                         # 62 packages audited; 0 vulnerabilities
npm test                       # 7/7 unit tests passed
npx tsc --noEmit               # passed
npm run build                  # passed; dist/ emitted
npm run test:e2e               # 8/8 browser tests passed
```

The browser suite covers the real objective → evidence → prompt → reveal →
grade → explainable schedule workflow, persistence, native named evidence
confirmation (dismiss and accept), keyboard skip link, dark treatment, normal
offline reload, the post-update offline reload above, deployment cache/security
configuration, and a 390×844 mobile run. Desktop and mobile axe WCAG 2 A/AA
checks report no serious or critical findings; the mobile test verifies a 17px
body size and no horizontal overflow. The product has no outbound free-flow
requests beyond its own origin; the only configured optional external endpoint
is the Sociobot license verification API constrained in CSP.

Production build output remains within the static budgets:

| Asset | Raw | Gzip |
| --- | ---: | ---: |
| Initial JavaScript | 34.77 KB | 11.60 KB |
| Initial CSS | 19.07 KB | 4.99 KB |
| Generated service worker | 2.13 KB | — |

`public/staticwebapp.config.json` remains part of the artifact: hashed
`/assets/*` use `public, max-age=31536000, immutable`; `index.html` and
`sw.js` are revalidated with `max-age=0`; CSP permits only self plus the
optional Sociobot API, with `frame-ancestors 'none'`, `X-Frame-Options: DENY`,
and a restrictive permissions policy.

## Deploy and follow-up

Build and deploy the static artifact with:

```sh
npm run build
/opt/fleet/lib/deploy-static.sh learning-objective-loop dist
```

Deployment completed on 2026-08-28 UTC with Azure Static Web Apps deployment
`d43babab-08ae-41e0-9d32-88e847909b6f`. The live custom domain
`https://learning-objective-loop.sociobot.in/` returned HTTP 200. Its hashed
entry JavaScript SHA-256 was exactly
`62d402bf1ec216d32f838577e6cae60ebe6c47a61ea5356f912d0d2c971643df`, matching
`dist/`; the live worker is 2,134 B and is short-cached, while the live hashed
entry is immutable for one year. Live desktop (1440×900) and mobile (390×844)
browser checks each found the expected title, one `h1`, one `main`, no console
or page errors, and no horizontal overflow. Response headers include the CSP,
frame, permissions, HSTS, referrer, and `nosniff` policies described above.

No known product gaps remain. A numeric Lighthouse result is not recorded:
the earlier verifier could not connect Lighthouse to its supplied Chromium.
The direct bundle, Playwright, axe, offline/update, policy, privacy, desktop,
and 390px mobile checks above passed.
