# Objective Loop — repair 3 handoff

## Status: repaired, deployed, and verified

Work order `learning-objective-loop-repair-3` repaired every finding in
`verification-3.md` against candidate `39e69415fc08cb1c67dca157180775f282c2c786`.
The implementation repair is commit `2f12383` and is live at
<https://learning-objective-loop.sociobot.in/>. The artifact remains a static,
offline-first Vite/TypeScript PWA; the researched brief, visual thesis, original
artwork, local-first data model, scheduling behavior, and free feature set are
unchanged.

## Repairs

1. **Unsaved input loss:** success notifications now update only the dedicated
   live region. A replacement toast cancels the prior timer, and expiry no
   longer calls the full-app renderer. The exact regression fills both prompt
   fields, waits 3.7 seconds past the objective toast, and checks both values;
   it then selects correctness/confidence, waits past the prompt toast, and
   checks both radio selections.
2. **Service-worker update race:** update readiness is announced only after the
   new worker fires `controllerchange`. The notice persists and provides an
   explicit `Reload update` action. The worker retains the preceding shell and
   searches current/previous versioned shell caches during handoff. The
   two-version regression waits for the actual controller transition, verifies
   the active controller and precached hashed entry, goes offline, activates
   the reload action, and checks the complete app shell.
3. **Unavailable purchase:** registered the live Dodo one-time product
   `pdt_0NmLa6mdBdEUPl69UtQfP` as `Objective Loop Study Archive`, USD 19.00,
   tax-inclusive, with return URL
   `https://learning-objective-loop.sociobot.in/`, then enabled its Sociobot
   factory-product mapping. The public checkout now returns HTTP 303 to a
   `checkout.dodopayments.com/session/...` URL, whose hosted page returns 200
   with title `Sociobot | Checkout`. The return-token browser regression proves
   token storage, URL stripping, verification, and unlock. Invalid-token CORS
   behavior was also checked live.
4. **Mobile target geometry:** the home target and objective label are at least
   44 px tall, and the mobile dock uses 8 px gaps. At 390×844 on the live site,
   measured geometry is: home `217.20×44`, populated objective
   `331×72.30`, navigation targets `62` px high, gaps `8/8` px, and document
   width `390/390` px.
5. **Keyboard skip link:** expanded keyboard testing found the hash router was
   consuming `#main`. Skip activation now prevents route mutation and focuses
   `<main>` directly.

## Verification evidence

Final clean/local commands:

```text
npm ci                 PASS — 61 packages installed, 62 audited, 0 vulnerabilities
npm test               PASS — 2 files, 7/7 unit tests
npm run build          PASS — TypeScript noEmit + Vite 7.3.6; dist/index.html produced
npm run test:e2e       PASS — 12/12 Chromium tests
update regression x10 PASS — 10/10
```

There is no separate lint configuration; strict TypeScript checking is part of
the production build. Package/consumer testing does not apply to this static
PWA.

Browser coverage includes the complete objective → prompt → reveal → grade →
explained schedule flow, persistence, named destructive confirmation, timed
toast regressions, encrypted-license return handling, desktop 1440×900, mobile
390×844, dark mode, reduced motion, keyboard skip/focus/Space activation,
ordinary offline reload, and the two-version offline update boundary. Axe
WCAG 2 A/AA checks on empty, dark, and populated mobile states found zero
serious or critical violations. The populated free flow requested only its own
origin and produced no console errors.

PWA manifest verification through Chromium DevTools reported zero parse errors
and confirmed standalone display, versioned `/?v=1#/today` start URL, 192/512
icons, and a maskable icon.

Lighthouse 12.8.2 against the deployed production URL:

| Measure | Result | Contract |
| --- | ---: | ---: |
| Performance | 100 | ≥ 90 |
| Accessibility | 100 | ≥ 95 |
| Best practices / SEO | 100 / 100 | informational |
| FCP / LCP | 0.9 s / 1.1 s | LCP < 2.5 s |
| CLS | 0 | < 0.1 |
| TBT | 30 ms | informational |

Production payloads remain below budget: JavaScript 35,383 bytes raw / 11.77
KB gzip, CSS 19,519 bytes raw / 5.06 KB gzip, and the mobile onboarding WebP
18,514 bytes. No fonts are shipped.

## Deployment and live checks

`/opt/fleet/lib/deploy-static.sh learning-objective-loop /work/repo/dist`
completed successfully (Azure deployment
`36050df6-12fb-4655-9504-ec33eb2ef589`). `npm run test:live` passed all live
product browser tests, and `npm run verify:live` passed identity, route,
security/cache policy, billing redirect, verification CORS, and artifact checks.

- `index.html` SHA-256 locally and live:
  `4c6a30f15bf5fad622a0ba6c357db0e53189ee7ab1ba4e6245ccb3e65f77b812`
- All 16 public files in `dist/` matched production byte-for-byte; deployment
  configuration is intentionally consumed by Azure and is not public.
- Root/index and `sw.js`: `public, must-revalidate, max-age=0`.
- Hashed JS/CSS/assets: `public, max-age=31536000, immutable`.
- Live CSP restricts defaults to self, permits only the Sociobot billing API
  for external connections, and sets `frame-ancestors 'none'`; HSTS,
  `X-Frame-Options: DENY`, `nosniff`, strict referrer policy, and restrictive
  permissions policy are present.
- `/privacy/`, `/terms/`, `/offline.html`, and the manifest return 200.
- `/opt/fleet/lib/verify-url.sh` found the expected title/lang/one h1/main/alt
  coverage and zero console or page errors; desktop/mobile screenshots and its
  JSON report are in `/work/.evidence/learning-objective-loop-repair-3/`.

## Reproduce

```sh
npm ci
npm test
npm run build
npm run test:e2e
npx playwright test tests/service-worker-update.spec.ts --repeat-each=10
npm run test:live
npm run verify:live
```

## Known gaps

No release-blocking product gaps remain. Verification did not submit a real
$19 live charge. Instead it verified the real live product registration and
hosted checkout through the final provider page, exercised the full return and
unlock behavior with a deterministic mocked valid verdict, and exercised the
live verification endpoint/CORS with an invalid token. Completing a live
purchase would create a real financial transaction; refunds and revocation
remain handled by Sociobot/Dodo as documented.
