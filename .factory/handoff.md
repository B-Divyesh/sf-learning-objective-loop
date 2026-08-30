# Objective Loop — independent verification 5 handoff

## Status: FAIL

Candidate `f751936990dd57c4da3e40c08c375318f653cf49` was independently
verified on 2026-08-30 against
<https://learning-objective-loop.sociobot.in/>. The deployment is
byte-for-byte identical to the candidate, and the previously reported
deployment-only checkout failure is resolved. Do not release this candidate
unchanged because it fails the mandatory cold first-screen contract.

Full evidence and retest criteria are in `.factory/verification-5.md`. No
product source was changed during verification.

## Release-blocking result

The one-click **Try it with sample data** action is present and works. The first
screen does not, however, plainly identify the audience at desktop 1440×900 or
mobile 390×844. Its sole `<h1>` is the product name `Objective Loop`; the job
statement is an `<h2>` and uses `intention`/`loop` rather than a concrete
self-learner job. The only audience line is in the footer below the initial
viewport. The acceptance contract explicitly makes this a FAIL.

Additional P2 findings:

- hash-only route transitions leave focus on `<body>`, are not announced, keep
  a single root title, and keep the wordmark as `<h1>` on every screen;
- unknown paths return the landing screen with HTTP 200; there is no real 404;
- canonical, Open Graph, Twitter-card, footer provenance, and build-id metadata
  are absent; direct legal HTML files log blocked-inline-style CSP errors;
- evidence links accept and persist `javascript:` and `data:` URLs instead of
  limiting the **Web address** field to HTTP(S).

## What passed

```text
npm ci                                      PASS — 0 vulnerabilities
10 commands from .factory/claims.json       PASS — 10/10 claims
npm test                                    PASS — 8/8
npx tsc --noEmit                            PASS
npm run build                               PASS — dist/ produced
npm run test:e2e                            PASS — 20/20
npm run test:live                           PASS — 17/17
npm run verify:live                         PASS — 18 files matched
npx playwright test tests/service-worker-update.spec.ts --repeat-each=20
                                              PASS — 20/20
/opt/fleet/lib/verify-url.sh <live> <dir>    PASS
```

Independent production checks passed the normal objective → prompt → reveal →
grade → explained schedule flow, blank/over-limit recovery, persistence, CSV,
manual overrides, demo reset/isolation, encrypted download and wrong/correct
passphrase restore, keyboard/dialog behavior, dark mode, reduced motion,
390 px layout, and axe scans with zero serious/critical findings.

The PWA took service-worker control and reloaded the seeded demo offline. A
synthetic two-version update passed 20 consecutive times. Study/export flows
requested only the product origin. Security and cache headers are present;
hashed assets are immutable and the shell/service worker revalidate.

The billing API returned 303 to hosted Dodo checkout. Its verify endpoint
allowed 30 rapid requests from one client, then returned 429 on request 31 with
`Retry-After: 4`. No purchase was submitted.

Lighthouse 12.8.2 mobile: 99 performance, 100 accessibility, 100 best
practices, 100 SEO; FCP 1.1 s, LCP 1.2 s, TBT 100 ms, CLS 0, transfer 49 KiB.
Initial JS is 41,118 B raw, CSS 20,390 B, the mobile hero is 18,514 B, and no
fonts ship.

## Artifact identity

```text
index.html  5161b785e07e5f6ebb0570897bacbaa068d1e595019839d5960c82fa9c68f4eb
sw.js       38ad02b225da970e3a585e4163cddc8910a9044bee1d74a1053e876f9aaf9fcb
```

Screenshots, claim/gate logs, URL verification, and Lighthouse JSON are under
`/work/.evidence/learning-objective-loop-verify-5/`.

## Required next steps

1. Replace the wordmark `<h1>` with a concrete job headline and name the
   self-learner audience in the first viewport.
2. Repair route semantics, focus/announcement, titles, 404 behavior, metadata,
   and legal-file CSP behavior.
3. Reject non-HTTP(S) evidence URLs.
4. Repeat all claim, local/live, PWA update, identity, accessibility,
   first-read, and performance checks before release.
