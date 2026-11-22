# Translation language: not only Russian — design

Date: 2026-11-22. TODO item: "Язык переводов: не только русский" (TODO.md, section 3).

## Intent

The app is for a wider audience, not one student. Today everything Claude writes for the learner as a
translation is in Russian, because the prompts say so. A student who doesn't read Russian can use the
interface in seven languages but gets every word translation, sentence translation and explanation of
a selected word in Russian. After this change, the student chooses the language translations are
written in.

## Goals

- A **Translations in** setting with the seven interface languages (en, ru, fr, de, es, pt, it).
- Every translation Claude writes for the learner follows it: word and verb translations, the word
  menu, Photo, Text, gap and exercise sentences, Discuss's translations, Make homework's sentences.
- Students already using the app see no change and pay for nothing again.

## Non-goals

- Grammar explanations, word-group names, the written-homework check and Discuss's grammar tip keep
  following the **interface** language (`explainIn`), as today.
- The teacher's notes are not rewritten. They keep their Russian translations; nothing in the
  document is converted.
- No new interface language (the second bullet of the TODO item stays in TODO.md).
- Results kept from before (`photo:last`, `exercise:last`, `discuss`, saved texts in `reader:texts`)
  are not redone when the setting changes; they show what they were made with, and the next request
  uses the new language.

## Anti-goals

- Bumping `an2:` or the `conj:` keys. A Russian-speaking student must hit the same cache as today.
- Translations silently switching for an existing student, e.g. because their browser is English.
- Translating through Russian (Claude answers in Russian, a second call translates).

## Constraints

- Stored and Claude-returned field names never change: `ru`, `baseRu`, `definitionRu` hold the
  chosen translation language from now on. Only comments and prompts say what they hold.
- Prompts live only in `api/_lib/prompts.ts`; Claude's JSON goes through the existing `normalizeX`.
- FSD layers; new interface texts in all seven languages (English first, then the `translator`
  agent); a News entry; README; TODO.md updated.
- The server reads the new field defensively and falls back to Russian when it's missing, so an old
  client tab keeps working.

## Approaches considered

1. **The language travels in each request and every prompt writes in it** — chosen. One Claude call
   per thing as today, natural translations, TypeScript finds every caller. A wide change (about 20
   prompts and their callers) but each edit is small.
2. Claude keeps answering in Russian and a second, cheap call translates — rejected: two calls and
   double waiting, nuance lost through Russian (gender, register, `sense`), and Russian stays the
   centre of an app meant for everyone.
3. Ask for all seven languages at once — rejected: seven times the output, almost all of it unused.

## Decisions made with the owner

- Separate setting, not the interface language (option A).
- Approach 1 above.
- Make homework (teacher's tool) gets its own **language picker** for its sentences to translate.
- Three shippable steps (below).

## Design

### The setting

- `Settings` (`src/shared/config/settings.ts`) gains `translateTo: UiLanguage`. `sanitize` keeps a
  valid stored value. When the field is missing:
  - a student who used the app before — settings already saved, or any `an2:` key on the device —
    gets `'ru'`;
  - a new student gets their interface language.
- Settings page: a **Translations in** select next to the interface language, with a one-line hint
  ("Word and sentence translations from Claude"). Changing it says lessons will be prepared again in
  that language when opened.
- A resolver used everywhere (plain function plus a hook, in `shared/config`):
  `translationLanguage(learned?: Language): UiLanguage` returns `translateTo`, unless it equals the
  language being learned; then the interface language; if that is also the learned language, English
  (and for a learner of English, Russian).
- README's Settings line ("Word translations stay in Russian") changes.

### Requests and prompts

- The client sends `translateTo` in the body of every request below; the server reads it with
  `asExplainLanguage` (Russian when missing) — rename it to something neutral only if it reads
  better, the type `ExplainLanguage` already has the seven names.
- Where the learned language is known before the call (conjugation, gaps, definitions, discussion,
  exercise, grammar practice, Make homework), the client sends the resolved language.
- Where Claude finds out the language itself (lesson analysis, Photo, the word menu, Text, textbook
  PDF), the client sends `translateTo` and the fallback, and the prompt says: "write translations in
  X; if the text itself is in X, in Y". The fallback is computed by the client with the same
  resolver rules.
- Every "Russian-speaking learner/student" in a prompt becomes "a learner whose own language is X"
  (or a neutral "learner" where the language doesn't matter: transcription, book exercises, the
  writing check, word groups).
- The prompts that mention the teacher's Russian translations (analysis, lesson extras, homework)
  say the notes mix the language with translations, often Russian, and that Claude uses the
  teacher's translation as the meaning and writes it in X (still `added: false` when it came from the
  teacher).
- Russian examples inside prompts (удалить/вырезать, les collines — холмы, шваб) may stay as
  illustrations; the builder judges per prompt whether they mislead for other languages.

