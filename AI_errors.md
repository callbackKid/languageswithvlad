# AI errors

Cases where Claude wrote code (or gave advice) that looked right but was wrong: what was wrong, how it was noticed, and what to take from it. Newest first. A new case goes at the top of **Cases**, and its lesson joins **Patterns** when it repeats one.

## Patterns

- **Edge cases nobody thinks of while reading.** The code is right for every input you imagine and wrong for one you don't: `"constructor"`, `31.02`, an answer where no word fits a group. Unit tests on those inputs are what catches them (see `TESTING.md`).
- **JavaScript that fails silently.** `in` sees built-in keys, `new Date` rolls an impossible day into the next month. Neither throws, so nothing shows the mistake.
- **"Supports" is not "installs".** A version range that allows your version doesn't mean the package manager will pick it. Check what actually landed (`yarn.lock`, `node_modules`), not only `package.json`.
- **Limits copied from a neighbour.** A setting that works for similar code (`max_tokens`) can be too small for a case that does more work.

## Cases

### Vitest 3 brought a second Vite (2026-11-26, `a819853`)

- **The advice:** install `vitest@3.2.4`, because it supports Vite 5, and the app uses Vite 5.3.4.
- **What was wrong:** Vitest 3 accepts `vite@^5 || ^6 || ^7`, and Yarn 1 resolved that to the newest version, 7.3.8, installed next to the app's 5.3.4. Tests would run on a different Vite, esbuild and Rollup than the app.
- **How it was noticed:** reading `yarn.lock` after the install: two `vite@` entries, and `node_modules/vitest/node_modules/vite`.
- **Fix (not done yet):** a `"**/vite": "5.3.4"` line in `resolutions` in `package.json`, so the whole project has one Vite.
- **Lesson:** after adding a dependency, check what the lockfile resolved, not only the version you asked for.

### A language code like “constructor” passed the check (2026-11-19, `1bb74dd`)

- **The code:**

  ```ts
  typeof value === 'string' && value in LANGUAGE_NAMES ? (value as LearnLanguage) : 'fr';
  ```

- **What was wrong:** `in` also accepts the keys every object inherits (`constructor`, `toString`, `__proto__`), so a request with `"language": "constructor"` got past `asLanguage`, `asVerbLanguage` and `asExplainLanguage` and reached the prompt sent to Claude.
- **How it was noticed:** a security review of `api/`.
- **Fix:** `Object.hasOwn(LANGUAGE_NAMES, value)`, which accepts only the listed languages.
- **Lesson:** to check that a key belongs to a lookup object, use `Object.hasOwn`, never `in`.

### “31.02” became 3 March (2026-11-23, `3104c40`)

- **The code:** `parseNextLesson` (`src/entities/lesson/lib/nextLesson.ts`) accepted any day from 1 to 31 and passed it to `new Date(year, month - 1, day)`.
- **What was wrong:** `new Date` doesn't refuse an impossible day, it rolls it over into the next month. A typo in the document (“31.02”) silently moved the next lesson to 3 March.
- **How it was noticed:** the app audit of 23 November.
- **Fix:** the day is capped at the month's last day (`new Date(year, month, 0).getDate()`), as a lesson's heading already was.
- **Lesson:** dates from text need a check that the day exists in that month; `new Date` won't do it for you.

### An endless “Couldn't sort” error in word groups (2026-11-23, `14018cb`)

- **The code:** `normalizeWordGroups` (`src/widgets/word-list/model/normalize.ts`) ended with `if (!found.size) throw new Error('empty')`.
- **What was wrong:** an answer where no word fitted a group (one new starred word with no topic, or a word Claude copied back with another apostrophe) counted as a failure. Nothing was saved, Try again got the same answer, and every visit paid for a new Claude request.
- **How it was noticed:** the app audit of 23 November; the error came back on a single starred word.
- **Fix:** words in no group go to “Other” and are saved; only an answer with no `groups` list at all is an error.
- **Lesson:** decide what counts as an error by what the student can do about it. If retrying gives the same answer, it is a result, not an error.

### A phonetics round cut off mid-JSON (2026-11-23, `95aaaf3`)

- **The code:** the phonetics practice round used `max_tokens: 4000`, the same as the other practice rounds.
- **What was wrong:** a phonetics round thinks longer (IPA, options that must not sound alike), and thinking counts towards `max_tokens`. A round on “e muet” stopped in the middle of its JSON and was shown as unreadable.
- **How it was noticed:** the round showed as unreadable in the app.
- **Fix:** a limit of its own, 12 000, and an unreadable answer now logs its `stop_reason` and output tokens, so the next cut-off is visible for what it is.
- **Lesson:** when Claude's answer can't be read, log `stop_reason` first: `max_tokens` means it was cut off, not wrong.
