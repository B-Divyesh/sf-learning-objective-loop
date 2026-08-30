# Objective Loop

Objective Loop is a private, offline-first review notebook for self-learners. It keeps recall prompts attached to explicit learning objectives and explains every due date. It does not generate cards, ingest course content, or hide scheduling behind a recommendation model.

Live product: <https://learning-objective-loop.sociobot.in>

Try the isolated sample notebook: <https://learning-objective-loop.sociobot.in/?demo=1#/today>. Use **Reset demo** to restore the sample or **Start for real** to discard it and return to your own notebook.

## What it does

- Builds nested learning objectives with evidence links.
- Attaches hand-written short-answer prompts to each objective.
- Logs correctness and 1–5 confidence after the expected answer is revealed.
- Schedules transparent 1, 3, 7, 14, 30, 60, and 120-day review steps.
- Allows visible manual due-date overrides.
- Stores everything in IndexedDB and works after an offline reload.
- Exports encrypted `.loop` backups (PBKDF2 + AES-256-GCM) and readable CSV.
- Offers an optional $19 one-time Study archive license through Sociobot billing; all core study and export features remain free.

## Run locally

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. No environment variables are needed for the core app. To point license checks at staging, set `VITE_BILLING_API_BASE=https://pilot-api.sociobot.in/api/v1` before building.

## Test and build

```sh
npm test
npm run build
npm run test:e2e
# After deploying dist/:
npm run verify:live
npm run test:live
```

The exact production build command is `npm run build`; deploy the generated `dist/` directory. Playwright 1.58.2 is pinned for the browser tests.
Tested product claims and their exact commands are listed in `.factory/claims.json`.

## Data and privacy

Study content remains on the device. There are no analytics, ads, third-party fonts, or runtime scripts. Only license purchase/verification contacts Sociobot. See `/privacy` and `/terms` in the app.

The researched scope is recorded in `.factory/brief.json`, the original visual system and image provenance in `.factory/design.md`, the demo isolation in `.factory/demo.md`, and release verification in `.factory/handoff.md`.

## License

MIT © 2026 Sociobot (Param Factory).
