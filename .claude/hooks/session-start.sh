#!/bin/bash
# At the start of a session: a short briefing that goes into Claude's context, so it starts knowing
# where the work stands. Everything printed here is read by Claude.
cd "$CLAUDE_PROJECT_DIR" || exit 0
# how many lines of uncommitted changes to show before cutting off
MAX_CHANGED_FILES=25

echo "## Project state at session start"
echo
echo "Branch: $(git branch --show-current 2>/dev/null)"
echo
echo "Last commits:"
git log --oneline -5 2>/dev/null | sed 's/^/  /'
echo
changes=$(git status --short 2>/dev/null)
if [ -n "$changes" ]; then
  echo "Uncommitted changes ($(wc -l <<<"$changes" | tr -d ' ') files):"
  head -n "$MAX_CHANGED_FILES" <<<"$changes" | sed 's/^/  /'
else
  echo "No uncommitted changes."
fi
if [ -f TODO.md ]; then
  echo
  echo "Open tasks in TODO.md (headings only; read the file for details):"
  grep -E '^#{2,4} ' TODO.md | sed 's/^/  /'
fi
exit 0
