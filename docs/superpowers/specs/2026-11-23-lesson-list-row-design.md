# Lesson history: the lesson list as a column or a row, and folded — design

## Why

On a computer, Lesson history shows the lessons as a 200 px column on the left of the open lesson. The owner wants to choose a row of lessons across the top instead (scrolled sideways, as on a phone), and to fold the list away like the main menu («), so the lesson gets the room.

## Goals

- On a wide screen, two round icon buttons at the start of the lesson list:
  - **Lessons in a row** (`aria-pressed`): the column on the left ↔ a row above the lesson, full width, scrolled sideways, with the open lesson brought to the middle.
  - **Hide / Show the lesson list** (`aria-expanded`, `aria-controls`): the column folds to a thin strip with only the buttons; the row hides, leaving the buttons.
- Both choices are remembered on the device (`load` / `save`, like `menu-open`).
- Tooltips (`data-tooltip`) and `aria-label`s on both buttons; texts in seven languages.

## Non-goals

- The phone (≤ 760 px): unchanged, always a row, no buttons, never folded.
- The Downloaded lessons tab and lesson mode.
- A setting in Settings: the buttons sit by the list (owner's agreement to the proposal).

## Approaches

- **Buttons by the list, layout by CSS classes (chosen).** `Lessons.tsx` keeps the two choices and sets classes on `.layout`; the CSS does the rest, reusing the phone's row rules for the wide row.
- **A Settings option:** rejected in the conversation: switching where you look is quicker.

## Design

- `src/pages/lessons/model/listLayout.ts`: `type LessonListView = 'column' | 'row'`, `readListView()`, `saveListView(view)`, `readListOpen()`, `saveListOpen(open)` over the keys `lessons-view` and `lessons-open` (checked on read; defaults column and open).
- `Lessons.tsx`: the list and the buttons inside `<div className="lessons-panel">`; `.layout` gets `lessons-as-row` and/or `lessons-folded`. The scroll-into-view effect also re-runs when the view or the fold changes.
- CSS (Lesson history section): column mode as today, the panel sticky; folded column a narrow first grid column; row mode a single grid column with the panel as a flex row (buttons, then the scrolling list); folded row only the buttons. At 760 px the buttons are hidden and the list always shows as today's row.
- Icons: small inline SVGs on the 16×16 grid like `ButtonIcon` (three boxes in a row; « / » for the column, ˄ / ˅ for the row).
- Texts in `src/pages/lessons/i18n/lessons.ts`: `listAsRow` “Lessons in a row”, `hideList` “Hide the lesson list”, `showList` “Show the lesson list”.
- Docs: a Tutorial tip on the lessons card, a README line, a News entry, the TODO.md line removed.
