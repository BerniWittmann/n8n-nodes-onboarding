# Nodes team — Engineering onboarding (Slidev deck)

A ~60 minute onboarding session for new engineers: who the Nodes team is, where n8n connects to the outside world, and how nodes work. It is built around one running example workflow (Gmail Trigger → IF → AI Agent → Slack).

## Run

```bash
npm install
npm run dev        # http://localhost:3030, presenter view with notes at /presenter
npm run build      # static site in dist/
npm run export     # PDF (playwright-chromium is a dev dependency)
N8N_REPO=/path/to/n8n npm run verify   # slide count, code-block length, notes, SCRIPT.md, code refs
```

## Before presenting

- Fill in the `[Presenter: …]` placeholders:
  - Slide 5 (history): founding year, team size, key milestones, and how the team maps to the three Ecosystem teams.
  - Slide 11 (people): the role and "ask me about" for each person. Also check that the member list is current.
  - `SCRIPT.md` slide 1 (your name) and slides 5 and 11.
- Slides stay light on purpose. Speaker notes (presenter view) hold the details and file paths. `SCRIPT.md` holds the spoken script for the recording.

## Layout

| Path | What it is |
| --- | --- |
| `slides.md` | The deck: 39 slides in 6 numbered sections |
| `SCRIPT.md` | Speakable script, one section per slide |
| `style.css`, `setup/mermaid.ts`, `public/` | n8n theme, copied unchanged from the n8n Connect deck |
| `global-bottom.vue` | Footer, same as the Connect deck, with the label "Nodes team · Engineering onboarding" |
| `scripts/verify.mjs` | Automated checks for the goal facts |

`package.json` pins `floating-vue` to 5.3.0 through `overrides`. Slidev 53's twoslash client fails to patch FloatingVue 5.4 and logs a console error on every page.

## Sources

- Notion: Team Nodes → "Nodes onboarding" (engineering source of truth), "Team Nodes" (mission, ownership, members, channels), "Ecosystem — Domain & Team Structure", "Nodes team Q3-2026 learnings & Q4 outlook".
- Onboarding revamp meeting and FigJam brainstorm (30 Sep 2026).
- Code references reflect `n8n` `master` @ `52db75973e` (30 Sep 2026). `npm run verify` checks that every referenced path still exists.
