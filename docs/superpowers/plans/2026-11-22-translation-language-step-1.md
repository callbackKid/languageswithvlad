# Translation language, step 1: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A **Translations in** setting; lesson words and verb tables come from Claude in that
language, while a student who stays on Russian hits exactly today's caches.

**Architecture:** The setting lives in `Settings` (`shared/config`), with a pure resolver that
avoids translating a word into its own language. The client sends the language with the analysis
and conjugation requests and puts it in their cache keys only when it isn't Russian. The prompts in
`api/_lib/prompts.ts` write translations in it. The quiz overlap, the dictation hint and the `lang`
attributes stop assuming Russian.

**Tech Stack:** React 19 + TypeScript + Vite, Vercel functions in `api/`, Claude.

**Spec:** [docs/superpowers/specs/2026-11-22-translation-language-design.md](../specs/2026-11-22-translation-language-design.md)
(step 1 of its "Steps"). Read it first; this plan does not repeat its reasoning.

## Global Constraints

- Field names of stored and Claude-returned data never change: `ru` holds the chosen translation
  language from now on. Only comments and prompts say so.
- No bump of `an2:` or `conj:`. With `translateTo: 'ru'` every key is byte-for-byte today's.
- Prompts only in `api/_lib/prompts.ts`. Claude's JSON still goes through `normalizeAnalysis` /
  `normalizeConjugation`.
- The server reads the new body fields with `asExplainLanguage` (Russian when missing), so an old tab
  keeps working.
- FSD: the resolver in `shared/config`, which may import `@/shared/i18n` (i18n imports only
  `shared/lib/storage`, so there is no cycle).
- New texts: English first, then the `translator` agent fills ru, fr, de, es, pt, it.
- **Tests are the owner's.** The "Tests for the owner" blocks name the tests and their assertions
  for the owner to write in Vitest if they want; the implementer does not write them. Every task is
  verified with `yarn verify` and, for UI, in the running app (`run-languageswithvlad` skill: light,
  dark, 390 px).
- Commit only when the owner asks, with a message from the `commit-message` skill. Never `--no-verify`.
- Out of scope (steps 2 and 3): the word menu, Photo, Text, textbook PDF, gaps, blitz definitions,
  Create an exercise, grammar practice, Discuss, Make homework. Their `lang="ru"` stays for now.

## Review Focus

1. **A new student must not be turned into an "existing" one by their first lesson.** Their first
   analysis saves `an2:<hash>:en`, which starts with `an2:`. If the default were decided again on the
   next load, they would flip to Russian. The decided default is saved on the first load (Task 1).
2. **A Russian student pays nothing.** `analysisKey(hash, 'ru') === 'an2:' + hash`, and
   `conjugationKey('aller', 'fr', 'ru') === 'conj:aller'`. Opening a prepared lesson sends no
   `/api/analyze` request (Task 3, checked in the browser).
3. **A lesson in the translation language itself** (translations in French, learning French) gets
   translations in the fallback language, never French for French (Tasks 1 and 2).
4. **Switching the setting with lessons open.** An answer asked for in Russian must never be saved
   under the English key. The in-flight key and the saved key use the language the request was
   made with. The bank's document effect re-runs on the change, so `generation` drops late answers
   (Task 3).
5. **English, German and Romance translations in the quiz overlap.** Words like "the", "der" or
   "para" must not make every candidate "overlap" and empty the wrong-answer pool (Task 4 fillers).

Known consequence, accepted by the spec: after a switch, older lessons have no analysis in the new
language, so their words leave practice until each one is opened (only the newest is prepared by
itself). The Settings status line says so.

---

### Task 1: The setting and the resolver

**Files:**

- Modify: `src/shared/lib/storage.ts` (new helper)
- Create: `src/shared/config/translation.ts`
- Modify: `src/shared/config/settings.ts`, `src/shared/config/index.ts`
- Modify: `src/shared/config/languages.ts:1-2` and `src/shared/i18n/core.tsx:5` (the comments that
  say translations are always Russian)
- Modify: `src/pages/settings/ui/Settings.tsx` (the Interface card), `src/pages/settings/i18n/settings.ts`

**Interfaces:**

