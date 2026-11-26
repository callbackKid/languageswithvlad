---
name: audit-app
description: Audit the whole languageswithvlad app (or one area of it) for bugs, inconsistencies, wrong answers in exercises, mistakes in the interface texts in seven languages, breaks of the CODE_STYLE.md and REVIEW.md rules, and UI/UX problems on every page, in light and dark theme, at phone and desktop width. Use when asked to go through the project, look for bugs or issues, check the exercises or texts, or review the UI/UX as a whole, not one diff (for a diff use /code-review).
---

A full pass over the app that ends in a ranked list of findings. It **finds and reports; it fixes nothing** unless the owner asks afterwards. All paths are relative to the repo root. It builds on the `run-languageswithvlad` skill (browser driver, test lesson) and, when asked, `check-a11y`.

Work in this order: the cheap mechanical checks first, then the logic students meet most (grading), then the server, then the screens. Write down each finding as you go: file:line, what happens, how to reproduce it.

## 1. Baseline (2 minutes)

```bash
yarn -s verify                                   # lint, format, types: must pass
npx tsx .agents/skills/audit-app/check-texts.ts  # every interface text and News entry, 7 languages
```

`check-texts.ts` reports placeholders and tags that differ from English, missing plural forms (Russian needs one/few/many), straight quotes and apostrophes, `...`, quotes of another language, double or stray spaces, texts left in English, News out of date order. Options: `--only <file>` (`--only news`). Known false positives are listed below; anything else is a finding.

Unused dependencies (CODE_STYLE: a dependency needs a reason):

```bash
for dep in $(node -p "Object.keys(require('./package.json').dependencies).join(' ')"); do
  echo "$dep: $(grep -rlE "from '$dep|import\('$dep" src api | wc -l)"; done
```

## 2. Exercise logic: run it, don't just read it

