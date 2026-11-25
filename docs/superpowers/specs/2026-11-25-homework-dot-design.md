# Lesson history: a red dot on lessons with homework left — design

## Why

A student should see at a glance, in the lesson list, which lessons still have homework to do, without opening each one. Home shows only the newest lesson's homework; the dot covers the others too.

## Goals

- A small red dot on a lesson's row in the lesson list when all three hold:
  1. the lesson is downloaded (the row has the ⤓ icon),
  2. its text has a homework block (`Devoirs: …`),
  3. at least one task in it is not ticked.
- The dot goes away as soon as the last task is ticked, on Home or in the lesson's Homework tab, without a reload; unticking brings it back.
- An `aria-label` and a `data-tooltip` on the dot: “Homework left: 2 of 3” (plural forms, seven languages).
- A task ticked in the Homework tab counts even when Claude copied its wording slightly differently from the lesson text.

## Non-goals

- Lessons that are not downloaded: no dot, even with homework.
- Other places: the top bar, the menu, lesson mode, the Downloaded lessons tab.
- Nothing is sent to Claude or the server; no new stored data.

## Approaches

- **Tasks from the lesson text (chosen by the owner).** `homeworkItems(lesson.body)`, the list Home already uses: no Claude, every downloaded lesson with homework gets its dot at once. The Homework tab saves ticks under Claude's wording of a task, so tasks are compared loosely.
- **Claude's list of tasks (the Homework tab's):** rejected: it is saved only after that lesson's Homework or Grammar tab was opened on the device, so most lessons would get no dot.

## Design

- **Loose comparison** (`src/entities/homework/model/homework.ts`): `sameTask(first, second)`: case, punctuation, apostrophe kinds (`'` / `’`), extra spaces and a final full stop don't count. Then `homeworkLeft(body, done): { left: number; total: number } | null`: `null` when the text has no homework block. Exported through the slice's `index.ts`. Plain functions, for the owner's tests.
- **Ticks as a small shared store** (`src/entities/homework/model/done.ts`): `loadDone(key)`, `saveDone(key, tasks)`, which saves through `storage.ts` and tells listeners, and `useHomeworkDone()`, built on `useSyncExternalStore` like the other shared stores, so the list re-renders when a tick changes anywhere on the page. The keys stay `homework:<docId>:<lessonKey>`, and the stored value is unchanged (a list of task texts): no migration.
- **Callers switch to it:** `HomeworkCard` (Home), `HomeworkTab` (the lesson's Homework tab), and `report.ts` (Send to the teacher) read and write ticks through `loadDone` / `saveDone` instead of `loadTexts` / `save`. Home and the Homework tab also use `sameTask` to show a task as ticked, so the two always agree.
- **The dot** (`src/pages/lessons/ui/Lessons.tsx`): in each downloaded row, next to the ⤓ icon: `<span className="lesson-homework-left" role="img" aria-label=… data-tooltip=…>`. It is 8 px round in `var(--bad)` (red in both themes). It shows in the column and the row view, and at phone width.
- **CSS** (the Lesson history section of `styles.css`): `.lesson-homework-left` beside `.lesson-downloaded`. Checked in light and dark, at 390 px and 1280 px.
- **Texts:** `homeworkLeft` in `src/pages/lessons/i18n/lessons.ts`, plural forms picked by `{count}` (the tasks left, as the i18n core picks them): “Homework left: {count} of {total}”; the other six languages by the `translator` subagent.
- **Docs:** a README line in Features (the lesson list), a News entry for today, `homeworkLeft` / `sameTask` added to the unit-test list in `TESTING.md` (the owner writes the tests).

## Left to the builder

- Exactly where the dot sits against the ⤓ icon (before it, or on it as a corner badge), as long as it reads clearly at 390 px.
