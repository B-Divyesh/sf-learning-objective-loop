# Objective Loop

Objective Loop is a private review notebook for self-learners. It works without internet after the first visit. It keeps hand-written recall prompts tied to learning objectives and explains every due date.

Live product: <https://learning-objective-loop.sociobot.in>

Try the isolated sample notebook: <https://learning-objective-loop.sociobot.in/demo>. Use **Reset demo** to restore the sample. Use **Open my notebook** to discard demo changes and return to your notebook. Older `?demo=1#/today` links redirect to `/demo`.

## What it does

- Builds nested learning objectives with evidence links.
- Attaches hand-written short-answer prompts to each objective.
- Logs correctness and 1–5 confidence after the expected answer is revealed.
- Schedules the disclosed 1, 3, 7, 14, 30, 60, and 120-day steps.
- Allows visible manual review-date overrides.
- Uses IndexedDB for study records, with localStorage as a fallback.
- Exports password-protected `.loop` backups and readable CSV.
- Offers a one-time $19 Study archive license for recall rates and printable weekly summaries.

You write each prompt. Objective Loop does not import course content or choose dates with a hidden model.

## Run locally

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. No environment variables are needed for the core app. To test license checks against Sociobot’s test server, set `VITE_BILLING_API_BASE=https://pilot-api.sociobot.in/api/v1` before building.

## Test and build

```sh
npm test
npm run build
npm run test:e2e
# After deploying dist/:
npm run verify:live
npm run test:live
```

The production build command is `npm run build`; deploy `dist/`. Playwright 1.58.2 is pinned for browser tests. Claims and their exact commands are listed in `.factory/claims.json`.

## Data and privacy

Study content stays on this device. The core app has no analytics, ads, third-party fonts, or third-party JavaScript. License purchase and verification contact Sociobot. Evidence links open their site only when you select them. See `/privacy` and `/terms` in the app.

See `.factory/brief.json` for scope and `.factory/design.md` for the visual system and image sources. See `.factory/demo.md` for demo isolation. See `.factory/handoff.md` for release checks.

## License

MIT © 2026 Sociobot (Param Factory).
