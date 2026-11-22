# Profile picture: an edit icon with a menu — design

## Why

In Settings, the profile picture has two separate buttons next to it (Change picture, Remove picture). The owner wants it to work like GitHub's: an edit icon on the picture that opens a small menu. It is a cosmetic change to one page.

## Goals

- A small round pencil button on the bottom corner of the picture circle, with `aria-label` and `data-tooltip` (“Edit picture”).
- With a picture: the pencil opens a menu with **Upload a photo…** and **Remove photo**. The menu closes on Escape, on a click outside, and after an item is chosen; both items are reachable from the keyboard, and focus returns to the pencil when it closes.
- Without a picture: the pencil opens the file picker directly (a one-item menu is pointless).
- The circle grows from 72 to 96 px so the pencil doesn't cover much of it.

## Non-goals

- Cropping or choosing which part of the photo shows (GitHub's crop step): not wanted.
- Any change to how the picture is shrunk and stored (`shrinkImage`, `settings.avatar`), or to the top bar's avatar.
- A News entry: cosmetic, like the app icon.

## Approaches

- **A small menu written for this page (chosen).** A button with `aria-haspopup="menu"` / `aria-expanded`, a `role="menu"` list of `role="menuitem"` buttons, closed by Escape and an outside click. The app has no menu component yet; a few lines cover it.
- **A menu library:** rejected, CODE_STYLE prefers the platform and our own few lines over a dependency.
- **The native `popover` attribute:** handles outside click and Escape for free, but its positioning next to the pencil needs anchor positioning, not yet in every browser students use. Rejected for now.

## Design

- In `src/pages/settings/ui/Settings.tsx`, the profile block: the `Avatar` (size 96) inside a `position: relative` wrapper, with the pencil button over its bottom corner; the menu opens under the picture. The two buttons beside the picture go away; the error line (`pictureFailed`) and the name field stay.
- The hidden `<input type="file">` stays; the pencil (no picture) or **Upload a photo…** opens it through a ref (`input.click()`).
- The menu is a small component in the settings page's `ui/` segment (`PictureMenu.tsx`), used only there.
- Texts: “Edit picture”, “Upload a photo…”, “Remove photo” in the Settings messages, all seven languages (the `translator` agent). Old keys `changePicture` / `addPicture` / `removePicture` of Settings are deleted if nothing else uses them.
- CSS in the Settings section of `src/app/styles.css`: the pencil a small circle with `var(--paper)` background and `var(--line)` border, the menu a panel with the same tokens; both themes, 390 px wide without sideways scroll.

## Left to the builder

- The pencil glyph (✎ or a small inline SVG) and the exact offsets.
- README line on Settings (“name and picture”) only if its wording no longer fits.

## Addition: Profile and Interface side by side

Asked by the owner after the menu design: the Profile card gets narrower, with the Interface card beside it.

- On a wide screen, Profile on the left and Interface on the right, in one row at the top of Settings (about 2 : 3, since Interface holds more); `align-items: start`, so each card keeps its own height. Document and the other cards stay full width under them.
- At the phone breakpoint (`max-width: 760px`) the two cards stack, Profile first, as today.
- Interface language becomes a dropdown (`<select>` with a `<label>`), like Translations in under it, instead of the row of seven buttons; the value is checked against `UI_LANGUAGES` before `setUiLanguage`.