Grading, conjugation, homework and date parsing are plain functions in the `lib/` and `model/` segments of the slices (`src/entities/*/lib`, `src/entities/*/model`…), so try them on real cases. Write a probe in the scratchpad (not in the repo; tests are the owner's to write) and run it with `npx tsx <probe>.ts`, importing by absolute path:

| Function                                                          | Cases to try                                                                                                                                                                                                                                 |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `grade(input, answer, person)` (`grade.ts`)                       | Typed with the pronoun for **every person label the prompts use** (`il/elle/on`, `ils/elles`, `er/sie/es`, `sie/Sie`, `él/ella/usted`, `nosotros/nosotras`…: see `api/_lib/prompts.ts`); `j'aime`; `œ` typed as `oe`; `ß` as `ss`; `allé(e)` |
| `negate(form, tense)` (`negation.ts`)                             | reflexive, elision (`n'ai`), aspirated h (`hais`), `y`/`en`, impératif with `-toi`, `-moi`, `va-t’en`                                                                                                                                        |
| `readItem`, `homeworkItems` (`homework.ts`)                       | the homework line in every language, with Russian labels (`глаголы … и …`), short tense names (`futur`, `presente`, `Futur`), `Devoirs:` block with list lines                                                                               |
| `parseNextLesson` (`nextLesson.ts`)                               | each label language, a city, no time, `18h`, a two-digit year, and **another line that merely mentions "next lesson"** after the real one                                                                                                    |
| `splitLessons`, `localParse` (`document.ts`)                      | each heading word, an impossible date (`31.02.2026`), a German lesson without Codex                                                                                                                                                          |
| `homeworkBlock` (`makeHomework.ts`)                               | its output for each language must read back through `readItem` as the right kinds                                                                                                                                                            |
| `wordsForGroupExercise`, `canMakeGroupExercise` (`groupWords.ts`) | words of two languages (2 + 2, 3 + 2), a tie, more than 30 words, words without a translation: the button and the round must agree                                                                                                           |
| `normalizeWordGroups` (word-list `normalize.ts`)                  | an answer that groups none of the words sent (they must be kept as in no group, not an error), an answer without `groups` (an error), a word sent back with another apostrophe or case                                                       |
| `normalizePhonetics`, `normalizeExercise`                         | Codex's shape and the shape saved on the device read the same way; a choice whose answer isn't among its options; `say` / `heard` missing (an older saved exercise)                                                                          |
| `readListView`, `readListOpen`, `readListPause`                   | a saved value that isn't one of ours (`"sideways"`, `7`, `null`) falls back to the default                                                                                                                                                   |
| `forSpeech`, `translationLanguage`                                | `il/elle/on se lève`, `allé(e)s`; a word is never translated into its own language                                                                                                                                                           |

Then read, in this order, looking for where one language was handled and the others forgotten (French was first; German, Spanish, Italian, Portuguese came later): `grade.ts`, `quiz.ts`, `progress.ts`, `tenses.ts`, `bank.ts`, `document.ts`, the `normalize.ts` files, `homework.ts`, `nextLesson.ts`, `warmUp.ts`, `report.ts`, `makeHomework.ts`. Grep for leftovers:

```bash
grep -rn "'fr'\|French" src --include='*.ts' --include='*.tsx' | grep -v i18n
```

**Saved data.** Every key the app keeps on the device (`grep -rhoE "(load|loadChecked|save)\(['\`][^'\`]+" src | sort -u`: `extras:`, `phonetics:`, `an2:`, `word-groups:`, `exercise:last`, `lessons-view`, `lessons-open`, `listen-pause`, `menu-open`, the settings…) must be read with a check, and a change of shape must still read what students already have (AGENTS.md: stored field names never change; a new shape needs a migration on read or a new key). A cache that saves its normalized value but reads it back with the normalizer of Codex's answer is a bug (it happened with `phonetics:`).

Also: keys that ignore the language (`wordKey`, the bank's dedupe by `inf`: `ser`, `ir`, `partir`, `casa` exist in several languages), cached values read without a check (`load<T>` used as is), and comments that sit above the wrong function.

## 3. Server (`api/`)

Read `api/_lib/http.ts`, then each endpoint, against CODE_STYLE.md, Server. Check:

- every field read with `text()`/`asLevel`/…, with a named size limit;
- error codes the app translates: list what the server sends and compare with `messageFor` in `src/shared/api/index.ts`:
  ```bash
  grep -rhoE "(error: |Error\([0-9]+, )'[^']+'" api | sort | uniq -c
  ```
  An English sentence with status ≥ 500 is never shown (the app says "Something went wrong"); one with 4xx is shown in English to every student;
- the teacher's tools check `checkTeacher` on the server, not only `useTeacher()` in the app;
- nothing secret in `health` or in logs.

For a security pass on `api/`, suggest `/security-review` to the owner rather than doing it here.

## 4. Code rules: CODE_STYLE.md and REVIEW.md

**Read both files again first**: they change, and they are the rules, not this list. The 🤖 rules are already covered by `yarn verify` in step 1. From `REVIEW.md`, skip what belongs to another stack (MUI, tables and columns, CRUD, `.po` files, `yarn translate`, `yarn ci:check`, path aliases, `FC`) and say so in the report.

Then run the searches for every rule that can be found mechanically:

```bash
bash .agents/skills/audit-app/check-rules.sh > "$TMPDIR/rules.txt"
```

Each block is one rule, with candidates as `file:line`; an empty block passed. **A candidate is not a finding until you have read it**:

| Block                                                   | Counts as a finding when…                                                                                                                                                               |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Naming: abbreviations, booleans                         | the name is short for something (`Conj`, `Btn`), or a boolean reads as a thing (`ai`, `feedback`, `negative`), not a fact (`isNegative`, `zoomReady`). `UPPER_SNAKE` constants are fine |
| `as` casts                                              | no check on the same line or the line above proves it; worst when the value comes from outside (another device, `localStorage`, a server answer)                                        |
| Bare numbers                                            | a limit, delay or size with a meaning; especially a server limit, which CODE_STYLE wants named, and a client `maxLength` that must match it                                             |
| Heavy imports                                           | the importing file isn't itself loaded with `lazy()` / `import()` (check with `grep -rn "<file name>" src`)                                                                             |
| Promises without `void`                                 | the call returns a promise and nothing awaits or chains it (multi-line `.then` below is fine)                                                                                           |
| Codex components without `WaitingFact`                  | no waiting state while Codex answers, or no "Try again" when it fails                                                                                                                   |
| Saved values without a check                            | a damaged or older value would crash the page or show garbage (`load<T>` is only a cast)                                                                                                |
| Logic in components                                     | dates, parsing or grading computed in a component instead of a function in a slice's `lib/` or `model/`                                                                                 |
| Codex answers without `normalizeX`                      | the answer reaches state unchecked (often the check is on the next line: read the call)                                                                                                 |
| Exported functions without a comment; one-line `/** */` | an exported function, component or constant whose purpose isn't obvious from its name has no comment; a one-line comment written as `/** … */` or `/* … */` instead of `//`             |
| `eslint-disable`                                        | no reason on the same line; and any silenced `react-hooks/exhaustive-deps`, which CODE_STYLE forbids                                                                                    |
| Styles                                                  | a colour outside the variables (dark theme breaks), another breakpoint, an animation without `prefers-reduced-motion`, a class nothing uses                                             |
| REVIEW: duplicated helpers                              | the same function in several files (`startOfDay`, `dayKey`, `pad`): one in `src/shared/lib` would do                                                                                    |
| REVIEW: URLs, busy states                               | user data in a URL without `encodeURIComponent`; a loading or sending state that an error leaves on                                                                                     |
| Completeness                                            | a page without `guide`, a section missing from the README Pages table                                                                                                                   |

Then read for the rules no search can judge, file by file in `src/`, layer by layer:

- **React**: one main component per file; state that could be computed from props or other state; `useMemo` on light work (or missing on the word bank and statistics); every async effect guarded and cleaned up;
- **Texts**: `—` for an empty value, dates and numbers through `Intl` with the interface locale, `lang={language}` on words in the learned language and `lang="ru"` on Russian, no sentence glued from pieces;
- **Server**: thin endpoints (`onlyPost`, `checkAccess`, validate, a helper in `_lib`, answer), every handler ending in `fail(response, error)`, no secret in a log or an answer;
- **Comments**: true to the code, saying why, not what;
- **REVIEW**: duplicated logic (not only helpers), `try/finally` around busy states, bad input in every form field (in the browser, step 5: an empty field, only spaces, a very long text, emojis).

Also look for side effects inside state updaters and effects without a late-answer guard:

```bash
grep -n -A4 "set[A-Z]\w*((previous" $(git ls-files 'src/*.tsx') | grep -E "save\(|record|api\.|ObjectURL"
for f in $(git ls-files 'src/*.tsx'); do grep -q useEffect $f && grep -q "\.then(\|await " $f && ! grep -q "alive\|AbortController" $f && echo $f; done
```

A call next to the `setState` call is fine; one inside the `(previous) => …` function is not.

### Exercise components

Read the exercise components the student uses most: `WordQuiz`, `VerbsTab`, `GapFill`, `WordBlitz`, `Match`, `Flashcards`, `Listen`, `ExerciseRound` with `RoundLoader` (Create an exercise, a group's Exercise, the Phonetics tab's Practise), `PhoneticsTab`, `QuizGame`, the warm-up, `HomeworkCard`, `WritingTask`. In each: what is recorded as right or wrong (a grading bug becomes a false "mistake" in Stats, Mistakes, the warm-up and the report to the teacher), the `lang` of shown words, what happens with 0, 1 or 2 words. A picked option must be graded exactly (an accent-only difference is a wrong answer, not "almost"); a question that needs sound must not be shown where the browser has no voice, and its 🔊 label must not say the answer.

## 5. UI and UX in the browser

Start the dev server as in `run-languageswithvlad` (port 5173; if it is taken, the owner's own server may be on it: use 5174 and `BASE_URL=http://localhost:5174` for the driver, and don't kill the other one). Then:

```bash
node .agents/skills/run-languageswithvlad/driver.mjs --out "$TMPDIR/audit-shots" < .agents/skills/audit-app/tour.steps
node .agents/skills/run-languageswithvlad/driver.mjs --themes light --out "$TMPDIR/audit-shots" < .agents/skills/audit-app/tour-languages.steps
node .agents/skills/run-languageswithvlad/driver.mjs --width 1280 --out "$TMPDIR/audit-shots" < .agents/skills/audit-app/tour-desktop.steps
node .agents/skills/run-languageswithvlad/driver.mjs --themes light --out "$TMPDIR/audit-shots" < .agents/skills/audit-app/bad-input.steps
```

`tour.steps` visits every page and lesson tab in both themes at 390 px (with a group's Exercise and its 3-word note, a Phonetics round, Listen and the Settings picture menu), fills a verb drill with the pronoun typed in, and opens an unknown address; `tour-desktop.steps` covers what only a wide screen shows (the lesson list as a column, a row and folded; Profile and Interface side by side; lesson mode); `tour-languages.steps` repeats the main pages with the interface in German and Russian (the longest words); `bad-input.steps` types bad input into the form fields (REVIEW.md, Forms): a very long name with emojis, markup in the word filter, only spaces as a text, a link as a discussion topic, `?` and odd spacing in the drill. A field added since needs a line there. The driver reports console errors and sideways scroll by itself. The driver trims each step line, so "only spaces" arrives as an empty field.

**Look at every screenshot** with Read, and note:

- the current item visible without scrolling (the lesson strip, the open tab);
- controls that wrap into many rows on a phone (lesson tabs, segmented choices);
- empty, loading and error states that say what to do next; disabled buttons that don't say why;
- the same action named or placed differently on two pages (Home's homework vs the lesson's Homework tab);
- text in the wrong language for the interface, or a word in the learned language shown as English;
- unknown addresses: does the app say so or quietly show Home?
- light and dark: anything unreadable or invisible in one of them.

Three checks the screenshots can't make:

- **Speech.** Record what is read and in which voice with the `speechSynthesis.speak` wrapper from `run-languageswithvlad` (Checking speech): Listen reads word, then translation, in the right locales; Pause and ✕ stop it; a phonetics question's 🔊 reads its `say`.
- **Translation language apart from the interface.** Set `translateTo` to `ru` with the interface in English (and the other way round) in `cahier-fr:settings`, then open a lesson's words, Listen, Fill the gap and Create an exercise: translations and their `lang` follow `translateTo`, explanations of grammar and phonetics follow the interface.
- **Paid requests on a return visit.** On every screen that asks Codex (word groups, Grammar, Phonetics, the word menu, Discuss), count the `/api/` requests after leaving and coming back (wrap `window.fetch` in an `eval`, then navigate inside the app by clicking a menu link, at `--width 1280`, so the wrapper survives). A second request for the same thing means its answer isn't kept, and every visit costs money.

Accessibility has its own skill: run `check-a11y` too when the owner asks for it, or mention it.

Stop the server at the end: `lsof -ti:5174 -sTCP:LISTEN | xargs kill` (only the port you started).

## 6. Translations (only with the owner's go-ahead)

`check-texts.ts` checks the form, not the meaning. A review of whether each language reads naturally is the `translator` subagent's job (`.codex/agents/translator.toml`): offer it, don't start it unasked (AGENTS.md: agents only when the owner asks).

## Report

In the owner's language. Group the findings by severity, most severe first:

1. **Bugs students hit**: wrong grading, lost or wrong progress, a feature that silently does nothing in some language;
2. **Bugs in rarer paths**: no Codex, Notion, a typo in the document, errors from the server;
3. **UX and design**: what is hard to find, confusing or inconsistent;
4. **Code rules and docs**: CODE_STYLE and REVIEW breaks (grouped by rule, with a count when a rule is broken in many places), unused dependencies, stale comments and README lines; and which REVIEW items were skipped as not fitting this project.

Each finding: one line saying what is wrong, the [file:line](path#Lline) link, how to reproduce it (the probe input or the steps), and the likely fix in a few words. Say plainly which you confirmed (probe, screenshot) and which come from reading only. Keep it short: no list of things that are fine. Don't fix anything until the owner picks what to fix; the owner writes tests themselves, so a fix comes without one, with a note of the case a test should cover.

If the findings will be shared, offer a page in one line.

## Known false positives of check-texts

- French lines quoting the document's syntax (`le cours prochain: 22.11.2026`, `Devoirs: …`) have no space before `:` on purpose: they show what to type.
- `«` in News 2026-11-16 is the menu button's icon, not a quote.
- `reportWriting` (`✍️ {task} — {verdict}`), `game.fr.points` and `exercises.groupOption` (`{name} ({count})`) are the same as English on purpose.
- The `notesPlaceholder` and `homeworkPlaceholder` texts in `call.ts` are examples of the document's syntax, in French on purpose.
- `pages.ofTotal` and `exercises.fromWord` start with a space: they follow a number or a sentence on screen. (They are glued text; fine while every language reads right.)

Add a line here when a sweep reports something that is right on purpose.
