#!/bin/bash
# Before Claude uses a tool: hard stops for the rules in CLAUDE.md that must never be broken.
# Secrets in .env files stay unread, the pre-commit hook can't be skipped, generated files aren't edited by hand.
input=$(cat)
tool=$(jq -r '.tool_name' <<<"$input")

deny() {
  jq -n --arg reason "$1" \
    '{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: $reason}}'
  exit 0
}

# .env, .env.local, .env.production… but not .env.example, which holds no secrets
is_env_file() { grep -qE '(^|/)\.env(\.[A-Za-z]+)*$' <<<"$1" && ! grep -qE '\.example$' <<<"$1"; }

case "$tool" in
  Bash)
    command=$(jq -r '.tool_input.command // empty' <<<"$input")
    if grep -qE '\bgit\b.*--no-verify|HUSKY=0' <<<"$command"; then
      deny "Skipping the pre-commit hook is not allowed (CLAUDE.md). Fix what the hook reports and commit again."
    fi
    if grep -qE '(^|[^A-Za-z0-9_.])\.env(\.[A-Za-z]+)*([^A-Za-z0-9_.]|$)' <<<"$command" && ! grep -qE '\.env\.example' <<<"$command"; then
      deny "Commands that touch .env files are blocked: they hold API keys. Ask the owner to check the value instead."
    fi
    ;;
  Read)
    path=$(jq -r '.tool_input.file_path // empty' <<<"$input")
    is_env_file "$path" && deny "Reading $path is blocked: it holds API keys. Ask the owner to check the value instead."
    ;;
  Edit | Write | NotebookEdit)
    path=$(jq -r '.tool_input.file_path // .tool_input.notebook_path // empty' <<<"$input")
    is_env_file "$path" && deny "Writing $path is blocked: it holds API keys. Ask the owner to change it."
    case "$path" in
      */yarn.lock) deny "yarn.lock is generated: change package.json and run yarn install instead." ;;
      */dist/* | */node_modules/*) deny "$path is generated: change the source and rebuild instead." ;;
    esac
    ;;
esac
exit 0