- Produces:

  - `hasSavedKey(prefix: string): boolean` in `@/shared/lib/storage`: whether any `localStorage`
    key starts with `'cahier-fr:' + prefix`. Wrapped in try/catch, false on error.
  - `Settings.translateTo: UiLanguage`
  - `defaultTranslateTo(hasHistory: boolean, uiLanguage: UiLanguage): UiLanguage`: `'ru'` when
    `hasHistory`, else `uiLanguage`.
  - In `translation.ts`, exported through `@/shared/config`:
    - `translationFallback(translateTo: UiLanguage, uiLanguage: UiLanguage): UiLanguage`: the
      interface language when it differs from `translateTo`, else `'ru'` for `'en'` and `'en'`
      for anything else.
    - `resolveTranslationLanguage(translateTo: UiLanguage, uiLanguage: UiLanguage, learned?: Language): UiLanguage`:
      `translateTo` unless it equals `learned`, then `translationFallback(...)`.
    - `translationLanguage(learned?: Language): UiLanguage`: the same, using `getSettings()` and
      `getUiLanguage()`, for code outside React.
    - `useTranslationLanguage(): (learned?: Language) => UiLanguage`: subscribes to `useSettings()`
      and `useUiLanguage()`, so a list can resolve per word.

- [ ] **Step 1: Tests for the owner** (`src/shared/config/translation.test.ts`, `settings.test.ts`)

```ts
expect(resolveTranslationLanguage('ru', 'en', 'fr')).toBe('ru');
expect(resolveTranslationLanguage('fr', 'de', 'fr')).toBe('de'); // own language → interface
expect(resolveTranslationLanguage('fr', 'fr', 'fr')).toBe('en'); // both → English
expect(resolveTranslationLanguage('en', 'en', 'en')).toBe('ru'); // learner of English → Russian
expect(resolveTranslationLanguage('es', 'en')).toBe('es'); // learned unknown
expect(defaultTranslateTo(true, 'en')).toBe('ru');
expect(defaultTranslateTo(false, 'de')).toBe('de');
```

- [ ] **Step 2: Add `hasSavedKey` to `src/shared/lib/storage.ts`**

- [ ] **Step 3: Add `translateTo` to `Settings` in `settings.ts`**

`sanitize(raw, missingTranslateTo: UiLanguage)` keeps a stored value that is one of `UI_LANGUAGES`,
else uses `missingTranslateTo`. `updateSettings` passes `current.translateTo`. At module load:

```ts
const stored = load<Partial<Settings>>(KEY);
let current = sanitize(
  stored,
  defaultTranslateTo(stored !== null || hasSavedKey('an2:'), getUiLanguage())
);
// decided once: the first lesson saves an an2: key, which must not make a new student "existing"
if (stored?.translateTo !== current.translateTo) save(KEY, current);
```

Comment on the field: `// the language Claude writes word and sentence translations in; Russian for anyone who used the app before it existed`.

- [ ] **Step 4: Create `src/shared/config/translation.ts`** with the four functions above, and
      export it from `src/shared/config/index.ts`. Update the two "always Russian" comments.

- [ ] **Step 5: Add the setting to Settings**

Below the interface-language row in the Interface card, add a labelled `<select>` (the same markup
and classes as `src/shared/ui/LanguagePicker.tsx`) over `UI_LANGUAGES`, showing flag and name. It
calls `updateSettings({ translateTo })` and then sets a local `translationChanged` flag. Under it,
add a `<small className="hint">`, and while `translationChanged` is set, a `<p role="status">`.

English texts in `src/pages/settings/i18n/settings.ts`:

```ts
translateTo: 'Translations in',
translateToHint: 'The language Claude writes word and verb translations in.',
translateToChanged: 'Each lesson is prepared again in this language when you open it; until then its words are left out of practice.',
```

Then hand the three keys to the `translator` agent for the other six languages.

- [ ] **Step 6: Verify**

`yarn verify` passes. In the app (fresh profile, browser in English): Settings shows "English". In
a profile that already has `cahier-fr:settings`, Settings shows "Русский". The select works at
390 px in both themes, and reloading keeps the choice.

