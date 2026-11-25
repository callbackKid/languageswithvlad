# Testing

What checks the code today, how to run each check, and the plan for real tests, in the order to add them. The owner writes the tests themselves, to learn; Claude explains, guides and reviews. A step that is done moves from **Plan** up to **What runs now**.

## Contents

- [What runs now](#what-runs-now)
- [Plan](#plan)
  - [1. Set up Vitest](#1-set-up-vitest)
  - [2. Unit tests for pure functions](#2-unit-tests-for-pure-functions)
  - [3. Component tests](#3-component-tests)
  - [4. End-to-end tests with Playwright](#4-end-to-end-tests-with-playwright)
  - [5. CI on GitHub Actions](#5-ci-on-github-actions)

## What runs now

There are no automated tests yet: no test runner, no test files, no CI. What runs are **static checks**: they find type errors, broken rules and wrong formatting, but they never run the code to see whether it gives the right answer.

### Static checks

| Check                                             | What it finds                                                                                                     | Command                                   |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| TypeScript (`strict`, `noUncheckedIndexedAccess`) | Type errors in the app and in `api/`; a text missing in one of the seven interface languages                      | `yarn typecheck`                          |
| ESLint (`eslint.config.js`)                       | `any`, non-null `!`, the rules of hooks, import order, unused code, a `<button>` without `type`, one-letter names | `yarn lint`, fixes: `yarn lint:fix`       |
| Prettier (`.prettierrc.js`)                       | Formatting                                                                                                        | `yarn format:check`, fixes: `yarn format` |
| Steiger (`steiger.config.js`)                     | The Feature-Sliced Design layer rules: which layer and slice may import which                                     | `yarn fsd`                                |
| All of the above                                  |                                                                                                                   | `yarn verify`                             |

### When they run without being asked

- **Before every commit**, the hook in `.husky/pre-commit` (installed by `yarn install`): ESLint with fixes and Prettier on the staged files (`lint-staged` in `package.json`), then `yarn typecheck` and `yarn fsd` for the whole project. A commit that fails is refused. Never skip it with `--no-verify`.
- **On save in VS Code** (`.vscode/settings.json`): Prettier formats the file and ESLint fixes what it can.
- **In Claude Code sessions** (`.claude/hooks/`): ESLint and Prettier after every edit Claude makes (`format.sh`), `yarn typecheck` at the end of every turn (`typecheck.sh`).

### Checks in a real browser

Two Claude Code skills drive the app in headless Google Chrome. They are not tests: nothing runs them on its own, and they report what they see instead of passing or failing. Both use `.claude/skills/run-languageswithvlad/driver.mjs` (Playwright) against `yarn dev`, with every `/api/*` call answered by a test lesson from `fixtures.mjs`, so no keys, no document and no Claude calls are needed.

- **`run-languageswithvlad`**: runs steps (`nav`, `click`, `fill`, `shot`…) at 390 px in light and then dark theme, takes screenshots and reports console errors and sideways scroll. Ask Claude to “check it in the browser”, or see `.claude/skills/run-languageswithvlad/SKILL.md` for running the driver by hand.
- **`check-a11y`**: runs axe-core (WCAG 2.1 A and AA) on every page and lesson tab (`.claude/skills/check-a11y/all-pages.steps`), in both themes. Ask Claude to “check accessibility”, or see its `SKILL.md`.

One-time setup for both, outside the repo so the project gets no new dependency:

```bash
npm install --prefix ~/.cache/languageswithvlad-playwright --no-save --silent playwright-core@1.48.2 axe-core@4.10.2
```

## Plan

In this order. Steps 1 and 2 come first; CI (step 5) can start as soon as there is one test, and the later steps join it as they arrive.

### 1. Set up Vitest

Vitest reuses `vite.config.ts`, so the `@/` alias and the TypeScript setup work in tests without extra configuration.

- [ ] Add `vitest` as a dev dependency with an exact version (no `^`) that supports Vite 5 (check with `npm view vitest@<version> peerDependencies`).
- [ ] Scripts in `package.json`: `"test": "vitest run"` (once, for the hook and CI) and `"test:watch": "vitest"` (re-runs while you edit).
- [ ] Test files sit next to the code they test: `grade.ts` → `grade.test.ts`. Import `describe`, `it`, `expect` from `vitest` instead of turning on globals, so the types work without changes to `tsconfig.json`.
- [ ] Functions that read `localStorage` (`loadText`, `readListView`…) need a browser-like environment: add `jsdom` or `happy-dom` and put `// @vitest-environment jsdom` at the top of just those test files.
- [ ] Check that `yarn verify` still passes with test files in `src/` (ESLint, the typecheck and Steiger all see them).
- [ ] Add `yarn test` to `yarn verify` and to `.husky/pre-commit`, so a broken test stops a commit.
- [ ] Update `README.md` (the commands table) and `CODE_STYLE.md` (where tests live and what they are called).

### 2. Unit tests for pure functions

Logic without UI, as `CODE_STYLE.md` asks for it, in the `lib/` and `model/` segments. Most useful first: the first group has already had bugs, the second protects data saved in students' browsers.

**Answers and parsing** (bugs were already found here):

- [ ] `grade` / `variants` (`src/shared/lib/grade.ts`): “je t'aime” with a full stop, `(e)s` endings, accents, “nous nous réveillons”.
- [ ] `parseNextLesson` (`src/entities/lesson/lib/nextLesson.ts`): date formats, the city, “à confirmer”, a date in the past; `31.02.2026 18:00` → 28 February, not 3 March; `32.02` → “not confirmed”.
- [ ] `withPerson` (`src/entities/verb/model/normalize.ts`); `localParse`, `splitLessons` (`src/entities/lesson/lib/document.ts`).
- [ ] `negate` (`src/entities/verb/lib/negation.ts`).
- [ ] `readItem` (`src/entities/homework/model/homework.ts`): “5 предложений в passé composé” → `writing`, the same as “5 phrases au passé composé”; “слова урока 3” → `words`.
- [ ] `homeworkItems` (`src/entities/homework/model/homework.ts`): `Devoirs: a; b` → `a`, `b`; `Les devoirs :` with a numbered list under it; `Les devoirs` / `LES DEVOIRS` alone as a heading over `1. …` lines → the items; the heading over plain text, or “Les devoirs sont faciles” → nothing; a 📝 report line → nothing.
- [ ] `sameTask` / `isTaskDone` / `homeworkLeft` (`src/entities/homework/model/homework.ts`): “Mots de la leçon 1.” = “mots de la leçon 1”; `’` = `'`; “1. mots de la leçon 4” and “Devoirs : mots de la leçon 4” = “mots de la leçon 4” (Claude's copy keeps the list mark or the label); different tasks stay different; no `Devoirs:` block → `null`; 3 tasks, 1 ticked under Claude's wording → `{ left: 2, total: 3 }`.
- [ ] `homeworkTasks` (`src/widgets/lesson-view/model/homeworkTasks.ts`): with a `Devoirs:` block → the teacher's items in order, each with the `meaning` of Claude's task that is `sameTask` with it, `''` when none is; Claude split a task in two → that task has no meaning; no block → Claude's list unchanged; no block and no Claude list → `null`.
- [ ] `forSpeech` (`src/shared/lib/speech.ts`): “il/elle/on”, “allé(e)s”.
- [ ] `parsePath` (`src/shared/config/routes.ts`): `/lessons/…`, an unknown address.

**Stored data and what Claude returns** (a mistake here breaks saved progress or the cache):

- [ ] `readAnalysis` / `readConjugation` (`src/entities/lesson/model/bank.ts`): an old cached value is still read correctly after the migration on read.
- [ ] `normalizePhonetics` (`src/entities/lesson/model/normalize.ts`): Claude's answer and its saved copy are read the same; an answer without a `phonetics` list → an error; a transcription without `[ ]` or `/ /`.
- [ ] `normalizeExercise` (`src/features/make-exercise/model/normalize.ts`): a choice whose answer is not among the options becomes a gap; without `say` / `heard` (an old saved exercise) → `''` / `false`.
- [ ] `normalizeWordGroups` (`src/widgets/word-list/model/normalize.ts`): no word lands in a group → an empty result (the words go to “Other”), not an error; an answer without `groups` → an error; `L'école` in the answer finds the `l’école` that was sent.
- [ ] `loadText` (`src/shared/lib/storage.ts`): a number or an object in storage → `null`.
- [ ] `readListView`, `readListOpen` (`src/pages/lessons/model/listLayout.ts`), `readListenPause` (`src/widgets/word-list/model/listen.ts`): a foreign value (`"sideways"`, `7`, `null`) → the default.

**Server input** (`api/_lib/http.ts`):

- [ ] `text(value, maxLength)`: a string that is too long, a number, `null`, `undefined`.
- [ ] `asLevel` / `asLevels`: an unknown level, the wrong type, a missing language.

**Building exercises and rounds:**

- [ ] `overlaps` / `distractors` (`src/entities/lesson/model/quiz.ts`).
- [ ] `wordsForGroupExercise` / `canMakeGroupExercise` (`src/features/make-exercise/model/groupWords.ts`): 2 French + 2 German words → not allowed; 3 + 2 → the three French ones; more than 30 words → 30; words without a translation.
- [ ] `warmUpRound`, `prepareRound`, `previousLesson` (`src/entities/lesson/model/warmUp.ts`).
- [ ] `buildBlitz` (`src/widgets/word-list/model/blitz.ts`).
- [ ] `verbGroup` / `sortVerbs` (`src/entities/verb/lib/verbGroups.ts`), `futurProche` (`src/entities/verb/lib/futurProche.ts`), `tensesForLevel` (`src/entities/verb/lib/tenses.ts`).

**Progress and time:**

- [ ] `recordWord` → `isLearned` after `LEARNED_STREAK` right answers in a row, and a wrong answer in between; `dailyStats`, `topMistakes` (`src/entities/word/model/progress.ts`). Use Vitest's fake timers (`vi.useFakeTimers`, `vi.setSystemTime`) for the dates.
- [ ] `daysBetween`, `dayKey`, `startOfDay` (`src/shared/lib/dates.ts`): across midnight and a daylight-saving change.
- [ ] `requestOnce` (`src/shared/lib/once.ts`): two calls with the same key before the answer → one request; after an answer or an error → a new request.
- [ ] `extractPages` (`src/shared/lib/pdf.ts`): a page range, more than 20 pages, a file that is too large.

### 3. Component tests

Vitest with React Testing Library (`@testing-library/react`, `@testing-library/user-event`) and `jsdom`: render one component, act like a student, check what they would see.

- [ ] An exercise: type an answer, press Check, see “right” or “wrong” and the correct answer.
- [ ] A component that asks Claude: shows `WaitingFact` while it waits, and an error with “Try again” when the request fails (mock `fetch`).
- [ ] A ✕ button that asks in place: the question appears under the row, “no” leaves the item, “yes” removes it.

### 4. End-to-end tests with Playwright

The whole app in a real browser. `driver.mjs` and `fixtures.mjs` already do most of the work (a test lesson, mocked `/api/*`); turn the main flows into `@playwright/test` tests that pass or fail.

- [ ] Open a lesson, go through its tabs, do one exercise.
- [ ] Switch the theme and the interface language.
- [ ] At 390 px: no page scrolls sideways.
- [ ] axe-core in the same tests (`@axe-core/playwright`): no `critical` or `serious` violations on any page, in both themes.

### 5. CI on GitHub Actions

There is no `.github/` folder yet. A workflow runs the checks on every push, so they still run when a commit was made on another machine or without the hook.

- [ ] `.github/workflows/ci.yml`: on `push` to `main`, Node and `yarn install --frozen-lockfile`, then `yarn verify` and `yarn test`.
- [ ] Later in the same workflow: the Playwright tests (install Chrome with `npx playwright install --with-deps chromium`), and `yarn build`.
- [ ] No secrets are needed: the tests use fixtures, never the real API.
