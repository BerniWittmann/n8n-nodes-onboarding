# Nodes team — Engineering onboarding

A ~60 minute onboarding session for new engineers: who the Nodes team is, where n8n connects to the outside world, and how nodes work. It is built around one running example workflow (Gmail Trigger → IF → AI Agent → Slack).

Built with [Slidev](https://sli.dev). The theme is reused from the n8n Connect deck.

## Getting started

To start the slide show:

- `npm install`
- `npm run dev`
- visit <http://localhost:3030>

Edit [slides.md](./slides.md) to see the changes. The presenter view with speaker notes is at <http://localhost:3030/presenter>.

Learn more about Slidev in the [documentation](https://sli.dev/).

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Static site in `dist/` |
| `npm run export` | PDF export (`playwright-chromium` is a dev dependency) |
| `N8N_REPO=/path/to/n8n npm run verify` | Checks the slide count, code-block length, speaker notes, `SCRIPT.md` parity and code references |

## Deployment

The deck is published to GitHub Pages: <https://berniwittmann.github.io/n8n-nodes-onboarding/>. The site has a PDF download button.

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) runs on every push to `main` and on manual dispatch. It runs `verify`, builds the site with `--base /n8n-nodes-onboarding/ --download`, and deploys it to Pages. Pull requests only build. The code-reference check is skipped in CI, because it needs an n8n checkout.

## Before presenting

- Put your name on slide 1 of `SCRIPT.md`.
- Slides 11 and 34 are screenshots of a real workflow, "Onboarding: running example", in my personal n8n instance. If you change the workflow, retake them into `public/running-example.png` and `public/connection-types.png`. The slide 34 tags are positioned by percentage. The screenshots were taken with the Slack missing-credential warning and the canvas controls hidden.
- Slides stay light on purpose. Speaker notes (presenter view) hold the details and file paths. `SCRIPT.md` holds the spoken script for the recording.

## Layout

| Path | What it is |
| --- | --- |
| `slides.md` | The deck: 36 slides in 6 numbered sections |
| `SCRIPT.md` | Speakable script, one section per slide |
| `style.css`, `setup/mermaid.ts`, `public/n8n-*.svg` | n8n theme, copied unchanged from the n8n Connect deck |
| `public/running-example.png`, `public/connection-types.png` | Canvas screenshots of the running example workflow (slides 11 and 34) |
| `global-bottom.vue` | Footer, same as the Connect deck, with the label "Nodes team · Engineering onboarding" |
| `scripts/verify.mjs` | Automated checks for the deck |

`package.json` pins `floating-vue` to 5.3.0 through `overrides`. Slidev 53's twoslash client fails to patch FloatingVue 5.4 and logs a console error on every page.

## Sources

- Notion: "Engineering Teams - Areas of Ownership" (ownership and neighbour teams), Team Nodes → "Nodes onboarding" (engineering source of truth), "Team Nodes" (mission, ownership, members, channels), "Ecosystem — Domain & Team Structure", "Nodes team Q3-2026 learnings & Q4 outlook".
- Onboarding revamp meeting and FigJam brainstorm (30 Sep 2026).
- Code references reflect `n8n` `master` @ `52db75973e` (30 Sep 2026). `npm run verify` checks that every referenced path still exists.
