# An exercise on one group of words — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A button next to each group heading in a grouped word list makes a 15-question mixed round by Claude (choose, fill the gap, translate) on that group's words.

**Architecture:** The lesson-mode exercise (`src/pages/call/ui/MakeExercise.tsx` and its model and texts) moves to a new feature, `src/features/make-exercise/`. The feature adds `GroupExercise`, which asks the existing `api.exercise` for 15 questions on a word list and plays the existing round. `WordsTab` (`src/widgets/word-list`) shows the button and the round.

**Tech Stack:** React + TypeScript + Vite, FSD layers checked by Steiger, the Vercel function `api/analyze.ts` (unchanged).

**Spec:** `docs/superpowers/specs/2026-11-22-group-exercise-design.md`

## Global Constraints

- CODE_STYLE.md is binding: whole-word names, no `!`, no `any`, `type="button"` on every button, `data-tooltip` (never `title`), texts only in message files with all seven languages.
- Imports: inside the feature, relative paths; from outside, only `@/features/make-exercise` (its `index.ts`).
- 15 questions (`GROUP_QUESTIONS = 15`); at most 30 words sent (`MAX_GROUP_WORDS = 30`, keep in step with `MAX_EXERCISE_WORDS` in `api/analyze.ts`); the button is disabled below 3 ticked words (`MIN_GROUP_WORDS = 3`).
- The level is `getSettings().levels[language]`. Nothing about a group round is saved; lesson mode keeps its `exercise:last` key unchanged.
- No server or prompt change.
- Tests are written by the owner: no test files in this plan. Each task ends with `yarn verify` and a check in the running app.
- Commit only when the owner asks (on `main`, no branches); never `--no-verify`.

## Review Focus

1. **Words to learn mixes languages in one group**: the round uses the language most of the group's ticked words are in, and only those words (Task 2, step 3).
2. **Closing the round while Claude is still writing it**: a late answer must not set state after the round is gone (`let alive = true` guard in the effect) (Task 2, step 3).
3. **Groups of 1–2 words, or more than 30**: fewer than 3 ticked → the button is disabled with a tooltip saying why; more than 30 → 30 sent, the weaker ones first (Task 2, step 2; Task 3, step 4).
4. **A long group name at 390 px**: the heading and the button wrap, nothing scrolls sideways, in both themes (Task 3, step 4).
5. **Lesson mode after the move**: Create an exercise still makes a round, and the last one saved before the move still opens (Task 1, step 4).

---

### Task 1: Move the exercise into `features/make-exercise`

**Files:**