- [ ] **Step 7: Commit** (when asked)

---

### Task 2: The prompts and endpoints read the language

**Files:**

- Modify: `api/_lib/prompts.ts` (`NOUN_AGREEMENT`, `analysisPrompt`, `conjugationPrompt`, a new
  helper next to `EXPLAIN_NAMES`)
- Modify: `api/analyze.ts` (the words/extras branch), `api/conjugate.ts`

**Interfaces:**

- Produces:

  - `interface TranslationRequest { language: ExplainLanguage; fallback: ExplainLanguage }`
  - `analysisPrompt(body: string, levels: Levels, translation: TranslationRequest): string`
  - `conjugationPrompt(infinitive: string, meaning: string, language: VerbLanguage, translateTo: ExplainLanguage): string`
  - Request body fields: `/api/analyze` (words) reads `translateTo` and `translateFallback`;
    `/api/conjugate` reads `translateTo`. All go through `asExplainLanguage`.

- [ ] **Step 1: Tests for the owner** (`api/_lib/prompts.test.ts`)

```ts
const ru = analysisPrompt('x', levels, { language: 'ru', fallback: 'en' });
expect(ru).toContain('in Russian');
expect(ru).not.toContain('for a lesson in Russian'); // Russian is never a learned language
const fr = analysisPrompt('x', levels, { language: 'fr', fallback: 'de' });
expect(fr).toContain('in French');
expect(fr).toContain('a lesson in French itself, in German');
expect(conjugationPrompt('gehen', 'go', 'de', 'en')).toContain('English');
```

- [ ] **Step 2: Add a helper that writes the translation sentence**

`translationRule({ language, fallback }: TranslationRequest): string` →
`Write every translation (ru) in ${EXPLAIN_NAMES[language]}` + (when `language` is one of
`LEARN_LANGUAGES`) `; for a lesson in ${name} itself, in ${EXPLAIN_NAMES[fallback]}` + `.`

- [ ] **Step 3: Reword `analysisPrompt`**

- Replace "a Russian-speaking learner" with "a learner whose own language is ${EXPLAIN_NAMES[language]}".
- Replace "written by the teacher in that language and Russian" with "written by the teacher in
  that language mixed with translations, often in Russian".
- In `words`: replace "ru is a short Russian translation: use the teacher's translation when there
  is one" with "ru is a short translation: when the teacher gave one, keep its meaning and write it
  in the translation language (added stays false)". In `verbs`: "ru is a short translation".
- Put `translationRule(...)` right after the level line.
- `NOUN_AGREEMENT`: "its Russian translation" → "its translation". Keep the Russian examples
  (les collines — холмы). They show the number rule and read fine as an illustration.
  `studyPrompt` uses the same constant, and the neutral wording is right there too.

- [ ] **Step 4: Reword `conjugationPrompt`**: `(meaning: ${meaning})` and
      `ru is a short ${EXPLAIN_NAMES[translateTo]} translation.`

- [ ] **Step 5: Wire the endpoints**

In `api/analyze.ts`, the `words` branch passes
`{ language: asExplainLanguage(request.body?.translateTo), fallback: asExplainLanguage(request.body?.translateFallback) }`.
`extras` is unchanged. In `api/conjugate.ts`, pass `asExplainLanguage(request.body?.translateTo)`.
Rename the comment "its Russian a few words" to "its translation a few words".

- [ ] **Step 6: Verify**: `yarn typecheck` passes. `yarn start`, then a `curl` POST to
      `/api/conjugate` without `translateTo` returns a Russian `ru`, and with `"translateTo":"en"` an
      English one.

- [ ] **Step 7: Commit** (when asked)

---

### Task 3: Cache keys and requests on the client

**Files:**

- Modify: `src/entities/lesson/model/bank.ts` (keys, `readAnalysis`, `readConjugation`,
  `fetchConjugation`, `useBank`, `usePreparedLesson`)
- Modify: `src/shared/api/index.ts` (`analyzeOnce`, `api.conjugate`)
- Modify: `src/widgets/lesson-view/ui/LessonView.tsx:98-125`

**Interfaces:**

