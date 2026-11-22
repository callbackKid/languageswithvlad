# Translation language, step 2: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The word menu, Photo, Text (translation and study) and the textbook PDF write their
translations and explanations in the language chosen under **Translations in**.

**Architecture:** These are the requests where Claude works out the language itself. Like the
lesson analysis in step 1, the client sends `translateTo` and `translateFallback`, and the prompt
says "in X, or Y for a text in X itself". The word menu's saved cards get the language in their key,
except for Russian. Every `lang="ru"` on these pages takes the translation language.

**Tech Stack:** React 19 + TypeScript + Vite, Vercel functions in `api/`, Claude.

**Spec:** [docs/superpowers/specs/2026-11-22-translation-language-design.md](../specs/2026-11-22-translation-language-design.md)
(step 2). Step 1 is done (c4978bb): `Settings.translateTo`, `translationLanguage`,
`translationFallback` and `useTranslationLanguage` in `@/shared/config`, plus `TranslationRequest`
and `translationRule` in `api/_lib/prompts.ts`.

## Global Constraints

- Stored and Claude-returned field names never change: `ru`, `baseRu`, `definitionRu` and
  `explanation` hold the translation language from now on. Only prompts and comments say so.
- A student on Russian keeps every cache key they have today: `cardKey` is unchanged for `'ru'`.
- Results kept from before (`photo:last`, the entries of `reader:texts`) are not redone when the
  setting changes. They show what they were made with, and the next request uses the new language.
- Their `lang` follows the current setting. The language they were made in isn't stored, and the
  spec allows this ("otherwise the current setting").
- Prompts only in `api/_lib/prompts.ts`. The server reads the new fields defensively, with
  Russian when they're missing.
- New texts: English first, then the `translator` agent fills the other six. A News entry.
- **Tests are the owner's.** The "Tests for the owner" blocks name the tests and their assertions;
  the implementer doesn't write them. Each task is checked with `yarn verify` and in the running
  app (`run-languageswithvlad`: light, dark, 390 px).
- Commit only when the owner asks. Never `--no-verify`.
- Out of scope (step 3): gaps, the blitz, Create an exercise, grammar practice, Discuss, Make
  homework, and the "wording only" prompts.

## Review Focus

1. **A saved word card opens without Claude for a Russian student.** `cardKey(s, c, 'ru')` must
   equal today's `hash(s.toLowerCase() + '|' + c)` (Task 2).
2. **A word in the translation language itself.** With translations in English, selecting an
   English word gives the card in the fallback (the interface language, or Russian), never
   English for English (Tasks 1 and 2).
3. **Translating a text already written in the translation language.** With translations in
   German, a German article gets a translation in the fallback, not a copy of itself (Task 1).
4. **The word menu's Add to lesson** writes `word — translation` with the card's translation in the
   current language. The teacher's notes then mix languages, and the step 1 analysis prompt already
   reads that (Task 2, checked in the app).
5. **An old tab with no language in its request** gets Russian, because `asTranslationRequest`
   falls back to it (Task 1).

---

### Task 1: The four prompts and the endpoints

**Files:**

- Modify: `api/_lib/prompts.ts`: `translationRule`, `LEVEL_STYLE`, `MARKED_ITEM_RULES`,
  `photoPrompt`, `wordPrompt`, `translatePrompt`, `studyPrompt`, `textbookPrompt`,
  `exercisePrompt` (one line, see Step 3). Add `asTranslationRequest`.
- Modify: `api/text.ts` (word, translate, study), `api/paper.ts` (underlined, textbook),
  `api/analyze.ts` (use `asTranslationRequest` in place of the inline object from step 1)

**Interfaces:**