| Prompt                                                                                                    | What follows `translateTo`                                                                     |
| --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `analysisPrompt`                                                                                          | `words[].ru`, `verbs[].ru`                                                                     |
| `conjugationPrompt`                                                                                       | `ru`                                                                                           |
| `gapPrompt`                                                                                               | `ru` of each sentence (the word list's meanings come in the chosen language too)               |
| `definitionPrompt`                                                                                        | the meaning it is given; the definition itself stays in the learned language                   |
| `photoPrompt`                                                                                             | `ru`, `explanation`                                                                            |
| `wordPrompt`                                                                                              | `ru`, `explanation`, `baseRu`, `definitionRu`, `examples[].ru`                                 |
| `exercisePrompt`                                                                                          | "translate" prompts, `ru`, `explanation`, `title`                                              |
| `translatePrompt`                                                                                         | the whole translation                                                                          |
| `studyPrompt`                                                                                             | `words[].ru`, `questions[].ru`, `statements[].ru`, `why`                                       |
| `textbookPrompt`                                                                                          | the rule and the example translations in the notes it writes                                   |
| `discussionPrompt`                                                                                        | `ru`, `vocabulary[].ru`, `examples[].translation`; `grammarTip`/`grammarRule` stay `explainIn` |
| `grammarPracticePrompt`                                                                                   | `ru`; `why` stays `explainIn`                                                                  |
| `homeworkPrompt`                                                                                          | the sentences to translate — in the language of Make homework's picker                         |
| `lessonExtrasPrompt`, `wordGroupsPrompt`, `writingCheckPrompt`, `transcribePrompt`, `bookExercisesPrompt` | wording only                                                                                   |

`explanation` in `photoPrompt`, `wordPrompt` and `exercisePrompt` goes with the translation language,
not `explainIn`, because it sits next to the translation and the learner reads both together (my
call; today these are Russian).

### Caches

- `analysisKey(hash, language)`: `'an2:' + hash` for `ru`, `'an2:' + hash + ':' + language` otherwise.
  Every reader and writer (`bank.ts`, `LessonView.tsx`) passes the current translation language.
- `conjugationKey(infinitive, verbLanguage, translateTo)`: today's key for `ru`, `:` + language
  appended otherwise.
- `analyzeOnce`'s in-flight key includes the language.
- The word menu's `cardKey` includes the language for anything but `ru` (Russian keeps its saved
  cards).
- The server's in-memory cache is keyed by the prompt, which now contains the language: nothing to do.
- Changing the setting makes the next opening of each lesson a new Claude call for that language; the
  old analysis stays on the device, so switching back is free.

### Logic tied to Russian

- **Quiz overlap** (`src/entities/lesson/model/quiz.ts`, `russianWords`/`FILLER`/`overlaps`): split
  the translation into words of any alphabet (`\p{L}`), lowercase, `ё`→`е`. `FILLER` stays the
  Russian list. A false overlap in another language only drops a wrong-answer candidate, never makes
  a right answer wrong; `sense` remains the main guard. Rename `russianWords` to fit.
- **Dictation** (`dictationForm`): the French adjective's gender is read from the ending of the
  translation where that language shows it — Russian (as today), Spanish, Italian, Portuguese
  (`-o`/`-a`, first word). English, German and French translations give `null`, as a Russian plural
  does today (no hint). README's Exercises line changes accordingly.
- **`lang="ru"`** on translations (24 places in 12 files) becomes `lang={translationLanguage}` from the
  hook. Where the translation came from a stored analysis, use the language it was made in when
  that is known; otherwise the current setting.
- The teacher's transcription in Cyrillic (`tr`) and the document parsers stay as they are.
- **Add to lesson** writes `word — translation` with the translation the student sees.

### Make homework's picker

- A select **Sentences to translate in** in Make homework (`src/features/make-homework`), the seven
  languages, defaulting to the teacher's own translation language; the last choice is remembered on
  the device (`load`/`save`). It goes to the server as the homework's translation language.

## Steps (each ships on its own)

1. The setting and resolver, lesson analysis (`analysisPrompt`, cache key), verbs (conjugation and
   its key), the quiz overlap, dictation, `lang` attributes for word translations, Add to lesson.
2. The word menu, Photo, Text (translation and study), textbook PDF.
3. Gap sentences, the blitz definitions, Create an exercise, grammar practice, Discuss, Make homework
   with its picker.

Until a step ships, its parts stay in Russian. Each step: `yarn verify`, the changed pages in the
running app (light, dark, 390 px), with the setting on Russian (no new Claude call for a prepared
lesson) and on another language. The News entry and README go with step 1 (and are updated by 2 and
3); the TODO bullet is removed after step 3.

## Left to the builder

- The exact Settings and picker wording (English first, then the `translator` agent).
- The resolver's name and where in `shared/config` it lives.
- How the "used the app before" check finds an `an2:` key (the storage helper may need a small
  `hasKey(prefix)`).
- Whether a prompt's Russian examples stay.
- Small fillers for other languages in the quiz overlap, if testing shows bad candidates.
