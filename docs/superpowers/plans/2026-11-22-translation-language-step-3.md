# Translation language, step 3: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gap sentences, the blitz definitions, Create an exercise, grammar practice, Discuss and
Make homework follow **Translations in**. Make homework gets its own language picker, and no
prompt calls the learner "Russian-speaking" any more.

**Architecture:** In these requests the learned language is known before the call. So the client
sends one resolved language, `translateTo: translationLanguage(language)`, and the prompt writes
in it. Explanations next to grammar (`why`, `grammarTip`, `grammarRule`) keep following the
interface language (`explainIn`). Make homework sends the language of its picker, together with a
fallback, because Claude works out the lesson's language itself.

**Tech Stack:** React 19 + TypeScript + Vite, Vercel functions in `api/`, Claude.

**Spec:** [docs/superpowers/specs/2026-11-22-translation-language-design.md](../specs/2026-11-22-translation-language-design.md)
(step 3). It builds on step 1 (c4978bb) and step 2:

- `translationLanguage`, `useTranslationLanguage` and `translationFields` in `@/shared/config`;
- `asTranslationRequest`, `translationRule` and `TranslationRequest` in `api/_lib/prompts.ts`.

## Global Constraints

- Field names never change: `ru` in gaps, exercises, practice and Discuss, and `translation` in
  Discuss examples, hold the translation language from now on.