- Produces:

  - `asTranslationRequest(body: unknown): TranslationRequest` reads `body.translateTo` and
    `body.translateFallback` with `asExplainLanguage`.
  - `translationRule(translation: TranslationRequest, source: 'lesson' | 'text' | 'page' | 'selection'): string`.
    For a learned language it returns
    `The translation language is ${X}, or ${Y} for a ${source} in ${X} itself: write every translation (ru) and explanation in it.`
    For Russian it returns `The translation language is Russian: write every translation (ru) and explanation in it.`
    `analysisPrompt` passes `'lesson'`.
  - `photoPrompt(levels, translation)`, `wordPrompt(selection, context, levels, translation)`,
    `translatePrompt(paragraphs, translation)`, `studyPrompt(body, levels, translation)` and
    `textbookPrompt(levels, translation)`, each with `translation: TranslationRequest`.

- [ ] **Step 1: Tests for the owner** (`api/_lib/prompts.test.ts`)

```ts
const en = { language: 'en', fallback: 'ru' } as const;
expect(wordPrompt('maison', 'la maison', levels, en)).toContain(
  'The translation language is English, or Russian for a selection in English itself'
);
expect(wordPrompt('maison', 'la maison', levels, en)).not.toContain('Russian-speaking');
expect(translatePrompt(['Hallo'], { language: 'de', fallback: 'en' })).toContain('German');
expect(asTranslationRequest({})).toEqual({ language: 'ru', fallback: 'ru' });
expect(asTranslationRequest({ translateTo: 'xx', translateFallback: 'fr' })).toEqual({
  language: 'ru',
  fallback: 'fr',
});
```

- [ ] **Step 2: Reword the shared pieces**

- `LEVEL_STYLE`: "explanations in plain Russian" becomes "explanations in plain words of the
  translation language".
- `MARKED_ITEM_RULES`:

  - `ru`: "a translation that fits this context, in plain everyday words of the translation
    language (in Russian, for example: шваб, not швабец)".
  - `explanation`: "in the translation language" in place of "in Russian".
  - Keep the Russian register words (разговорное, книжное) as examples marked "(in Russian:
    разговорное, книжное)".

- [ ] **Step 3: Rewrite the five prompts**

Replace "Russian-speaking learner" with "learner". Replace every "Russian translation" or "in
Russian" with "translation" or "in the translation language". Put `translationRule(...)` right after
the level line, with the source: photo `'page'`, word `'selection'`, study and translate `'text'`,
textbook `'page'`.

The particular changes:

- `wordPrompt`: `baseRu` is "a short translation of the dictionary form"; `definitionRu` is
  "the translation of definition".
- `translatePrompt`: it opens with "Translate this text into natural, fluent ${X}. If it is
  already in ${X}, translate it into ${Y}". Skip the second sentence when `X` is not a learned
  language.
- `textbookPrompt`: "word — translation" in place of "word — перевод", and "a short rule in the
  translation language".
- `exercisePrompt` now uses `LEVEL_STYLE`, which talks of "the translation language". Until step 3
  it gets the line `translationRule({ language: 'ru', fallback: 'ru' }, 'text')` after
  `LEVEL_STYLE`, so its output stays in Russian.

- [ ] **Step 4: Wire the endpoints**: each passes `asTranslationRequest(body)` (or
      `request.body`). `api/analyze.ts`'s `words` branch switches to it as well.

- [ ] **Step 5: Verify**: `yarn typecheck` passes, and
      `grep -n "Russian-speaking" api/_lib/prompts.ts` shows none of the five prompts above.

- [ ] **Step 6: Commit** (when asked)

---

### Task 2: Requests and the word menu's cache

**Files:**

- Modify: `src/shared/config/translation.ts` (new helper)
- Modify: `src/shared/api/index.ts`: `analyzeOnce`, `word`, `photo`, `textbook`, `translate`, `study`
- Modify: `src/features/look-up-word/model/wordActions.ts:52-80` (`cardKey`, `readWordCard`, `saveWordCard`)
- Modify: `src/widgets/word-menu/ui/WordActions.tsx` (passes the language to read and save)

**Interfaces:**