- Move (`git mv`): `src/pages/call/ui/MakeExercise.tsx` → `src/features/make-exercise/ui/MakeExercise.tsx`
- Move: `src/pages/call/model/normalize.ts` → `src/features/make-exercise/model/normalize.ts`
- Move: `src/pages/call/model/types.ts` → `src/features/make-exercise/model/types.ts`
- Move: `src/pages/call/i18n/makeExercise.ts` → `src/features/make-exercise/i18n/makeExercise.ts`
- Create: `src/features/make-exercise/ui/ExerciseRound.tsx` (the `ExerciseRound` function and `gradeAnswer`, cut out of `MakeExercise.tsx`)
- Create: `src/features/make-exercise/index.ts`
- Modify: `src/pages/call/ui/LessonMode.tsx:42-45` (imports)
- Modify: `api/analyze.ts:31-32` (the comment's path), README's project structure if it lists `pages/call/model`

**Interfaces:**

- Produces: `index.ts` exports `MakeExercise` (default of `ui/MakeExercise.tsx`), `ExerciseRound` (default of `ui/ExerciseRound.tsx`), `GroupExercise` (added in Task 2), `makeExerciseText`, `normalizeExercise`, `type MadeExercise`, `type ExerciseQuestion`, and `MIN_GROUP_WORDS` (added in Task 2).
- `ExerciseRound` props: `{ exercise: MadeExercise; onClose: () => void; onAnother?: () => void }`. **Make another** calls `onAnother ?? onClose`, so lesson mode keeps its behaviour (back to the form).

- [ ] **Step 1: Move the four files with `git mv`** (history kept), and fix their relative imports (`../i18n/makeExercise`, `../model/...` keep working inside the feature).
- [ ] **Step 2: Cut `ExerciseRound` and `gradeAnswer` into `ui/ExerciseRound.tsx`** as its default export, add `onAnother`, and import it in `MakeExercise.tsx`.
- [ ] **Step 3: Write `index.ts`** with the exports above (the file comment says it is the feature's public API, as in `src/features/gap-fill/index.ts`), and change `LessonMode.tsx` to `import { MakeExercise, makeExerciseText } from '@/features/make-exercise'`. Delete `src/pages/call/model/` if nothing else is left in it.
- [ ] **Step 4: Verify.** Run `yarn verify`: lint, format, typecheck and Steiger pass. In the running app (`yarn start`), lesson mode's Create an exercise makes a round, and **Open the last one** opens one made before the move.

---

### Task 2: `GroupExercise` and the words it sends

**Files:**

- Create: `src/features/make-exercise/model/groupWords.ts`
- Create: `src/features/make-exercise/ui/GroupExercise.tsx`
- Modify: `src/features/make-exercise/index.ts`, `src/features/make-exercise/i18n/makeExercise.ts`

**Interfaces:**

- Consumes: `ExerciseRound`, `normalizeExercise`, `makeExerciseText` (Task 1); `api.exercise` (`src/shared/api`); `pickWords` (`@/entities/lesson`); `getProgress`, `type Word` (`@/entities/word`); `getSettings`, `translationLanguage`, `type Language` (`@/shared/config`).
- Produces: `export const MIN_GROUP_WORDS = 3`; `export function wordsForGroupExercise(words: Word[], progress: Progress): { language: Language; words: string[] } | null`; the default export `GroupExercise({ words, name, onClose }: { words: Word[]; name: string; onClose: () => void })`.

- [ ] **Step 1: Add the texts** to `makeExerciseText`, English first: `groupButton: 'Exercise'`, `groupLabel: 'An exercise on the words of “{name}”'`, `groupTooltip: '15 questions by Claude on these words'`, `groupTooFew: { one: 'Tick at least {count} word of this group', other: 'Tick at least {count} words of this group' }` (all four plural forms where the language has them). Then hand the six other languages to the `translator` agent.
- [ ] **Step 2: Write `wordsForGroupExercise`** in `model/groupWords.ts`: take the most common `word.language ?? 'fr'` among `words`, keep the words in it, return `null` below `MIN_GROUP_WORDS`, else at most `MAX_GROUP_WORDS` (30) of them through `pickWords(…, progress, MAX_GROUP_WORDS)`, as their `fr`. Constants named with a comment, as in Global Constraints.
- [ ] **Step 3: Write `GroupExercise`**: on mount (and on **Make another**) it calls `api.exercise({ language, level: getSettings().levels[language], grammar: '', words, count: GROUP_QUESTIONS })`, normalizes with `normalizeExercise(raw, language, translationLanguage(language))`, and renders `ExerciseRound` with `onClose` and `onAnother`. While waiting: an `ExerciseHead` with the group's name and a close button, then `WaitingFact` with `making`. On failure: `role="alert"` note with the `ApiError` message (or `failed`, read through `translator(makeExerciseText)` at that moment) and **Try again**. The effect uses a run counter in its dependency list and a `let alive = true` guard. No `save`.
- [ ] **Step 4: Export** `GroupExercise` and `MIN_GROUP_WORDS` from `index.ts`. Run `yarn verify`: passes.

---

### Task 3: The button in `WordsTab`

**Files:**

- Modify: `src/widgets/word-list/ui/WordsTab.tsx`
- Modify: `src/app/styles.css` (the word groups rules, near `.word-group-name`, line ~1604)

**Interfaces:**

- Consumes: `GroupExercise`, `MIN_GROUP_WORDS`, `makeExerciseText` from `@/features/make-exercise`.

- [ ] **Step 1: State.** Add `'group'` to the `Exercise` union and `const [groupRound, setGroupRound] = useState<{ name: string; words: Word[] } | null>(null)`; the snapshot of words is taken when the button is pressed, so a list that changes under the round doesn't change it. When `exercise === 'group' && groupRound`, return `<GroupExercise key={run} words={groupRound.words} name={groupRound.name} onClose={close} />`.
- [ ] **Step 2: The heading row.** When `hasGroups`, wrap the `<h2 className="word-group-name">` and a new button in `<div className="word-group-head">`. The button is shown only when `hasClaude`; it uses the group's ticked words from `groups` (not the filtered `list`, so typing in Filter words doesn't shrink the round); `aria-label={t('groupLabel', { name })}` with the shown name (`listed.name || t('otherGroup')` from `exercises`), `data-tooltip` = `groupTooltip`, or `groupTooFew` with `count: MIN_GROUP_WORDS` when disabled (fewer than `MIN_GROUP_WORDS` ticked words).
- [ ] **Step 3: CSS.** `.word-group-head`: flex, baseline-aligned, the name first and the button after it, wrapping on narrow screens; the `h2`'s bottom margin moves to the row. Use the existing small/ghost button classes from Shared pieces; colours only through variables.
- [ ] **Step 4: Verify in the running app** (the `run-languageswithvlad` skill): on a lesson's Words tab, the button makes a 15-question round on the group; **Make another** asks for a new one; closing while it loads leaves no error in the console; a group with fewer than 3 ticked words has the button disabled with its tooltip; on Words to learn a group with words of two languages gives a round in one of them; a long group name at 390 px wraps without sideways scroll, in light and dark. `yarn verify` passes.

---

### Task 4: README, Tutorial, News

**Files:**

- Modify: `README.md` (the **Words** bullet, line 31; the lesson-mode `Create an exercise` mention if it names the file)
- Modify: `src/pages/tutorial/i18n/tutorial.ts` (`lessons.tip8`, all seven languages)
- Modify: `src/entities/news/model/news.ts` (a `kind: 'new'` item under `2026-11-22`)

- [ ] **Step 1: README**: in the Words bullet, after the group sentence: “**Exercise** next to a group's name makes a 15-question round by Claude on its ticked words (choose the answer, fill the gap, translate), as Create an exercise does in lesson mode.”
- [ ] **Step 2: Tutorial**: extend `lessons.tip8` in English: “… the exercises then use only them. <b>Exercise</b> next to a group's name makes 15 mixed questions on its words.” Then the `translator` agent for the other six.
- [ ] **Step 3: News**: English text: “Each group of words in a lesson and on Words to learn now has an Exercise button: Claude writes 15 mixed questions on that group’s words (choose the answer, fill the gap, translate a sentence), each answer explained.” Then the `translator` agent.
- [ ] **Step 4: Verify.** `yarn verify` passes; the News page shows the item and the Tutorial's lessons card shows the tip, in two interface languages.