- Consumes: `Settings.translateTo`, `translationLanguage`, `translationFallback`, `getUiLanguage` (Task 1);
  the body fields of Task 2.
- Produces:

  - `analysisKey(hash: string, translateTo: UiLanguage): string`: `'an2:' + hash` for `'ru'`,
    `'an2:' + hash + ':' + translateTo` otherwise.
  - `conjugationKey(infinitive: string, language: VerbLanguage, translation: UiLanguage): string`:
    today's key for `'ru'`, `+ ':' + translation` otherwise. `translation` is the _resolved_
    language (`translationLanguage(language)`), because that is what the table holds.
  - `readAnalysis(hash: string, translateTo: UiLanguage = getSettings().translateTo): Analysis | null`.
    The default keeps the one-shot readers (`HomeworkCard`, `LessonSummary`, `LessonMode`) unchanged.
  - `readConjugation(infinitive, language)` keeps its signature and resolves the translation
    language inside.
  - `api.conjugate(infinitive: string, ru: string, language: VerbLanguage, translateTo: UiLanguage, fresh = false)`.

- [ ] **Step 1: Tests for the owner** (`src/entities/lesson/model/bank.test.ts`)

```ts
expect(analysisKey('abc', 'ru')).toBe('an2:abc');
expect(analysisKey('abc', 'en')).toBe('an2:abc:en');
expect(conjugationKey('Aller', 'fr', 'ru')).toBe('conj:aller');
expect(conjugationKey('gehen', 'de', 'ru')).toBe('conj:de:gehen');
expect(conjugationKey('gehen', 'de', 'en')).toBe('conj:de:gehen:en');
```

- [ ] **Step 2: Change the keys, `readAnalysis`, `readConjugation` and `fetchConjugation`**

`fetchConjugation` resolves `translation = translationLanguage(language)` once and uses it for the
cached read, `api.conjugate` and `save`, so the request and the key always agree.

- [ ] **Step 3: Send the language from `analyzeOnce`**

Read `translateTo` from `getSettings()` once. Send `translateTo` and
`translateFallback: translationFallback(translateTo, getUiLanguage())` next to `levels`. The
in-flight key becomes `` `${fresh ? 1 : 0}:${translateTo}:${body}` ``. `api.conjugate` sends `translateTo`.

- [ ] **Step 4: Pass the language explicitly in the hooks**

`useBank`: take `translateTo` from the `useSettings()` call it already makes (move that call to the
top of the hook). Pass it to every `readAnalysis` and `analysisKey` call, and add it to the deps of
the document effect (so `generation` bumps on a switch) and of the prepare effect.
`usePreparedLesson` and `LessonView`'s analysis effect do the same with their own `useSettings()`.
Each `save(analysisKey(...))` uses the `translateTo` captured when the request started.

- [ ] **Step 5: Verify in the app**

- On Russian: open a lesson prepared before this change. DevTools Network shows no
  `/api/analyze`, and the Verbs tab opens a cached table with no `/api/conjugate`.
- Switch to English: the lesson is prepared again, words and verbs come in English, and the
  Lessons page shows older lessons as not prepared.
- Switch back to Russian: everything shows again with no request.
- Translations in French while learning French: the words come in the interface language.
- `yarn verify` passes.

- [ ] **Step 6: Commit** (when asked)

---

### Task 4: The quiz overlap and the dictation hint

**Files:**

- Modify: `src/entities/lesson/model/quiz.ts:113-181`
- Modify: `src/features/quiz/ui/WordQuiz.tsx:205` (the `dictationForm` call)

**Interfaces:**

- Consumes: `useTranslationLanguage` (Task 1).
- Produces: `dictationForm(word: Word, translation: UiLanguage): DictationForm | null`.
  `translationWords(text: string): string[]` replaces `russianWords` (module-private).

- [ ] **Step 1: Tests for the owner** (`src/entities/lesson/model/quiz.test.ts`, through `buildQuiz`
      or by exporting `translationWords` for the test)

