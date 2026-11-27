# Code style

The rules for all code in this repository. Rules marked 🤖 are checked by tools and can't be committed broken; the rest are checked by reading the diff before a commit.

## How the rules are enforced

| When               | What runs                                                                                                        |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| On save in VS Code | Prettier formats the file, ESLint fixes what it can (`.vscode/settings.json`).                                   |
| Before each commit | The hook in `.husky/pre-commit`: ESLint with fixes and Prettier on the staged files, then typecheck and Steiger. |
| Any time           | `yarn verify` runs lint, the format check, the typecheck and Steiger (FSD layers) for the whole project.         |

A commit that breaks a 🤖 rule is refused; fix the problem and commit again. `yarn lint:fix` and `yarn format` fix everything fixable at once. Don't skip the hook with `--no-verify`.

The hook is installed by `yarn install` (the `prepare` script). The checkable rules live in `eslint.config.js`, `.prettierrc.js`, `steiger.config.js` and the two `tsconfig.json` files; when a rule here changes, change it there too.

## Formatting 🤖

Prettier decides: 100 columns, single quotes, semicolons, trailing commas where ES5 allows, parentheses around arrow parameters. Never format by hand against it.

## Naming

- **Whole words** for every variable, parameter, function and type: `word`, `lesson`, `index`, `event`, `previous`, not `w`, `l`, `i`, `e`, `prev`. Short real words are fine: `id`, `key`, `url`, `row`. 🤖 for one-letter names.
- **Three exceptions**: `t` is the translation function; `a` and `b` are the two sides of a pair; fields of stored data (`fr`, `ru`, `tr`, `p`, `f`, `inf`, `n`…) keep their names, because renaming them would break progress saved in students' browsers.
- **No abbreviations in function and type names**: `normalizeConjugation`, `FormQuestion`, `ExerciseHead`, not `normConj`, `FormQ`, `ExHead`.
- `camelCase` for variables and functions, `PascalCase` for components and types, `UPPER_SNAKE_CASE` for module-level constants (`MAX_PDF_PAGES`).
- Booleans read as a fact: `isStarred`, `hasTime`, `needsCode`, `zoomReady`.
- A function that turns unknown data into a typed value is `normalizeX` (it may throw) or `asX` (it falls back to a default).
- Files: a component file is named after its component (`LessonView.tsx`); logic files are `camelCase.ts`; one message file per area: in `src/shared/i18n/messages/` when several slices use it, in the `i18n/` segment of the slice when only that slice does (`src/pages/call/i18n/game.ts`).

## TypeScript

- Prefer arrow functions. Keep function declarations where the code relies on hoisting, overloads, or a function's own `this`. Use named functions where a callback needs its own name, as with `forwardRef` components.
- `strict` and `noUncheckedIndexedAccess` are on 🤖. An array or record lookup may be `undefined`: handle it with a guard, a default (`?? ''`) or destructuring defaults.
- No `any` 🤖. Data from outside (Claude, the document, `localStorage`, request bodies) is `unknown` until a `normalizeX` / `asX` function has checked it.
- No non-null `!` 🤖. Handle the missing case, or narrow with a check.
- `as` only where a check on the same line or the line above proves it (`LEVELS.includes(level as Level) ? (level as Level) : …`).
- Types are imported as types: `import type { Word }` or `import { type Word, LANGUAGES }` 🤖.
- Unions of string literals instead of enums (`type Theme = 'system' | 'light' | 'dark'`). When the values are also needed at runtime, derive the type from an `as const` array.
- `===` and `!==`; `== null` is allowed for "null or undefined" 🤖.
- No unused variables, parameters or imports 🤖. Delete dead code instead of commenting it out.
- Numbers with a meaning are named constants with a comment: `const MAX_LESSON_LENGTH = 20_000`.

## Imports 🤖

