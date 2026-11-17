---
name: commit-message
description: Write a good commit message for the changes in languageswithvlad (staged, or uncommitted when nothing is staged), in the repo's own style, and suggest splitting unrelated changes into separate commits. Commits only when asked. Use when asked to write or improve a commit message, describe the changes, or commit.
---

Writes the commit message for what changed, in the style of this repo's best commits. Run the commands from the repo root.

## 1. See what changed

```bash
git status --short
git diff --staged --stat
git diff --staged
```

Nothing staged: use `git diff --stat` and `git diff` (plus the content of new, untracked files) and say that the message covers the unstaged changes. Then the house style:

```bash
git log --format='%s' -20
```

Read the diff itself, not only the file names: the message says what changed for the student or the teacher, which file names don't show.

## 2. One commit or several?

Group the changes by what they are for (a feature, a bug fix, a skill or hook, docs). When two groups have nothing to do with each other, propose one commit per group: list each group's files and its subject line, and ask before staging anything. Small follow-ups of the same work (its News entry, README line, TODO.md cleanup, test data) belong in its commit.

## 3. Write the message

**Subject line**, the one that matters most:

- `<feature or area>: <what it does now, for the person using it>`, in plain English, lowercase except names (News, Claude, German), no full stop.
- The result, not the work: `homework from the document: the Devoirs: block on Home as a checklist with its exercises`, not `homework parsing added` or `updated HomeworkCard.tsx`.
- A bug fix names what was wrong and is now right: `speech: words no longer play by themselves when Home opens`, not `bugs with speech feature fixed`.
- Two related results: join them with `;` (`contrast up to WCAG AA in both themes; verbs tab layout fixes`). More than two: name the main one and put the rest in the body.
- Aim for 72 characters; up to about 100 is fine when the result needs the words. Never `+`, `and stuff`, `fixes`, `wip`.

**Body**, after an empty line, when the subject can't say it all. Wrap at 100 columns, like the code.

- One short paragraph or a few bullets per part: what changed and why, in the reader's terms.
- The decisions someone would otherwise undo: `full tense names ("presente de indicativo"), because plain "presente" is the same in three languages and the app tells a form's language by its tense`.
- `Fixes found on the way:` as bullets, when the work turned up bugs elsewhere.
- Limits left on purpose: `negative forms stay French-only`.
- Mention the News entry, README, Tutorial or TODO.md changes in one line at the end, not file by file.
- No file lists (git shows them), no "this commit", no commit-by-commit history of the session.

**Trailer**: end with the attribution lines this session is configured to add (for example a `Co-Authored-By:` line), after an empty line. Add none of your own beyond those.

## 4. Show it, then commit only if asked

Show the message in a code block. Commit only when the request says to commit; otherwise stop and ask.

Committing:

- On `main`, create a branch first, then offer to fast-forward `main` to it (`git checkout main && git merge --ff-only <branch>`).
- Stage only the files of this commit (`git add <paths>`), never everything at once when the changes were split.
- Run `yarn -s verify && git commit -F - <<'EOF' … EOF`, so a failed check stops the commit. Never `--no-verify`.
- The pre-commit hook may reformat staged files; that is expected. Finish with `git log -1 --stat` and the branch's state.

## Examples from this repo

| Instead of                          | Write                                                                                                           |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `icon bug + verb tables`            | `verb tables for Spanish, Italian and Portuguese; menu and sync icons centred`                                  |
| `bugs with speech feature fixed`    | `speech: Slow is clearly slower, words no longer play by themselves on Home, reading stops on leaving the page` |
| `claude hooks added to the project` | `Claude Code hooks: format and lint after edits, typecheck before a turn ends, guard for keys and --no-verify`  |
| `UI bug fixes`                      | the bugs themselves: `verbs tab: missing tenses look disabled, forms don't break mid-word`                      |
