---
name: commit-and-push
description: Commit the changes in languageswithvlad with a message written by the commit-message skill, then push the branch to GitHub, without stopping to ask in between. Use only when the owner asks to commit and push, or types /commit-and-push; a request to commit alone does not push.
---

Commits the current changes in the repo's style and pushes them. The owner asked for this to run straight through: no "shall I commit?" and no "shall I push?" in between. Stop only for the problems listed below. Run the commands from the repo root.

## 1. Before anything

```bash
git status --short --branch
git fetch --quiet
git status --short --branch
```

- Nothing to commit and nothing ahead of `origin`: say so and stop.
- The branch is **behind** `origin` (someone pushed from another machine or from GitHub): stop and say so. Don't pull, rebase or merge on your own; the owner decides.
- Nothing to commit but commits ahead of `origin`: skip to step 3 and push them.

## 2. Commit

Invoke the `commit-message` skill with the Skill tool, with the argument `commit`, and follow it, with these differences:

- **Don't ask before committing.** When the changes split into unrelated groups, make one commit per group, each with its own message, without asking first.
- Its "no push" rule doesn't apply here: this skill pushes in step 3.

Its other rules still hold: stage only the files of each commit, `yarn -s verify && git commit …` so a failed check stops the commit, never `--no-verify`. If a check fails, fix what it reports when the fix is obvious and small (formatting, an unused import), then commit; otherwise stop and report the error without pushing.

## 3. Push

```bash
git log --oneline @{upstream}..HEAD
git push
git status --short --branch
```

- Push the current branch to its own upstream with a plain `git push`. Never `--force` or `--force-with-lease`, never `--no-verify`, never push a branch that has no upstream (ask instead).
- Rejected because `origin` moved meanwhile: stop and report it. The commits stay local and nothing is lost.
- Asked for a password or a device code: git's login has expired. Tell the owner to run `! gh auth login --web --git-protocol https` and try again.

## 4. Report

In a few lines: each commit's short hash and subject, that the push went through, and that the branch now matches `origin`. Show a commit's full message only when it has a body worth reading.
