#!/bin/bash
# After Claude edits a file: fix it with ESLint and Prettier, the same tools the pre-commit hook runs.
# ESLint errors that can't be fixed are sent back to Claude (exit 2) so it fixes them at once.
cd "$CLAUDE_PROJECT_DIR" || exit 0
file=$(jq -r '.tool_input.file_path // empty')
[ -f "$file" ] || exit 0
case "$file" in "$CLAUDE_PROJECT_DIR"/node_modules/* | "$CLAUDE_PROJECT_DIR"/dist/*) exit 0 ;; "$CLAUDE_PROJECT_DIR"/*) ;; *) exit 0 ;; esac

case "$file" in
  *.ts | *.tsx | *.js | *.mjs)
    if ! errors=$(node_modules/.bin/eslint --fix "$file" 2>&1); then
      echo "ESLint errors left in $file after --fix:" >&2
      echo "$errors" >&2
      exit 2
    fi
    ;;
esac
node_modules/.bin/prettier --write --ignore-unknown --log-level warn "$file" >&2 || true
exit 0