- `discuss:last` and `exercise:last` aren't redone. Their `lang` follows the current setting.
- `grammarTip`, `grammarRule` (apart from its examples' `translation`), grammar practice's `why`,
  the written-homework check and word-group names keep `explainIn`.
- Prompts only in `api/_lib/prompts.ts`. The server reads `translateTo` with `asExplainLanguage`
  (Russian when missing).
- New texts: English first, then the `translator` agent fills the other six. A News entry. Make
  homework's picker is a teacher's tool: the News item gets `audience: 'teacher'`.
- The TODO item "Язык переводов: не только русский" already left TODO.md in fd6b989, so there is
  nothing to remove.
- **Tests are the owner's** (the "Tests for the owner" blocks). Each task is checked with
  `yarn verify` and in the running app.
- Commit only when the owner asks. Never `--no-verify`.

## Review Focus

1. **Meanings sent in a mix of languages.** Gap and blitz requests send the words' `ru`, and a
   word kept from before the switch (mistakes, Words to learn) still has a Russian one. The prompt
   says the meanings may be in another language, and still writes `ru` in the asked language
   (Task 1).
2. **A lesson in the translation language itself.** With translations in French on a French
   lesson, gaps, exercises and Discuss get `translationLanguage('fr')`, which is the fallback
   (Task 2).
3. **Discuss with two languages at once.** With the interface in English and translations in
   Russian, the grammar tip is English and the question's translation is Russian, each with its
   own `lang` (Task 3).
4. **Make homework's remembered choice.** A stored value that isn't one of the seven languages
   falls back to the teacher's `translateTo` (Task 4).
5. **No prompt left behind.** `grep -c "Russian-speaking" api/_lib/prompts.ts` prints `0` (Task 1).

---

### Task 1: The prompts and endpoints

**Files:**

- Modify: `api/_lib/prompts.ts`:
  - `gapPrompt`, `definitionPrompt`, `exercisePrompt`, `grammarPracticePrompt`,
    `discussionPrompt` (and `DiscussionRequest`), `homeworkPrompt`;
  - wording only: `lessonExtrasPrompt`, `wordGroupsPrompt`, `writingCheckPrompt`,
    `transcribePrompt`, `bookExercisesPrompt`.
- Modify: `api/gaps.ts`, `api/discussion.ts`, `api/analyze.ts` (practice, exercise and homework branches)

**Interfaces:**

- Produces:

  - `gapPrompt(words, count, language, level, translateTo: ExplainLanguage)`
  - `definitionPrompt(words, language, level, translateTo: ExplainLanguage)`
  - `exercisePrompt({ ..., translateTo: ExplainLanguage })`
  - `grammarPracticePrompt({ ..., translateTo: ExplainLanguage })`
  - `DiscussionRequest.translateTo: ExplainLanguage`
  - `homeworkPrompt({ ..., translation: TranslationRequest })`
  - Body fields: `translateTo` on `/api/gaps`, `/api/discussion` and the analyze actions
    `practice` and `exercise`; `translateTo` and `translateFallback` on `homework`.

- [ ] **Step 1: Tests for the owner** (`api/_lib/prompts.test.ts`)

```ts
expect(gapPrompt(words, 4, 'fr', 'A1', 'en')).toContain(
  'English translation of the whole sentence'
);
expect(definitionPrompt(words, 'fr', 'A1', 'de')).toContain('meaning in German');
expect(
  homeworkPrompt({
    body,
    keyWords: [],
    level: 'A2',
    sentences: 4,
    translation: { language: 'es', fallback: 'en' },
  })
).toContain('in Spanish');
expect(
  discussionPrompt({
    language: 'fr',
    level: 'A2',
    topic: '',
    grammar: '',
    explainIn: 'en',
    translateTo: 'ru',
  })
).toMatch(/ru: its Russian translation/);
// and, across the file:
expect(readFileSync('api/_lib/prompts.ts', 'utf8')).not.toContain('Russian-speaking');
```

- [ ] **Step 2: Rewrite the prompts** (`X` = `EXPLAIN_NAMES[translateTo]`)

  - **gaps:** `ru` is "a ${X} translation of the whole sentence". The word list's header says
    "each with its meaning; a meaning may be in another language".
  - **definitions:** "(with its meaning in this lesson, possibly in another language)". The
    definition still never contains the word's translation.
  - **exercise:**
    - `"translate"` prompts are "a short everyday ${X} sentence";
    - `ru` and `explanation` are in `X`, and so is `title`;
    - `translationRule({ language: translateTo, fallback: translateTo }, 'text')` replaces
      step 2's Russian placeholder line.
  - **practice:** `ru` is in `X`; `why` keeps `explainIn`.
  - **discussion:** `ru`, `vocabulary[].ru` and `grammarRule.examples[].translation` are in `X`;
    the student is "at CEFR level …", not "Russian-speaking".
  - **homework:**
    - "translate: exactly N short sentences in ${X} (in ${Y} for a lesson in ${X} itself)";
    - for Russian, without the parenthesis;
    - the notes "mix that language with translations, often Russian".
  - **Wording only:** "Russian-speaking learner/student" becomes "learner/student". In
    `lessonExtrasPrompt` and `transcribePrompt`, "Russian translations" becomes "translations
    (often Russian)".

- [ ] **Step 3: Wire the endpoints**

  - `asExplainLanguage(body.translateTo)` goes to gaps, definitions, discussion, practice and
    exercise.
  - `asTranslationRequest(request.body)` goes to homework.

- [ ] **Step 4: Verify**: `yarn typecheck` passes, and `grep -c "Russian-speaking" api/_lib/prompts.ts` prints `0`.

- [ ] **Step 5: Commit** (when asked)

---

### Task 2: The client sends the language

**Files:**

- Modify: `src/shared/api/index.ts`: `gaps`, `definitions`, `grammarPractice`, `exercise`, `discussion`
- Callers stay as they are where the API function can resolve the language from its own
  `language` argument.

**Interfaces:**

- Consumes: `translationLanguage(learned)` (step 1), the body field `translateTo` (Task 1).
- Produces: each of the five functions adds `translateTo: translationLanguage(language)` to its
  body itself, so `GapFill`, `WordBlitz`, `LessonExtrasTabs`, `MakeExercise` and `Discuss` don't
  change their calls.

- [ ] **Step 1: Add the field in the five functions.**
- [ ] **Step 2: Verify in the app**
  - On English, Fill the gap, the blitz, a grammar practice round, Create an exercise (teacher
    code `test-teacher`) and Discuss each send `translateTo: "en"` (DevTools → Network,
    under `yarn start`).
  - With translations in French on the French test lesson, they send the fallback.
  - `yarn verify` passes.
- [ ] **Step 3: Commit** (when asked)

---

### Task 3: `lang` attributes and comments

**Files:**

- Modify (→ `lang={translationOf(language)}`, with `const translationOf = useTranslationLanguage()`):
  - `src/features/gap-fill/ui/GapFill.tsx:178`
  - `src/pages/call/ui/MakeExercise.tsx:242` (the `'ru'` of `isTranslate`), `:252`, `:323`
  - `src/widgets/discussion/ui/Discuss.tsx:561`, `:619`, and the `lang` of
    `grammarRule.examples[].translation`
  - `src/features/quiz/ui/WordQuiz.tsx`: the gap line's `'ru'`, together with the comment above it
- Modify comments:

  - `src/pages/call/model/types.ts:4,13,15`
  - `src/widgets/word-list/ui/Flashcards.tsx:21`: "into the translation language"

- [ ] **Step 1: Replace them.** `grammarTip` and the rest of `grammarRule` keep `lang={uiLanguage}`.
- [ ] **Step 2: Verify**
  - `grep -rn "lang=\"ru\"\|? 'ru'" src` prints nothing.
  - In the app, Discuss with the interface in English and translations in Russian: the tip is
    `lang="en"` and the question's translation is `lang="ru"`.
  - `yarn verify` passes.
- [ ] **Step 3: Commit** (when asked)

---

### Task 4: Make homework's language picker

**Files:**

- Modify: `src/features/make-homework/ui/MakeHomework.tsx` (the options row and `make()`)
- Modify: `src/shared/api/index.ts` (`makeHomework`)
- Modify: `src/shared/i18n/messages/homework.ts` (one key)

**Interfaces:**

- Consumes: `translationFields(translateTo)` (step 2), `UI_LANGUAGES`, `load`/`save`.
- Produces:

  - `api.makeHomework(input: { body: string; keyWords: string[]; level: string; sentences: number; translateTo: UiLanguage })`
    spreads `translationFields(input.translateTo)` into the body.
  - Storage key `'homework:translate-to'`.

- [ ] **Step 1: The picker**
  - A third `<label className="form-field">` in `make-homework-options`, after the level, with a
    `<select>` over `UI_LANGUAGES` (flag and name).
  - State starts from `load<string>('homework:translate-to')` when it is one of `UI_LANGUAGES`,
    else `getSettings().translateTo`.
  - On change, `save` it.
  - English text: `makeTranslateTo: 'Sentences to translate in'`. Then the `translator` agent.
- [ ] **Step 2: Send it**: `make()` passes `translateTo` to `api.makeHomework`.
- [ ] **Step 3: Verify**
  - With the teacher code on, the picker shows the teacher's setting.
  - Choosing Spanish sends `translateTo: "es"`, and the choice survives a reload.
  - A hand-edited `cahier-fr:homework:translate-to` of `"xx"` falls back.
  - Light and dark at 390 px, the options row wraps without sideways scroll.
  - `yarn verify` passes.
- [ ] **Step 4: Commit** (when asked)

---

### Task 5: README, Tutorial and News

**Files:**

- Modify: `README.md`:
  - drop "Exercise sentences and Discuss are still in Russian" from Settings;
  - the Discuss line says its translations follow Translations in while the grammar tip follows
    the interface;
  - the Make homework line mentions the picker.
- Modify: `src/pages/tutorial/i18n/tutorial.ts:196` ("shows it in Russian" → "shows its
  translation"); in `settings.tip1`, "word and verb translations" becomes "translations from
  Claude". Then the `translator` agent.
- Modify: `src/entities/news/model/news.ts`: two items for the day it ships.

  - `kind: 'better'`: "Fill the gap, the vocabulary blitz, grammar practice, Create an exercise
    and Discuss now translate into the language chosen under Translations in."
  - `kind: 'new'`, `audience: 'teacher'`: "Make homework: choose the language of the sentences
    to translate."
  - Then the `translator` agent.

- [ ] **Step 1: Write the English, then the translations.**
- [ ] **Step 2: Final check**
  - `yarn verify` passes.
  - In the app on Russian and on English: Fill the gap, the blitz, grammar practice, lesson mode's
    Create an exercise, Discuss, Make homework and the Tutorial's Settings card.
  - Light and dark at 390 px, no console errors.
- [ ] **Step 3: Commit** (when asked)
