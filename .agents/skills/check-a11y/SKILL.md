---
name: check-a11y
description: Check accessibility (a11y) of the languageswithvlad UI - every page and lesson tab, or one changed page - with axe-core in a real browser in light and dark theme, plus a review of the code against the Accessibility rules in CODE_STYLE.md. Use when asked to check accessibility, a11y, contrast, screen reader support, labels or keyboard use, or before shipping a UI change.
---

Two halves: **axe-core** finds what a machine can see on the rendered page (missing labels and names, broken ARIA, colour contrast, heading order); a **code review** covers what it can't (whether a label makes sense, keyboard flow, status messages). Both run on the driver of the `run-languageswithvlad` skill. All paths are relative to the repo root.

## Setup (once per machine)

The same cache folder as the run skill, with axe-core added:

```bash
npm install --prefix ~/.cache/languageswithvlad-playwright --no-save --silent playwright-core@1.48.2 axe-core@4.10.2
```

## 1. Automated check (axe-core)

Start the dev server as in the run skill (`yarn dev --port 5173 --strictPort` as a background task, then wait for `curl -sf http://localhost:5173/`).

**Whole site** - every menu page and every lesson tab, light and dark, 390 px:

```bash
node .agents/skills/run-languageswithvlad/driver.mjs < .agents/skills/check-a11y/all-pages.steps > "$TMPDIR/a11y-report.txt"
grep -E 'kinds of violation|failed' "$TMPDIR/a11y-report.txt" | sort -u
```

**One page** - the steps that reach it, then `a11y <name>`:

```bash
node .agents/skills/run-languageswithvlad/driver.mjs <<'EOF'
nav /lessons
click tab /^Verbs/
click button /se lever/
a11y lesson-verbs
EOF
```

Each violation is one line: theme, page, impact (`critical` > `serious` > `moderate` > `minor`), the axe rule id, how many elements, what's wrong, and up to three CSS selectors. Rules are WCAG 2.1 A and AA plus axe's best practices. For a rule's details: `https://dequeuniversity.com/rules/axe/4.10/<rule-id>`.

Check a changed page at desktop width too: `--width 1280`.

## 2. Code review (what axe can't judge)

Read the changed components against CODE_STYLE.md, section Accessibility, and also:

- **Labels say what the control does**, in every interface language, not just exist. An icon button (🔈, ☆, ↻) has both `aria-label` and `data-tooltip` (never `title`: CODE_STYLE.md, Accessibility).
- **Toggle groups**: `role="group"` with `aria-label`, `aria-pressed` on each button. This finds groups without a label (expect 0):
  ```bash
  grep -rn 'role="group"' src --include='*.tsx' | grep -vc 'aria-label'
  ```
- **Keyboard**: everything clickable is a `<button>` or `<a>`, not a `div` with `onClick`; focus moves sensibly when a dialog, quiz question or drill opens (`autoFocus`, refs); Enter submits forms.
- **Messages that appear by themselves** use `role="status"`, errors `role="alert"`.
- **Language**: words in the language being learned carry `lang={language}`, Russian carries `lang="ru"`, so screen readers pronounce them right.
- **Motion** respects `prefers-reduced-motion`.

## Reporting

Group findings by rule, most severe first, with the page, theme and selector; say which are in the changed code and which were already there. Fix contrast through the colour variables at the top of `src/app/styles.css` (both themes), not per element.

## Known findings

None: the full sweep on 17.11.2026 found 0 violations in both themes, after the text colours were darkened and `--accent-text` was added. Any violation a new sweep reports is new.

List here any violation that is left on purpose, with the reason, so later sweeps don't chase it.

## Colours

The sweep prints each failing colour pair with its ratio (`#787774 on #f7f7f5 4.17:1 (needs 4.5:1)`). Fill colours with white text on them use `--accent`; blue text uses `--accent-text`, which is darker in light theme and lighter in dark theme, because one blue can't pass on both. Disabled controls are exempt from the contrast rule.

## Gotchas

- The pages run on the test lesson from `run-languageswithvlad/fixtures.mjs`; endpoints it doesn't cover answer `{}`, so pages like Grammar or Discuss show their empty or error state. That state gets checked, not the filled one; add fixture data to check the filled one.
- `/document` (Google Docs editor) and `/call` (Zoom, the board) load third-party frames and are left out of `all-pages.steps`.
- Contrast is measured on the rendered colours, so the same element can pass in one theme and fail in the other: always run both.
