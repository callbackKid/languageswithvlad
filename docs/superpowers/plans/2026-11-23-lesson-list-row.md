# Lesson list as a column or a row, and folded — Implementation Plan

> **For agentic workers:** executed inline (superpowers:executing-plans).

**Goal:** On a wide screen, Lesson history's list can be a column or a row and can be folded; both remembered on the device.

**Spec:** `docs/superpowers/specs/2026-11-23-lesson-list-row-design.md`

## Global Constraints

- CODE_STYLE.md; `localStorage` only through `src/shared/lib/storage.ts`, read values checked.
- The phone breakpoint (760 px) keeps today's row, no buttons.
- Owner writes tests; verification is `yarn verify` and the `run-languageswithvlad` driver at 1280 px and 390 px, light and dark.
- Commit only when asked.

## Review Focus

1. Folded on a computer, then opened on a phone-width window: the list still shows.
2. Switching the view or unfolding brings the open lesson into view.
3. A long list in the column: the panel scrolls, the buttons stay visible.
4. Keyboard: both buttons reachable, `aria-pressed` / `aria-expanded` follow the state.
5. A stored value that isn't one of ours falls back to the defaults.

### Task 1: Model, buttons and CSS

- [ ] `src/pages/lessons/model/listLayout.ts` with the four functions in the spec.
- [ ] `Lessons.tsx`: state from them, the panel and buttons, the classes, the effect's dependencies.
- [ ] English texts in `lessons.ts`; CSS in the Lesson history section and its 760 px block.
- [ ] `yarn verify`; driver: column, row, folded column, folded row at 1280 px in both themes; 390 px unchanged with a folded choice stored.

### Task 2: Texts and docs

- [ ] `translator` for the six languages of the new keys, `lessons.tip9` (guides.ts `tips: 9`) and the News entry for 2026-11-23.
- [ ] README line (Lesson history), TODO.md line removed; `yarn verify`.
