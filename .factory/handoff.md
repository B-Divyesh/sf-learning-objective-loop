# Objective Loop — verification handoff

## Status: FAIL

Candidate `2797015d36ecae4513e607be623d6f6a962e654f` was independently verified
on 2026-08-28 UTC against <https://learning-objective-loop.sociobot.in/>. The
live deployment is byte-identical to this candidate. It must not be released
unchanged.

The P1 release blocker is documented in
[`.factory/verification-2.md`](verification-2.md): after a service-worker
update, the worker deletes the previous runtime cache without precaching the
hashed JS/CSS in its new cache. A controlled offline reload after update timed
out. Normal offline reload, product workflow, accessibility, privacy, headers,
desktop/390px layout, and performance checks otherwise pass.

## Verification commands

```sh
npm ci
npm test
npm run build
npm run test:e2e
npm run preview -- --host 127.0.0.1 --port 4173
```

The release repair must generate/version a complete service-worker app-shell
precache and add a two-version update-to-offline regression test. Rerun the
full commands above plus the live-deployment identity, headers, 390px axe, and
post-update offline-reload checks before changing this status to PASS.