- Sorted automatically into one order: side-effect imports, packages, then project files. Don't reorder by hand.
- `src/` follows [Feature-Sliced Design](https://feature-sliced.design/): layers `app` → `pages` → `widgets` → `features` → `entities` → `shared`. A file imports only from layers below its own, and slices of one layer don't import each other 🤖 (Steiger, `steiger.config.js`, in `yarn verify` and the pre-commit hook). New code goes in the lowest layer that has everything it needs, and into the page that uses it until a second page needs it too.
- Between slices (and between segments of `shared`), import through the `@/` alias; inside one slice or segment, use relative paths. `shared/lib` and `shared/ui` are imported file by file (`@/shared/lib/storage`, `@/shared/ui/PageHead`); `shared/api`, `shared/config` and `shared/i18n` through their `index.ts` (`@/shared/i18n`).
- A slice of `entities`, `features`, `widgets` or `pages` is used from outside only through its `index.ts` (`@/entities/word`, not `@/entities/word/model/progress`); add a name there when another layer needs it. When one entity needs another (a lesson holds words), it imports from that entity's `@x/<its own name>.ts` (`@/entities/word/@x/lesson`), which lists exactly what is lent.
- No `import React`; import what is used: `import { type ReactNode, useState } from 'react'`.
- Heavy libraries are loaded with `import()` where they are needed (pdf-lib, the Zoom SDK, Excalidraw), never at the top of a file that every page loads.

## React

- Function components, default-exported, one main component per file; a slice's `index.ts` exports it by name (`export { default as WordsTab } from './ui/WordsTab'`). Small helper components used only by it may live in the same file.
- Props are typed inline next to the destructuring; shared shapes are exported interfaces.
- List the props a component accepts. Forward props by name and avoid catch-all `...props` spreads.
- The rules of hooks and complete dependency lists 🤖. Don't silence `react-hooks/exhaustive-deps`: if an effect must not re-run for some value, read that value when it is needed (a ref, or `translator(messages)` for a text) instead of leaving it out of the list.
- **Rendering and state updaters are pure.** No saving, no `URL.createObjectURL`, no requests inside `setState((previous) => …)` or in the component body: React may run them twice. Do the side effect next to the `setState` call or in an effect.
- An effect that starts something asynchronous guards against a late answer (`let alive = true` … `return () => { alive = false }`), and cleans up what it created: timers, listeners, object URLs.
- Don't store what can be computed from props or other state. `useMemo` only for work that is actually heavy (building the word bank, statistics).
- Put reusable controls such as buttons and selects in `src/shared/ui/controls/`. Import them from the folder's public API at `@/shared/ui/controls`.
- Use `Button` for text actions and `IconButton` for icon-only actions with a localized label. Use `variant="unstyled"` for controls with their own styles, such as tabs, menu items and answer choices. Keep their ARIA attributes and keyboard handlers.
- `Button` renders a native button with `type="button"` by default. Pass `type="submit"` for form submission.
- A promise that is deliberately not awaited is marked: `void runSync(docId)`.
- External links: `target="_blank" rel="noopener noreferrer"`.
- A component that asks Claude shows `WaitingFact` while it waits and an error with a "Try again" button when it fails.

## State and storage

- `localStorage` only through `load` / `save` / `remove` in `src/shared/lib/storage.ts`. Anything read back is checked before use (see `sanitize` in `settings.ts`).
- Stores shared between pages (`settings.ts`, `entities/word/model/progress.ts`, `shared/i18n/core.tsx`) expose a hook built on `useSyncExternalStore` and plain getters for code outside React. Their snapshot is a new object whenever something changed.
- Logic without UI is plain functions in the `lib/` and `model/` segments of a slice (`src/entities/verb/lib/negation.ts`), so it can be tested without a browser. Components call it; they don't contain parsing, grading or date arithmetic.

## Texts

- No user-visible text in components. Every text is a key in a message file (`src/shared/i18n/messages/<area>.ts`, or a slice's `i18n/<area>.ts`) with all seven interface languages; a missing translation is a type error 🤖.
- Variables are `{placeholders}`; counts use plural forms (`one`, `few`, `many`, `other`), never `count === 1 ? … : …` in code.
- Markup inside a sentence uses tags (`<b>…</b>`, `<link>…</link>`) and `rich()`, so each language keeps its own word order. Don't glue a sentence together from pieces.
- Quotes follow the language: `“ ”` in English, `« »` in Russian and French, `„ “` in German. Apostrophes are `’`.
- An empty value is shown as `—`.
- Dates, times and numbers are formatted with `Intl` and the interface locale.
- Words in the language being learned carry `lang={language}`; Russian translations carry `lang="ru"`.

## Server (`api/`)

- An endpoint is thin: check the method and the class code first (`onlyPost`, `checkAccess`), validate the input, call a helper in `api/_lib/`, answer. Logic lives in `_lib/`.
- Every field of a request is read defensively (`text(value, maxLength)`, `asLevel`, `asLanguage`) and limited in size. Limits are named constants.
- Errors are `HttpError`s (`ClaudeError`, `GoogleError`, `NotionError`, `TelegramError`) and every handler ends with `fail(response, error)`. Every error the server sends is a `snake_case` code (`not_shared`, `lesson_too_long`), never an English sentence, so the student reads it in the interface language: add its text to `common.ts` and its code to `ERROR_TEXTS` in `src/shared/api/index.ts`. A value the text needs goes along in the error's `details` (`{ email }`, `{ count }`).
- Secrets come only from environment variables, are never sent to the browser and never logged. New variables are documented in the README table.
- All prompts are in `api/_lib/prompts.ts`. A prompt says what JSON to return; the app never trusts that JSON without a `normalizeX` function.
- Only `console.error` and `console.warn`, and only for real problems 🤖.
- Imports of project files end in `.js` (Node's module resolution on Vercel).

## Comments

- A comment says **why**, or what isn't obvious from the code; it doesn't repeat the code.
- Exported functions, components and non-obvious constants get a comment above them.
- **A comment that fits on one line is `//`**, wherever it is: above a function, a type, a field or a line of code. `/** … */` only for a comment of several lines; a file's purpose goes in a `/* … */` block at its top. Two exceptions, where `//` doesn't work: JSX keeps `{/* … */}`, and CSS keeps `/* … */`.
- Comments are in English and stay true: when the code changes, change or delete the comment.
- An `eslint-disable` needs a reason on the same line, and is the last resort.

## Styles

- Theme variables, base styles and the app shell live in `src/app/styles.css`. Keep shared button styles in `src/shared/ui/controls/Buttons.css` so buttons, links and file-picker labels can use them.
- When extracting or moving a UI component during a refactor, move the styles it owns beside the component in the same change. Keep styles that arrange it within a page or feature with that page or feature. Shared select styles live in `src/shared/ui/controls/Select.css`.
- Keep styles owned by a page or feature in a `.module.css` file beside its UI, as in `src/pages/settings/ui/Settings.module.css`. Use `:global(...)` for an existing shared class only under a local selector. Keep rules for the same element together and define each selector once.
- Rules for narrow screens and for reduced motion sit at the end of the section or module they affect. There is one phone breakpoint, `max-width: 760px`. Two others are allowed, each for one layout: lesson mode folds its two columns at 860px, and the top bar gives the next lesson a row of its own at 1180px.
- Colours, fonts and radii only through the CSS variables at the top (`var(--accent)`, `var(--line)`…), so both themes work. The dark values are defined once, under `:root[data-theme='dark']`; `settings.ts` and the small script in `index.html` set `data-theme`.
- Check every change in light and dark, and at phone width (390 px): nothing may scroll sideways.
- Class names are lowercase with hyphens, named after what the element is (`lesson-link`, `next-lesson-widget`), not how it looks. A class shared by several pages has a general name (`form-field`), not the name of the first page that used it.
- Motion respects `prefers-reduced-motion`.
- A class that nothing uses any more is deleted with the code that used it.

## Accessibility

- Every input has a visible label or an `aria-label`; icon-only buttons have an `aria-label` and a `data-tooltip` (the short visible hint).
- Tooltips use `data-tooltip`, never `title`: `TooltipLayer` shows them styled, on hover and on keyboard focus, in both themes. `title` stays only where it names something for screen readers, such as an `<iframe>`.
- Groups of toggle buttons use `role="group"` with a label and `aria-pressed`; the current page link has `aria-current="page"`.
- Status messages that appear on their own use `role="status"`; errors use `role="alert"`.

## Dependencies

- Exact versions in `package.json`, no `^` or `~`.
- A new dependency needs a reason a few lines of our own code can't cover. Prefer the platform (`Intl`, `fetch`, `<dialog>`, Web Speech).

## Before a commit (by hand)

1. Read the diff top to bottom.
2. Click through the changed page and the pages next to it, in both themes and at phone width.
3. Type bad input into every changed form field.
4. New text: all seven interface languages filled in, and it reads naturally in each.
5. New feature: a line in the README, a guide or step in the Tutorial, and its item removed from TODO.md.
6. A change students will notice: an entry for today in `src/entities/news/model/news.ts`, so it shows on the News page.
