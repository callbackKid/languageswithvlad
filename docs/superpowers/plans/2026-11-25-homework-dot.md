# Homework dot in the lesson list Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A red dot on a downloaded lesson's row in Lesson history while its `Devoirs:` block has unticked tasks.

**Architecture:** Pure functions in `entities/homework` compare tasks loosely and count what is left; a small `useSyncExternalStore` store wraps the existing tick keys so every view re-renders when a tick changes; `Lessons.tsx` draws the dot.

**Tech Stack:** React 18 + TypeScript, FSD layers checked by Steiger, i18n through `defineMessages`.

**Spec:** `docs/superpowers/specs/2026-11-25-homework-dot-design.md`

## Global Constraints

- **Tests are the owner's.** Vitest is being installed by the owner (TESTING.md step 1). Each task has a "Tests for the owner" block naming the tests and their assertions; do not write test files. Verification is `yarn verify` and the `run-languageswithvlad` driver.
- Stored data never changes shape: the key stays `homework:<docId>:<lessonKey>` (`homeworkKey`), the value a list of task texts. No migration, no new key.
- CODE_STYLE.md is binding: whole-word names, `//` for one-line comments, `data-tooltip` (never `title`), colours only through CSS variables, no user-visible text in components.
- New texts in all seven interface languages: English written here, the other six by the `translator` subagent.
- Commit only when the owner asks (CLAUDE.md overrides the skill's "frequent commits").

## Review Focus

- Ticked in the Homework tab under Claude's wording (`Mots de la leçon 1.`, `’` instead of `'`) → counts as done on Home and in the dot; unticking it there unticks it everywhere.
- A lesson ticked fully, then edited by the teacher to add one task → the dot comes back with `1 of N`.
- A downloaded lesson without a `Devoirs:` block, and a lesson with homework that is not downloaded → no dot.
- Damaged storage (a number or an object under the key) → treated as nothing ticked (`loadTexts` already drops it), no crash.
- Row view on a phone at 390 px: the dot next to the ⤓ icon doesn't widen the row or cause sideways scroll.

---

### Task 1: Loose comparison and the count of tasks left

**Files:**

- Modify: `src/entities/homework/model/homework.ts` (after `homeworkItems`)
- Modify: `src/entities/homework/index.ts`
- Modify: `TESTING.md` (section 2, "Answers and parsing")

**Interfaces:**

- Produces: `sameTask(first: string, second: string): boolean`; `isTaskDone(done: string[], task: string): boolean` (some item of `done` is `sameTask` with `task`); `homeworkLeft(body: string, done: string[]): { left: number; total: number } | null` (`null` when `homeworkItems(body)` is empty). All three exported from `@/entities/homework`.

- [ ] **Step 1: Implement `sameTask`.** Both sides through one private `taskText(text)`: `normalize('NFC')`, lowercase, `’‘\`ʼ`→`'`, every character that is not a letter, mark, digit or space (`/[^\p{L}\p{M}\p{N}\s]/gu`, which drops `'`too) → a space, spaces collapsed, trimmed. Then`isTaskDone`and`homeworkLeft` on top of it.
- [ ] **Step 2: Export the three names** from `src/entities/homework/index.ts`.
- [ ] **Step 3: Add to TESTING.md** under "Answers and parsing":
      `- [ ] sameTask / isTaskDone / homeworkLeft (src/entities/homework/model/homework.ts): “Mots de la leçon 1.” = “mots de la leçon 1”; ’ = '; different tasks stay different; no Devoirs block → null; 3 tasks, 1 ticked under Claude's wording → { left: 2, total: 3 }.`
- [ ] **Step 4: Run** `yarn verify`. Expected: no errors.

**Tests for the owner** (`src/entities/homework/model/homework.test.ts`):

- `sameTask('Mots de la leçon 1.', 'mots de la leçon 1')` → `true`
- `sameTask("verbes s'appeler", 'verbes s’appeler')` → `true`
- `sameTask('mots de la leçon 1', 'mots de la leçon 2')` → `false`
- `homeworkLeft('Pas de devoirs ici', [])` → `null`
- `homeworkLeft('Devoirs: a; b; c', ['B.'])` → `{ left: 2, total: 3 }`
- `homeworkLeft('Devoirs: a; b', ['a', 'b'])` → `{ left: 0, total: 2 }`

### Task 2: Ticks as a shared store, used by Home, the Homework tab and the report

**Files:**

- Create: `src/entities/homework/model/done.ts`
- Modify: `src/entities/homework/index.ts`
- Modify: `src/pages/home/ui/HomeworkCard.tsx:199-214, 270-290`
- Modify: `src/widgets/lesson-view/ui/LessonExtrasTabs.tsx:91-113` (`HomeworkTab`)
- Modify: `src/features/send-to-teacher/model/report.ts:50-55`

**Interfaces:**

- Consumes: `isTaskDone` from Task 1; `loadTexts`, `save` from `@/shared/lib/storage`.
- Produces: `loadDone(key: string): string[]`; `saveDone(key: string, tasks: string[]): void` (saves, then notifies subscribers); `useHomeworkDone(): number`, a version that changes on every `saveDone`, so a component re-reads with `loadDone` when it changes. All exported from `@/entities/homework`.

- [ ] **Step 1: Write `done.ts`** following the store in `src/entities/word/model/progress.ts`: a module-level `version` number and `subscribers` set, `subscribe` outside the hook, `useHomeworkDone = () => useSyncExternalStore(subscribe, getVersion)`. A comment at the top says the stored shape is unchanged.
- [ ] **Step 2: HomeworkCard.** `loadTexts` / `save` → `loadDone` / `saveDone`; in `mark`, `saved.includes(task) === value` → `isTaskDone(saved, task) === value`, and unticking removes every item `sameTask` with `task`; `done.includes(item.text)` → `isTaskDone(done, item.text)` (count, `className`, `checked`).
- [ ] **Step 3: HomeworkTab.** The same switch: `loadDone` / `saveDone`, `isTaskDone(done, task.task)` for the count, the class and `checked`; `toggle` removes with `sameTask`.
- [ ] **Step 4: report.ts.** `loadDone(homeworkKey(...))` and `isTaskDone(done, item.text)` in the count and the ✅ / ⬜ lines.
- [ ] **Step 5: Run** `yarn verify`. Expected: no errors (Steiger: `features` and `widgets` import `entities/homework` through its `index.ts` only).
- [ ] **Step 6: Check in the browser** with the driver: Home → tick “mots de la leçon 1” → open lesson 1's Homework tab: the same task is ticked; untick it there → Home shows it unticked. No console errors.

**Tests for the owner** (`src/entities/homework/model/done.test.ts`, `// @vitest-environment jsdom`, needs `jsdom@27.4.0`):

- `saveDone('homework:doc:1', ['a'])` then `loadDone('homework:doc:1')` → `['a']`
- a subscriber added through the hook's `subscribe` is called once per `saveDone`
- `localStorage.setItem('homework:doc:1', '7')` → `loadDone` → `[]`

### Task 3: The dot in the lesson list

**Files:**

- Modify: `src/pages/lessons/ui/Lessons.tsx:66-75, 160-190`
- Modify: `src/pages/lessons/i18n/lessons.ts`
- Modify: `src/app/styles.css` (Lesson history section, next to `.lesson-downloaded` at about line 1314)

**Interfaces:**

- Consumes: `homeworkKey`, `homeworkLeft`, `loadDone`, `useHomeworkDone` from `@/entities/homework`.

- [ ] **Step 1: Text.** In `lessonsText`, English: `homeworkLeft: { one: 'Homework left: {count} task of {total}', other: 'Homework left: {count} tasks of {total}' }`. Hand the key to the `translator` subagent for ru, fr, de, es, pt, it (with `few` / `many` where the language has them).
- [ ] **Step 2: Lessons.tsx.** Call `useHomeworkDone()` once in the component (its value only triggers the re-render). In each row, for a downloaded lesson only, `homeworkLeft(listedLesson.body, loadDone(homeworkKey(docId, listedLesson.key)))`; when `left > 0`, render `<span className="lesson-homework-left" role="img" aria-label={label} data-tooltip={label} />` just before the ⤓ icon, with `label = listText.t('homeworkLeft', { count: left, total })`.
- [ ] **Step 3: CSS.** `.lesson-homework-left`: 8 px circle, `background: var(--bad)`, `align-self: center`, `flex-shrink: 0`. When the ⤓ icon follows it, the dot takes the `margin-left: auto` instead, so both stay at the right end of the row. Nothing at 760 px unless the check in Step 5 shows a problem.
- [ ] **Step 4: Run** `yarn verify`. Expected: no errors.
- [ ] **Step 5: Check in the browser** with the driver, in light and dark, at 390 px and with `--width 1280`, column and row view: `/lessons` with the fixture lesson downloaded → the dot shows; its tooltip reads “Homework left: 3 tasks of 3”; tick all three on Home → back on `/lessons` the dot is gone; untick one → it's back. No sideways scroll, no console errors. Also `check-a11y` on `/lessons`: no new violations.

### Task 4: Docs and News

**Files:**

- Modify: `README.md` (Features, the **Lesson history** item at about line 27)
- Modify: `src/entities/news/model/news.ts` (a `2026-11-25` day at the top)

- [ ] **Step 1: README.** In the Lesson history item, one clause: a red dot on a downloaded lesson whose homework isn't all ticked, with how many tasks are left in its tooltip.
- [ ] **Step 2: News.** A `kind: 'new'` item for students: “A red dot in Lesson history marks the downloaded lessons whose homework isn't finished yet, and its tooltip says how many tasks are left.” The other six languages by the `translator` subagent.
- [ ] **Step 3: Run** `yarn verify`. Expected: no errors. Then hand over the diff for the owner's review and commit on request.