```ts
expect(translationWords('Ёлка, выделить')).toEqual(['елка', 'выделить']);
expect(translationWords('the house')).toEqual(['house']); // filler dropped
expect(translationWords('la maison')).toEqual(['maison']); // "la" is under 3 letters
expect(dictationForm(adjective('grec', 'греческая'), 'ru')).toBe('feminine');
expect(dictationForm(adjective('grec', 'griega'), 'es')).toBe('feminine');
expect(dictationForm(adjective('bleu', 'azzurro'), 'it')).toBe('masculine');
expect(dictationForm(adjective('bleu', 'verde'), 'pt')).toBeNull();
expect(dictationForm(adjective('grec', 'Greek'), 'en')).toBeNull();
```

- [ ] **Step 2: `translationWords`**: split on `/[^\p{L}]+/u` after lowercasing and `ё`→`е`. Keep
      parts longer than 2 letters that are not in `FILLER`. Extend `FILLER` with short function words
      of the other languages, one commented line per language:
      `the and for with from` · `der die das und mit sich ein eine` · `les une des pour avec dans` ·
      `los las una del con para por` · `uma dos das com para por` · `una del della con per`.
      Rename the comment above `overlaps` to say "translations sharing a word".

- [ ] **Step 3: `dictationForm(word, translation)`**: Russian as today. For `es`, `it` and `pt`,
      the first word of the translation ending in `o` means masculine and in `a` feminine. Any other
      language gives `null`. Rewrite its comment to say this.

- [ ] **Step 4: Pass the language in `WordQuiz`**: `const translationOf = useTranslationLanguage()`
      and `dictationForm(question.word, translationOf(question.word.language))`.

- [ ] **Step 5: Verify**: `yarn verify` passes. With translations in English, a quiz round still
      offers three wrong answers on "pick the translation" questions.

- [ ] **Step 6: Commit** (when asked)

---

### Task 5: `lang` on word translations, README and News

**Files:**

- Modify (`lang="ru"` → `lang={translationOf(<the word's language>)}` with
  `const translationOf = useTranslationLanguage()`):
  `src/features/quiz/ui/WordQuiz.tsx:298,377` (word translations; `:267` is the gap/definition
  line, which belongs to step 3, so leave it),
  `src/features/conjugate-verb/ui/VerbsTab.tsx:223,299`, `src/widgets/word-list/ui/WordsTab.tsx:332`,
  `src/pages/call/ui/LessonMode.tsx:385`, `src/pages/call/ui/QuizGame.tsx:249`,
  `src/entities/word/ui/MistakeList.tsx:29`
- Modify: `README.md` (lines 31, 36, 66), `src/entities/news/model/news.ts`

**Interfaces:**

- Consumes: `useTranslationLanguage` (Task 1).

- [ ] **Step 1: Replace the eight `lang="ru"`** listed above. Each element already has its word or
      verb in scope: use its `language` (a verb's is `verbLanguageOf(verb)`).

- [ ] **Step 2: README**: Words: "with translations in the language chosen in Settings (Russian
      for students from before it existed)". Exercises: the dictation reads the form "from its
      translation, when that language shows gender (Russian, Spanish, Italian, Portuguese)".
      Settings: replace "Word translations stay in Russian." with a sentence on **Translations in**.
      Note that the word menu, Photo, Text and exercise sentences follow in later steps.

- [ ] **Step 3: News**: a `kind: 'new'` item under the day it ships:
      "Settings: choose the language word and verb translations are written in. Lessons are prepared
      again in it when you open them." Then send it to the `translator` agent for the other six languages.

- [ ] **Step 4: Final check**: `yarn verify`. In the app, check the lesson Words and Verbs tabs, a
      quiz, Mistakes, Settings and lesson mode, in light and dark at 390 px, with the setting on Russian
      and on English. No sideways scroll, no console errors. TODO.md is unchanged (its bullet goes after
      step 3).

- [ ] **Step 5: Commit** (when asked)

---

## Spec coverage notes

- **Add to lesson** needs no code in step 1. It writes `docLine(card)` (`src/features/look-up-word/model/wordActions.ts:137`),
  which is the word menu card's own translation. That card follows the setting in step 2, and
  then Add to lesson writes the translation the student sees.
- Translations made before the switch and shown elsewhere (the mistakes list, Words to learn) keep
  their old text. Their `lang` follows the current setting, as the spec allows.
