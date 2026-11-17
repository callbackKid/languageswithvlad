---
name: run-languageswithvlad
description: Run, start and drive the languageswithvlad app in a real browser, take screenshots of its UI at phone width in light and dark theme, and check a UI change works (clicks, typing, console errors, sideways scroll). Use when asked to run the app, screenshot a page, check a change in the browser, or verify UI visually.
---

The app is a Vite + React site. An agent drives it with `.claude/skills/run-languageswithvlad/driver.mjs`: headless Google Chrome via `playwright-core`, against `yarn dev`, with every `/api/*` call answered by a test lesson from `fixtures.mjs`. No real document, no Claude calls, no keys. All paths are relative to the repo root.

## Setup (once per machine)

Google Chrome must be installed (`/Applications/Google Chrome.app`); the driver uses it instead of downloading a browser. `playwright-core` goes into a cache folder outside the repo, so the project gets no new dependency:

```bash
npm install --prefix ~/.cache/languageswithvlad-playwright --no-save --silent playwright-core@1.48.2
```

## Run (agent path)

1. Start the dev server in the background (as a background task, not with `&`), then wait until it answers:

```bash
yarn dev --port 5173 --strictPort
```

```bash
until curl -sf -o /dev/null http://localhost:5173/; do sleep 1; done
```

2. Pipe steps to the driver. It runs them once per theme (light, then dark) at 390 px wide, after loading the test document:

```bash
node .claude/skills/run-languageswithvlad/driver.mjs <<'EOF'
nav /lessons
click tab /^Verbs/
click button /se lever/
click button negative
shot verbs-negative
click button /^aimer/
click button Practise this tense
fill table.conj input @0 aime
click button Check answers
classes table.conj input
shot verbs-drill
EOF
```

3. **Look at the screenshots** with the Read tool. Paths are printed (`$TMPDIR/languageswithvlad-shots/<theme>-<name>.png`). The last line is `OK: …` or the list of problems; the exit code is 1 when there were any.

4. Stop the server: `lsof -ti:5173 -sTCP:LISTEN | xargs kill`

### Steps

| Step                              | Does                                                                            |
| --------------------------------- | ------------------------------------------------------------------------------- |
| `nav <path>`                      | Opens a page: `/lessons`, `/my-words`, `/stats`… (see README, Pages)            |
| `click <role> <name>`             | Clicks by accessible role and exact name; `/regex/` for a partial name          |
| `click-text <text>`               | Clicks the element with exactly this text                                       |
| `fill <selector> @<index> <text>` | Types into the n-th match of a CSS selector                                     |
| `wait-text <text>`                | Waits until the text appears                                                    |
| `shot <name>`                     | Full-page screenshot, and checks the page doesn't scroll sideways               |
| `classes <selector>`              | Prints the class of every match (`ok`, `bad`, `accent` on drill inputs)         |
| `a11y <name>`                     | Runs axe-core on the page; needs axe-core installed, see the `check-a11y` skill |

Lines starting with `#` are skipped. Options: `--themes light` (one theme), `--width 1280` (desktop), `--out <dir>`.

### Test data

`fixtures.mjs` serves one lesson (14.11.2026) with the words and verbs `se lever` and `aimer`, their conjugations (présent, passé composé, and impératif for se lever), and `{}` for every other endpoint. A page that needs more (grammar, homework, gap sentences) needs a branch in `answerFor`; copy the response shape from the endpoint in `api/` and its `normalizeX` in `src/lib/parse.ts`.

## Run (human path)

`yarn start` runs the app with the real API functions (`vercel dev`, reads `.env.local`); open the address it prints and paste a document link. Not used by the driver.

## Gotchas

- **Lesson tabs are `tab`, not `button`, and their names carry a count**: "Verbs 2". Use `click tab /^Verbs/`; `click button Verbs` times out.
- **The tense and the affirmative/negative choice carry over when you switch verbs.** After `click button negative` on one verb, the next verb's drill expects negative forms.
- **Tense buttons without forms are disabled.** The fixture has no imparfait, futur or conditionnel, so clicking them times out.
- `/api/*` must be answered with JSON: under `yarn dev` alone Vite returns `index.html` for it and the app shows "no server". The driver's route mock covers every `/api/` path.
- The first load after starting Vite is slow (compiling); the driver waits up to 15 s per step.

## Troubleshooting

- `fill needs: fill <selector> @<index> <text>`: the index was written without `@` (`0` instead of `@0`).
- `step "click …" failed: locator.click: Timeout`: the name or role doesn't match (see the tab gotcha), or the button is disabled.
- `Cannot find module 'playwright-core'`: run the Setup line. Another location: `PLAYWRIGHT_DIR=<folder> node …`.
- Port 5173 busy: `lsof -ti:5173 -sTCP:LISTEN | xargs kill`, then start again.
