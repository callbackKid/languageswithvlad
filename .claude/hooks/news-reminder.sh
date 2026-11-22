#!/bin/bash
# When Claude is about to finish a turn: if pages or styles changed but src/entities/news/model/news.ts didn't,
# remind it once that students may need a News entry (CODE_STYLE.md, "Before a commit").
# Each changed file is mentioned only once per session, so the reminder doesn't repeat every turn.
cd "$CLAUDE_PROJECT_DIR" || exit 0
input=$(cat)
[ "$(jq -r '.stop_hook_active // false' <<<"$input")" = "true" ] && exit 0
session=$(jq -r '.session_id // "unknown"' <<<"$input")

changed=$(git status --porcelain 2>/dev/null | cut -c4-)
grep -qx 'src/entities/news/model/news.ts' <<<"$changed" && exit 0
visible=$(grep -E '^(src/shared/ui/|src/(entities|features|widgets|pages)/[^/]+/ui/|src/app/|src/shared/i18n/messages/)' <<<"$changed")
[ -z "$visible" ] && exit 0

seen_file="${TMPDIR:-/tmp}/claude-news-reminder-$session"
touch "$seen_file"
new=$(grep -vxF -f "$seen_file" <<<"$visible")
[ -z "$new" ] && exit 0
echo "$new" >>"$seen_file"

jq -n --arg reason "These files students can see changed, but src/entities/news/model/news.ts did not:
$new
If the change is something students will notice, add an entry for today to src/entities/news/model/news.ts (all seven interface languages). If it isn't (a refactor, an invisible fix), say so in one line and finish." \
  '{decision: "block", reason: $reason}'
exit 0
