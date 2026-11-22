# Profile picture: an edit icon with a menu — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** In Settings, a pencil button on the profile picture opens a menu (Upload a photo…, Remove photo) instead of the two buttons beside it.

**Architecture:** A small `PictureMenu` component in the settings page's `ui/` segment owns the pencil, the menu and the hidden file input; `Settings.tsx` passes it whether there is a picture and two callbacks. Upload, shrinking and storage stay in `Settings.tsx` as they are.

**Tech Stack:** React + TypeScript, CSS in `src/app/styles.css`.

**Spec:** `docs/superpowers/specs/2026-11-22-profile-picture-menu-design.md`

## Global Constraints

- CODE_STYLE.md is binding: `type="button"`, `data-tooltip` not `title`, texts in all seven languages, colours only through variables (`var(--paper)`, `var(--line)`, `var(--text)`), whole-word names.
- The circle is 96 px (`Avatar size={96}`); the top bar's avatar is unchanged.
- No News entry (cosmetic). No new dependency.
- Tests are written by the owner: none here. Each task ends with `yarn verify` and a browser check.
- Commit only when the owner asks.

## Review Focus

1. **Keyboard**: Tab to the pencil, Enter opens the menu with focus on its first item, ↑/↓ move, Escape closes and focus returns to the pencil (Task 1, step 4).
2. **Choosing the same file twice** (after Remove): the input's value is reset, so `change` still fires (kept from today's code) (Task 1, step 4).
3. **A click outside, or on the pencil again, while open** closes the menu without opening the file picker (Task 1, step 4).
4. **390 px, both themes**: the menu doesn't go past the screen edge, nothing scrolls sideways (Task 1, step 4).
5. **A picture that fails to open**: `pictureFailed` still shows under the picture (Task 1, step 4).

---

### Task 1: The pencil and its menu

**Files:**

- Create: `src/pages/settings/ui/PictureMenu.tsx`
- Modify: `src/pages/settings/ui/Settings.tsx:153-185` (the profile block)
- Modify: `src/pages/settings/i18n/settings.ts` (all seven blocks)
- Modify: `src/app/styles.css` (Settings section, next to `.settings-profile`)

**Interfaces:**

- Produces: `export default function PictureMenu({ hasPicture, onFile, onRemove }: { hasPicture: boolean; onFile: (file: File) => void; onRemove: () => void })`, rendered with `<Avatar size={96} />` as its child inside a `.settings-picture` wrapper (`position: relative`).

- [ ] **Step 1: Texts.** In `settingsText`, English: `editPicture: 'Edit picture'`, `uploadPicture: 'Upload a photo…'`, `removePhoto: 'Remove photo'`. Delete `addPicture`, `changePicture`, `removePicture` (only `Settings.tsx` uses them). The `translator` agent fills the other six.
- [ ] **Step 2: `PictureMenu`.** The pencil: `<button type="button" className="picture-edit" aria-label={t('editPicture')} data-tooltip={t('editPicture')}>` with an inline SVG pencil (`aria-hidden`); with a picture it carries `aria-haspopup="menu"` and `aria-expanded`, and toggles the menu; without one it calls `input.click()` on a ref'd hidden `<input type="file" accept="image/*">` (whose `onChange` resets its value, then `onFile`). The menu: `<div role="menu" className="picture-menu">` of two `<button type="button" role="menuitem">`; on open, focus the first item; ↑/↓ move between items; Escape or a `pointerdown` outside the wrapper (document listener, added while open and removed on close) closes it and returns focus to the pencil; choosing an item closes it first.
- [ ] **Step 3: Settings and CSS.** Replace the `<Avatar size={72} />` and the `row-actions` with the two buttons by `<PictureMenu hasPicture={!!settings.avatar} onFile={(file) => void choosePicture(file)} onRemove={() => updateSettings({ avatar: '' })} />`. CSS: `.settings-picture` relative, `flex: none`; `.picture-edit` a 32 px circle at the bottom right of the circle, `var(--paper)` background, `1px solid var(--line)` border, `var(--text)` colour; `.picture-menu` absolute under the picture, left-aligned, `var(--paper)` background, `var(--line)` border, radius and shadow as the app's other panels, items full width; `.settings-profile .avatar.letter` font-size up to fit 96 px.
- [ ] **Step 4: Verify.** `yarn verify` passes. With the `run-languageswithvlad` driver, in light and dark at 390 px: no picture → the pencil opens the file picker (check the input gets clicked, e.g. through `eval`); with a picture (set `avatar` in settings through `eval` + reload) → pencil opens the menu, Escape closes it with focus back on the pencil, a click outside closes it, **Remove photo** brings back the letter; screenshots of the open menu in both themes, no sideways scroll, no console errors.

---

### Task 2: Profile and Interface side by side

**Files:**

- Modify: `src/pages/settings/ui/Settings.tsx` (the Profile and Interface sections)
- Modify: `src/app/styles.css` (Settings section)

- [ ] **Step 1: Order and wrapper.** Move the Interface section up so it follows Profile, and wrap both in `<div className="settings-top">`. CSS: `.settings-top` a grid of `2fr 3fr`, gap 18 px, `align-items: start`, margin-bottom 18 px; its cards lose their own bottom margin; one column under the 760 px breakpoint (at the end of the Settings section).
- [ ] **Step 2: Interface language as a dropdown.** Replace the `seg` group by a `<select id="settings-ui-language" className="settings-select">` with a `<label className="settings-label" htmlFor=…>`, options `{flag} {name}` from `UI_LANGUAGES`; `onChange` finds the option by id and calls `setUiLanguage(option.id)` (same shape as Translations in).
- [ ] **Step 3: Verify.** `yarn verify` passes. Driver at 1280 px and 390 px, light and dark: the two cards side by side on desktop and stacked on a phone, no sideways scroll; changing the interface language from the dropdown switches the page's texts.
