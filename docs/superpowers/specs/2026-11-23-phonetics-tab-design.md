# A lesson's Phonetics tab — design

## Why

The last feature before the MVP. Teachers write pronunciation points in the lesson notes (a sound, a reading rule, liaison, stress). The student should find them explained like the Grammar tab's rules, and practise each with a round of questions.

## Goals

- A **Phonetics** tab between Grammar and Homework (hideable in Settings like the others).
- The first time it opens, Claude reads the lesson notes for pronunciation points only; the answer is kept on the device under `phonetics:<lesson hash>:<interface language>`, apart from the Grammar tab's `extras:` reading, so lessons prepared before don't have to be read again and a lesson nobody opens costs nothing.
- Each point shown like a grammar rule (`GrammarRuleBox`): title, summary, **How it sounds** (2–5 reading rules), examples with IPA transcription, 🔊 and translation, the usual mistake. “This lesson has no phonetics.” when there are none.
- **Practise** under each point: 8 choice questions by Claude at the student's level (which word has the sound, which transcription is right, which letter is silent, which word was heard). A question can carry a word to read aloud (`say`, a 🔊 in the prompt), but can be answered without sound. The round is the one Create an exercise already has.

## Non-goals

- Checking the student's own pronunciation with the microphone (Safari's speech recognition is unreliable).
- Re-reading phonetics on “Prepare this lesson again”: like Grammar, it follows the lesson text (a new hash means a new reading).

## Approaches

- **A separate reading, on first opening (chosen).** No change to the cached `extras` shape, no key bump, no cost for lessons whose tab is never opened.
- **Phonetics inside the extras reading:** one request for both, but every cached lesson would lack it until read again, which means paying again per lesson and student, or a migration.
- Exercise kinds: read and choose (A), listen and choose (B), or both (C, chosen by the owner).

## Design

- Server (`api/analyze.ts`, prompts in `api/_lib/prompts.ts`): action `phonetics` (lesson body → `{language, phonetics: [{title, summary, rules, examples: [{text, transcription, translation}], pitfall}]}`) and `phonetics-practice` (title, summary, level → the made-exercise shape with `type: "choice"` and `say`).
- `entities/lesson`: `LessonPhonetics`, `normalizePhonetics` (topics shaped as `GrammarRule`, rules in `formation`); `GrammarRuleBox` gains `formationLabel` and shows an example's transcription.
- `features/make-exercise`: `say` on a question, `promptIn` on a round (questions in the interface language), and `RoundLoader`, the waiting / error / round wrapper now shared by `GroupExercise` and the Phonetics tab.
- `widgets/lesson-view/ui/PhoneticsTab.tsx`, wired in `LessonView`; `phonetics` in `LESSON_TABS`.
- README (feature, the document table row `Phonétique: …`, the tabs list), a Tutorial tip, a News entry, texts in seven languages; the TODO line removed.
