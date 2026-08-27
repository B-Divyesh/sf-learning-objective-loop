# Objective Loop — visual thesis

## Direction

Objective Loop uses a **dithered field-guide print system**: a quiet paper workspace marked by cobalt ink, vermilion review stamps, registration crosses, and coarse halftone diagrams. It borrows the honesty of a printed lab notebook—every mark has a cause—and fits a product whose core promise is inspectable scheduling. The product is not styled like a chat tool or a card deck. Objectives read as a branching study map; reviews arrive like dated field notes.

The interface supports light and dark treatments. Light mode resembles warm uncoated stock; dark mode resembles a deep-blue blueprint proof. In both, the same two “inks” retain their roles.

## Palette

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| Paper / background | `#F3EEDA` | `#111C33` | Canvas |
| Sheet / surface | `#FFFCED` | `#182743` | Raised work areas |
| Ink / text | `#14223B` | `#F8F1D4` | Primary text |
| Muted ink | `#526074` | `#B9C2C7` | Secondary text |
| Cobalt | `#1752B8` | `#77A8FF` | Links, focus, active structure |
| Cobalt contrast | `#FFFFFF` | `#08152C` | Text on cobalt |
| Vermilion | `#C43B25` | `#FF866B` | Due marks and primary action |
| Vermilion contrast | `#FFFFFF` | `#28100D` | Text on vermilion |
| Success | `#146B4B` | `#6DDAA8` | Correct / ready |
| Warning | `#8B5B00` | `#F3C76B` | Due soon / offline |
| Danger | `#A12828` | `#FF8D8D` | Destructive / invalid |
| Rule | `#C9C0A6` | `#40506B` | Borders and graph lines |

All text pairs are designed for WCAG AA contrast; state always includes words or symbols, never color alone.

## Typography

- Display and labels: `Arial Narrow`, `Aptos Narrow`, `Roboto Condensed`, system sans-serif. Condensed capitals recall specimen labels and make compact navigation readable.
- Reading and form text: `Georgia`, `Charter`, `Times New Roman`, serif. This gives prompts the gravity and comfort of study notes without shipping webfonts.
- Scale: 13 / 16 / 20 / 28 / 40 px. Body is 16 px minimum, 17 px on narrow screens, line-height 1.55.
- Tabular figures are used for counts, intervals, confidence, and dates.

## Spacing and shape

An 8 px baseline with 4 px micro-spacing. Main gaps: 8, 16, 24, 32, 48, 64 px. Corners are mostly 2–6 px, like trimmed paper rather than pill-heavy software. Independent study records use offset print-shadow cards; related controls group by proximity. All touch targets are at least 44 px.

## Interaction grammar

- The persistent left rail is the objective index; it collapses into a bottom dock at 760 px.
- Vermilion means “act or review”; cobalt means “navigate or inspect.”
- Clicking a due prompt opens one focused review sheet. The reverse side reveals the expected answer and, only then, the grading controls.
- Every due item includes a plain-language `Why now?` line and an expandable calculation. A manual date is visibly stamped as an override.
- Forms use full labels, concise help, inline validation, and focus the first invalid field.
- Destructive changes use a named confirmation; completion gives an undo toast.

## Motion

Interface transitions last 160–220 ms and use only opacity and transform: review sheets lift from the queue; success stamps settle once. Nothing loops or flashes. With `prefers-reduced-motion: reduce`, transforms and smooth scrolling are removed and state changes are instant.

## Original asset plan and provenance

One generated hero illustration clarifies the product model: a hand-built objective tree on graph paper, with prompt slips orbiting toward a dated review register. It is decorative-but-explanatory, used only in the empty/onboarding panel. Product icons, halftone textures, registration marks, and the loop mark are authored in CSS/SVG and contain no third-party assets.

### Prompt sheet

- Use case: `illustration-story`
- Asset: responsive empty-state / onboarding illustration
- Subject: top-down field notebook showing a branching learning-objective map, three small prompt slips, and a simple circular review path
- World: analogue study desk, uncoated paper, screen-printed educational field guide
- Materials: torn paper, pencil construction lines, cobalt and vermilion ink, visible halftone dots
- Light/lens: even soft daylight, near-orthographic top-down composition, no dramatic shadows
- Palette words: warm oat paper, midnight ink, cobalt blue, vermilion red
- Layout: important marks centered and right-weighted; generous clean paper around edges for responsive crop
- Negative list: no people, no hands, no readable text, no letters, no numbers, no logos, no watermark, no browser UI, no gradients, no glossy 3D, no neon, no photoreal stock scene

Generation command: `/opt/fleet/lib/gen-image.sh` using the factory image deployment, 1536×1024, medium quality. Generated on 2026-08-27. The final image is original AI-generated imagery for this product; disclosed in the footer. Source PNG and prompt sidecar live under `assets/src/`; optimized WebP is shipped under `public/assets/`.

