#!/bin/bash
# When Claude is about to finish a turn: typecheck the app and api/. On errors, Claude is sent
# back to fix them instead of stopping. Runs only when TypeScript files have uncommitted changes.
cd "$CLAUDE_PROJECT_DIR" || exit 0
# a second stop after being sent back once: let it end, so a stuck error can't loop forever
[ "$(jq -r '.stop_hook_active // false')" = "true" ] && exit 0
git status --porcelain | grep -qE '\.(ts|tsx)$' || exit 0

if ! errors=$(yarn -s typecheck 2>&1); then
  jq -n --arg reason "yarn typecheck failed. Fix these errors before finishing:
$errors" '{decision: "block", reason: $reason}'
fi
exit 0
