# Objective Loop — review 3 handoff

## Status: FAIL

Review 3 did not change product code. The deployed site matches commit 572ba6d1f75e03096fdbc229a666050e080a662c: the live index SHA-256 is 60c262fcdbd61f27caed4982fde1779a1fad79690563feb8df0e3ac1d6441028 and 19 deployed artifacts matched the local build.

The review found one blocking issue, documented in .factory/review-3.md as F-3-1. The exact clean-clone one-time-price claim command failed once because the controlled checkout return did not render the unlocked archive state. It passed on immediate retry, but a retry does not confirm a registered claim.

## Checks completed

- Fresh desktop and 390 px mobile cold-read checks passed. The demo action and its result are visible before scrolling.
- The live demo showed realistic sample data. Reset removed a demo-only record; leaving demo preserved a separately created real record.
- Clean clone: npm ci, npm test (8/8), npm run build, and npm run test:e2e (33/33) passed.
- All listed claim commands passed except the first one-time-price run. Its immediate exact retry passed; the other 16 claim commands passed on their first run.
- npm run build then npm run verify:live passed with 19 matching deployed artifacts. npm run test:live passed 30/30.
- Live landing and demo request logs used only the product origin and had no console errors. Routes, 404, metadata, focus, keyboard, target size, reduced motion, and axe checks pass through the browser suite.

## Reproduce

    npm ci
    npm test
    npm run build
    npm run test:e2e
    npm run test:e2e -- --grep "@claim:one-time-price"
    npm run verify:live
    npm run test:live

Run the build before npm run verify:live because it requires dist. Resolve F-3-1 and repeat the full independent review before acceptance.
