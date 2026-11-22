# Cahier de français

A study app for language lessons: the teacher writes lessons, the app turns each one into vocabulary, verb tables and exercises for the student. React + TypeScript + Vite in `src/`, Vercel serverless functions in `api/` (Claude calls, Google Docs, Notion, Telegram, Zoom). [README.md](README.md) describes every feature and the project structure; read the relevant part before changing a feature.

## Rules

The code rules are in CODE_STYLE.md and are binding; follow them from the first line you write, not only when the hook complains:

@CODE_STYLE.md

## Commands

- `yarn verify` — lint, format check, typecheck and the FSD layer rules (`yarn fsd`, Steiger) for everything. Run it before saying a change is done.
- `yarn typecheck` — app and `api/` together. Don't use `tsc -p .` alone, it misses `api/`.
- `yarn lint:fix`, `yarn format` — fix what can be fixed automatically.
- `yarn start` — UI with the API functions (needs `.env.local`); `yarn dev` — UI only.

## Working here

- **Check UI changes in the running app**, not just with the typecheck: the changed page and its neighbours, light and dark theme, 390 px wide.
- **Stored data is in students' browsers.** Field names of stored or Claude-returned data (`fr`, `ru`, `tr`, `p`, `f`, `inf`, `a`, `b`, `n`…) never change. Changing the shape of a cached value needs a migration on read (see `readAnalysis` / `readConjugation` in `src/entities/lesson/model/bank.ts`) or a new key version (`an2:` → `an3:`); a new key makes every student re-pay Claude for every lesson, so ask before bumping it.
- **Prompts** live only in `api/_lib/prompts.ts`; whatever Claude returns goes through a `normalizeX` function in the `model/normalize.ts` of the slice it belongs to (`src/entities/lesson/model/normalize.ts`, `src/pages/text/model/normalize.ts`…).
- **Texts**: every new interface text in all seven languages in `src/shared/i18n/messages/`, or in the slice's `i18n/` segment when only that slice uses it; write the English, then hand the other six to the `translator` subagent. A change students will notice gets an entry in `src/entities/news/model/news.ts` (text only, no pictures; an entry about the teacher's tools gets `audience: 'teacher'`); a finished TODO item is removed from `TODO.md`.
- **Teacher's tools** (only Make homework so far) are shown only with the teacher code (`useTeacher()` in `src/shared/config/teacher.ts`), and the server checks it too (`checkTeacher` in `api/_lib/http.ts`). A new one does both.
- **Help and tooltips**: a new page passes `guide` to `PageHead` (its Tutorial card, `src/shared/config/guides.ts`); an icon or icon button has `data-tooltip`, never `title`.
- **Tests and the backend**: the owner writes these themselves to learn (Vitest, and a separate Express/Postgres repo). Explain, guide and review; don't write them unless asked.
- **Direction**: lessons will move from the Google Doc / Notion into the app itself. Don't deepen the document-based flow when designing new features.
- **Git**: commit only when asked, with a message that says what changed. Never `--no-verify`. Never read, print or commit `.env.local` or keys.
- **Code review**: `REVIEW.md` is the owner's checklist, partly written for another stack (MUI, tables, `.po` files, `yarn ci:check`); apply only the items that fit this project.
- Talk to the owner in the language they write in (often Russian); code, comments and docs are in English.
