# Working with Claude Code: keep sessions short

Claude Code's usage insights showed that 93% of the sessions in one day stayed open across 8 or more separate hours without being cleared. This page explains why that is a problem ("context rot") and how this project avoids it.

## What happens in a long session

Every message Claude answers re-reads the whole conversation so far: every file it read, every command's output, every screenshot. One long session that moves from task to task (a bug fix, then hooks, then accessibility, then verb tables…) costs in four ways:

1. **Cost and usage limits.** Each new message processes the whole history again. Prompt caching makes re-reading cheaper, but the cache expires after a pause, and after a break the full history is processed at full price. Long sessions use up the usage limits much faster.
2. **Stale information.** Claude still "sees" files as they were when it first read them. After the code has changed many times, an old version can lead to an edit against code that no longer exists, or to a function name that was renamed since.
3. **Diluted attention.** Decisions from days ago, including ones that were later reversed, sit next to today's. The more there is, the easier it is to mix up what still holds.
4. **Lossy summaries.** When the context fills up, the older part is summarised automatically, and its details are lost.

## What to do instead

1. **One task, one session.** Type `/clear` (or start a new session) when you move on to an unrelated task. This project carries what matters from one session to the next:

   - `CLAUDE.md` and `CODE_STYLE.md`: the rules;
   - the session-start hook (`.claude/hooks/session-start.sh`): the branch, recent commits, uncommitted changes and open TODO items;
   - `TODO.md` and Claude's memory: decisions and open work.

   A fresh session starts informed but not cluttered.

2. **Write it down before clearing.** If something should outlive the session, put it somewhere permanent first: "add this to TODO.md", "remember that…", or a commit message that says what changed and why. A one-minute handoff is cheaper than carrying hours of history.
3. **`/compact` instead of `/clear`** in the middle of one feature, to keep going with a shorter history. Say what to keep: `/compact keep the decisions about verb tables`.
4. **`/resume`** goes back to a specific earlier session when needed, instead of one session that never ends.
5. **Plan mode for big features** (Shift+Tab): the plan is saved to a file, so it survives `/clear`, and a new session can pick it up.
6. **See it coming:** `/context` shows how full the context is. A personal hook (`~/.claude/hooks/session-age.sh`, in `~/.claude/settings.json`) shows a reminder once a session is more than 4 hours old, then at most once an hour; `/clear` starts the count again.
