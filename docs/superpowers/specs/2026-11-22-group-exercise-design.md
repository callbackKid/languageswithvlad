# An exercise on one group of words — design

## Why

A lesson's words are sorted into groups by meaning (Food, Time…). The student can already choose a group in the filters and use the existing exercises on its words, but the richest one, the mixed round written by Claude (choose the answer, fill the gap, translate a sentence, each answer explained), exists only in lesson mode. The student wants it on one group in one click: a button next to the group's name that makes a 15-question round on its words.

## Goals

- A button next to each group's heading in a grouped word list makes a 15-question mixed round on that group's words, and the student does it right there.
- No choices before it starts: the level is the student's level in Settings for that language, the count is 15.
- The same round as lesson mode: one shared component, not a copy.

## Non-goals

- New kinds of questions (listening, matching) inside the round: that is the bigger exercise builder in TODO.md.
- Saving the round: closing it returns to the list, and the button makes a new one.
- Any change to the server or the prompt: `api.exercise` already takes a word list and up to 15 questions (`MAX_EXERCISE_QUESTIONS`).

## Approaches

- **A. Reuse the lesson-mode round (chosen).** One Claude call (`api.exercise`) with the group's words, `count: 15`. The round component moves from `pages/call` into a feature both places use. Least work, with explanations, and the start of the exercise builder.
- **B. One long round from the app's own exercises** (quiz, gap sentences, dictation one after another). More variety and partly without Claude, but each exercise has its own screen and score today: it needs a shared runner, several times the work, and answers without explanations.

## Design

- **Move** `MakeExercise.tsx` (the form and `ExerciseRound`), `model/types.ts`, `model/normalize.ts` and `i18n/makeExercise.ts` from `src/pages/call/` to a new feature `src/features/make-exercise/`. Its `index.ts` exports `MakeExercise` (lesson mode's form, unchanged) and a new `GroupExercise`. Lesson mode imports from `@/features/make-exercise`.
- **`GroupExercise`** takes the words and the group's name: it asks `api.exercise({ language, level, grammar: '', words, count: 15 })`, shows `WaitingFact` while waiting, an error with **Try again** if it fails, then the `ExerciseRound`. **Again** replays the same questions; **Make another** asks for a new round. Closing returns to the word list.
- **`WordsTab`**: in a grouped list, the heading row of each group gets a small button (text, e.g. “Exercise”, with `aria-label` naming the group and a `data-tooltip`), outside the `<h2>`. Shown only when `hasClaude`. While a group's round runs, the tab shows it instead of the list, like the other exercises (`exercise === 'group'` plus the group's name).
- **Which words:** the group's ticked words (the tab's rule: exercises use the ticked words), at most 30 (`MAX_EXERCISE_WORDS`, the weaker ones first through `pickWords`). The button is disabled below 3 ticked words (a named constant), with a tooltip saying why.
- **Language:** a lesson's words share one language. On Words to learn a group can mix languages: the round uses the language most of its words are in, and only those words.
- **Where it shows:** every grouped list: a lesson's Words tab, Words to learn and handwritten notes.
- **Texts:** new keys in the feature's `i18n/makeExercise.ts` (button, its label and tooltip, the too-few-words tooltip), English first, then the `translator` agent for the other six.
- **Docs:** a line in the README (Words), a tip in the Tutorial's lessons card, and a News entry for students.

## Calls left to the builder

- The button's exact look in the heading row; it must fit at 390 px next to a long group name, in both themes.
- Keeping `exercise:last` working for lesson mode after the move (same storage key).