- Consumes: `asTranslationRequest` field names `translateTo` and `translateFallback` (Task 1).
- Produces:

  - `translationFields(translateTo: UiLanguage = getSettings().translateTo): { translateTo: UiLanguage; translateFallback: UiLanguage }`
    in `translation.ts`, exported from `@/shared/config`. The fallback is
    `translationFallback(translateTo, getUiLanguage())`. `analyzeOnce` switches to it.
  - `cardKey(selection: string, context: string, translateTo: UiLanguage): string`: today's hash
    for `'ru'`, `hash + ':' + translateTo` otherwise.
  - `readWordCard(selection, context, translateTo = getSettings().translateTo)` and
    `saveWordCard(selection, context, card, translateTo)`.

- [ ] **Step 1: Tests for the owner** (`src/features/look-up-word/model/wordActions.test.ts`)

```ts
expect(cardKey('Maison', 'la maison', 'ru')).toBe(hash('maison|la maison'));
expect(cardKey('Maison', 'la maison', 'en')).toBe(hash('maison|la maison') + ':en');
```

- [ ] **Step 2: Add `translationFields`** and spread it into the bodies of `word`, `photo`,
      `textbook`, `translate` and `study`. `analyzeOnce` uses it too: read `translateTo` once, use it
      in the in-flight key, and pass it to `translationFields(translateTo)`.

- [ ] **Step 3: Key the cards by language**: `cardNow` in `WordActions` reads `translateTo` once
      before the request and passes it to `saveWordCard`. The read that opens a saved card passes
      the `translateTo` from `useSettings()`.

- [ ] **Step 4: Verify in the app**

  - On Russian, a card saved before opens with no `/api/text` request.
  - On English, the same word asks Claude and shows English.
  - Add to lesson writes the English line.
  - `yarn verify` passes.

- [ ] **Step 5: Commit** (when asked)

---

### Task 3: `lang` on these pages, comments, docs and News

**Files:**

- Modify (`lang="ru"` → `lang={translationOf(<item language>)}`, with
  `const translationOf = useTranslationLanguage()`):
  - `src/widgets/word-menu/ui/WordActions.tsx:275,286,293,306`: the card's `language`
  - `src/widgets/word-notes/ui/WordNotesTable.tsx:52,62`: `item.language`
  - `src/pages/text/ui/Reader.tsx:79,374,381,447`: the entry's `language`
- Modify comments:
  - `src/pages/text/model/types.ts:23`: "the translation, one item per paragraph"
  - `src/entities/word/model/wordCard.ts:23`
  - `src/shared/api/index.ts:289`: "a pasted text translated, paragraph by paragraph"
- Modify: `README.md`:
  - word menu: "**Define** (in that language, with a translation)"
  - Text and Photo lines
  - the Settings sentence "The word menu, Photo, Text and exercise sentences are still in
    Russian" becomes "Exercise sentences and Discuss are still in Russian"
- Modify: `src/pages/tutorial/i18n/tutorial.ts:183`: "shows a translation under each paragraph"
- Modify: `src/entities/news/model/news.ts`

- [ ] **Step 1: Replace the ten `lang="ru"`.** An item without a language (an old note) passes
      `undefined`, which resolves to the setting.

- [ ] **Step 2: Comments, README, the Tutorial line.** Then send the changed Tutorial key to the
      `translator` agent.

- [ ] **Step 3: News**: a `kind: 'better'` item for the day it ships: "The word menu, Photo, Text
      and textbook pages now translate into the language chosen under Translations in." Then the
      `translator` agent.

- [ ] **Step 4: Final check**

  - `yarn verify` passes.
  - In the app, on Russian and on English: the word menu (Translate, Define, Examples), Text
    (translate, study, a clicked word), Photo and the notes table.
  - Light and dark at 390 px, no console errors.
  - `grep -n 'lang="ru"' src` lists only step 3's places: GapFill, MakeExercise and Discuss.

- [ ] **Step 5: Commit** (when asked)
