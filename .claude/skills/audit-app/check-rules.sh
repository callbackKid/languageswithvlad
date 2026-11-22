#!/usr/bin/env bash
# The CODE_STYLE.md and REVIEW.md rules that no tool enforces but a search can find. Each block
# prints its title and its matches (file:line: code); an empty block passed. The matches are
# candidates to read, not verdicts: SKILL.md, step 4, says how to judge each one.
#
# bash .claude/skills/audit-app/check-rules.sh
cd "$(git rev-parse --show-toplevel)" || exit 1

CODE='src api'
INCLUDE=(--include='*.ts' --include='*.tsx')
# files that are mostly texts or data, where "as", numbers and words are content, not code
TEXT_FILES='i18n/messages|src/entities/news/model/news\.ts|src/shared/lib/facts\.ts|src/shared/config/guides\.ts|api/_lib/prompts\.ts'
section() { printf '\n## %s\n' "$1"; }
search() { grep -rnE "${INCLUDE[@]}" "$@" $CODE; }
not_comment() { grep -vE '^[^:]+:[0-9]+:\s*(//|\*|/\*)'; }

section 'Naming: abbreviations in function, component and type names'
search '^(export )?(default )?(async )?(function|const|let|type|interface|class) +[a-zA-Z]*[a-z](Conj|Btn|Msg|Prev|Idx|Num|Cfg|Str|Arr|Obj|Res|Req|Err|Tmp|Val|Ctx|Elem|Ex|Txt|Img|Pic|Cnt|Calc|Init|Util|Mgr|Dict|Q)([A-Z0-9]|\b)|^(export )?(default )?(function|const|type|interface) +(Conj|Btn|Msg|Ex|Q)[A-Z]'

section 'Naming: boolean state that does not read as a fact (isX, hasX, needsX, a participle…)'
search 'const \[[a-z][A-Za-z]*, set[A-Za-z]*\] = useState(<boolean>)?\((true|false)\)' |
  grep -vE 'const \[(is|has|needs|can|should|show|was|did)[A-Z][A-Za-z]*,|const \[[a-zA-Z]*(ed|ing|Ready|Open|Visible|Busy|Done|On),'

section 'TypeScript: `as` casts per file (each needs a check on its line or the line above)'
# (a "]" goes first inside brackets in grep -E; "\]" would end them early)
search '[]A-Za-z0-9_)] as [A-Z({]' | grep -vE "$TEXT_FILES" | not_comment |
  grep -vE ' as const\b|^[^:]+:[0-9]+:import |export \{' |
  awk -F: '{count[$1]++} END {for (file in count) printf "%4d  %s\n", count[file], file}' | sort -rn

section 'TypeScript: bare numbers in code (a limit or a delay needs a named constant)'
search '([^A-Za-z0-9_.#-]|^)[0-9]{3,}([^0-9a-zA-Z%_]|$)' | grep -vE "$TEXT_FILES" | not_comment |
  grep -vE 'const [A-Z][A-Z0-9_]* =|[0-9]{4}-[0-9]{2}|\b(19|20)[0-9]{2}\b|status\(|Error\(|status ===|=== [1-5][0-9]{2}\b|>= 500|\* 100\b|60000|86400000|\* 1000\b|/ 1000\b|charCodeAt|\\u|0x|5381' |
  grep -E 'setTimeout|setInterval|slice\(|maxLength|text\(|maxTokens|shrinkImage|width|height|[<>]=? [0-9]{3}'

section 'Imports: heavy libraries at the top of a file (fine only when that file is itself lazy-loaded)'
search "^import [^t].* from '(pdf-lib|@zoom/meetingsdk|@excalidraw/excalidraw|@supabase/supabase-js)'"

section 'React: promises not awaited and not marked with void (calls of api.* and other async helpers)'
search '^\s+(api\.[a-zA-Z]+|run[A-Z][a-zA-Z]*|sync[A-Z]?[a-zA-Z]*|load[A-Z][a-zA-Z]*|fetch[A-Z][a-zA-Z]*)\([^)]*\);?$' --include='*.tsx' |
  grep -vE 'await |void |return |=>'

section 'React: external links without rel="noopener noreferrer"'
search 'target="_blank"' | grep -v 'noopener noreferrer'

section 'React: components that call Claude (api.*) without WaitingFact'
for file in $(grep -rlE 'api\.(analyze|lessonExtras|grammarPractice|bookExercises|conjugate|photo|discussion|textbook|transcribe|explain|translate|study|makeHomework|checkWriting|gaps)\(' $(git ls-files 'src/*.tsx')); do
  grep -qE 'WaitingFact|waiting=' "$file" || echo "$file"
done

section 'Storage: localStorage outside src/shared/lib/storage.ts'
search 'localStorage|sessionStorage' | grep -v 'src/shared/lib/storage.ts'

section 'Storage: saved objects used without a check (load<T>(…) with no normalize/as/sanitize)'
search 'load<[^>]+>\(' | grep -vE 'load<(unknown|string|boolean|number)>|normalize|sanitize|as[A-Z]|Array\.isArray|typeof|function load'

section 'Logic in components: date arithmetic and parsing that belong in src/lib'
grep -nE 'new RegExp|getFullYear|setDate\(|Date\.UTC|\.normalize\(' $(git ls-files 'src/*.tsx')

section 'Texts: plurals by hand (count === 1 ? …) in the interface'
search '(count|length|total|number) === 1 \?' --include='*.tsx'

section 'Texts: dates and numbers formatted by hand instead of Intl (shown to the student?)'
search 'toLocale(Date|Time)?String\(\)|toFixed\(' --include='*.tsx'

section 'Server: Claude answers used without a normalizeX / asX'
search 'await api\.[a-zA-Z]+\(' |
  grep -vE 'normalize|as[A-Z]|api\.(health|checkTeacher|append|feedback|zoomSignature|doc)\('

section 'Server: prompt text outside api/_lib/prompts.ts'
grep -rnE "${INCLUDE[@]}" 'Return (only )?(a )?JSON|Answer with JSON|Reply with only|You are a' api src | grep -v 'api/_lib/prompts.ts'

section 'Server: request fields read without text()/asLevel/asLanguage or a size limit'
grep -nE 'request\.body\??\.[a-zA-Z]+' api/*.ts |
  grep -vE 'text\(|as[A-Z][a-zA-Z]*\(|readImages|typeof request\.body|=== (true|.[a-z]+.)|Array\.isArray|lessonTarget|sentenceCount|: unknown = request|request\.body\?\.(action|lesson) (===|!==|\?\?)'

section 'Server: errors sent as sentences instead of snake_case codes (shown in English to everyone)'
grep -rnE "(error: |Error\([0-9]+, )['\`][^'\`]*[ A-Z.][^'\`]*['\`]" api

section 'Server: error codes the app has no text for (ERROR_TEXTS in src/shared/api/index.ts)'
for code in $(grep -rhoE "(error: |Error\([0-9]+, )'[a-z_]+'" api | grep -oE "'[a-z_]+'" | tr -d "'" | sort -u); do
  grep -qE "^\s+$code: '" src/shared/api/index.ts || [ "$code" = access_code ] || echo "$code"
done

section 'Server: limits written as numbers instead of named constants'
grep -nE 'text\([^,]+, [0-9]+\)|\.slice\(0, [0-9]+\)' api/*.ts api/_lib/*.ts | grep -v 'console\.'

section 'Comments: exported functions and components without a comment above them'
for file in $(git ls-files 'src/*.ts' 'src/*.tsx' 'api/*.ts' | grep -v 'i18n/messages'); do
  awk -v file="$file" '
    /^export (default )?(async )?function |^export const [a-zA-Z]+ = (\(|async|<)/ {
      if (previous !~ /\*\/\s*$/ && previous !~ /^\s*\/\// && previous !~ /^\s*\*/)
        print file ":" NR ": " $0
    }
    { if ($0 !~ /^\s*$/) previous = $0 }' "$file"
done

section 'Comments: a one-line /** … */ or /* … */ (one line is //; JSX and CSS keep /* */)'
search '^\s*/\*.*\*/\s*$'

section 'Comments: eslint-disable without a reason on the same line, and silenced exhaustive-deps'
search 'eslint-disable' | grep -vE 'eslint-disable[a-z-]* [a-z@/-]+(, [a-z@/-]+)* -- .'
search 'eslint-disable.*exhaustive-deps'

section 'Styles: colours written out instead of var(--…) (outside the colour variables at the top)'
awk '/^:root|^\[data-theme|:root\[data-theme/ {inVars=1} inVars && /^}/ {inVars=0; next}
  !inVars && /#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/ && !/var\(--/ {print "src/app/styles.css:" NR ": " $0}' src/app/styles.css

section 'Styles: breakpoints other than 760px (and 860px for lesson mode, 1180px for the top bar)'
grep -nE '@media[^{]*(max|min)-width' src/app/styles.css | grep -vE '760px|860px|1180px' | sed 's|^|src/app/styles.css:|'

section 'Styles: animations and transitions vs prefers-reduced-motion'
printf 'animation or transition rules: %s; reduced-motion blocks: %s (each animated part needs one)\n' \
  "$(grep -cE '^\s*(animation|transition)' src/app/styles.css)" "$(grep -c 'prefers-reduced-motion' src/app/styles.css)"

section 'Styles: classes no component uses (a class built with `${…}` shows up here too: check)'
for class in $(grep -oE '\.[a-z][a-z0-9-]*[a-z0-9]' src/app/styles.css | sort -u | sed 's/^\.//'); do
  grep -rqE --include='*.tsx' --include='*.ts' --include='*.html' \
    "(^|[\"'\` ])$class([\"'\` ]|$)" src index.html || echo ".$class"
done | grep -vE '^\.(js|ts|tsx|css|svg|png|com|json|md)$'

section 'Accessibility: title= on an HTML element other than <iframe> (tooltips use data-tooltip)'
search '<[a-z][a-z0-9]*\b[^>]*\btitle=' --include='*.tsx' | grep -v '<iframe'

section 'Dependencies: versions that are not exact'
node -e '
  const pkg = require("./package.json");
  for (const group of ["dependencies", "devDependencies"])
    for (const [name, version] of Object.entries(pkg[group] ?? {}))
      if (!/^\d+\.\d+\.\d+$/.test(version)) console.log(`${group}: ${name} ${version}`);'

section 'REVIEW: helpers defined in more than one file (duplicated code)'
grep -rhoE "${INCLUDE[@]}" '^(export )?(const|function) [a-z][A-Za-z]+' src api |
  sed -E 's/^(export )?(const|function) //' | sort | uniq -d |
  grep -vE '^(handler|subscribe|listeners|current|text|row|copy|report|state|value|done|label|key|data|lines|out|list|words|items|base)$' |
  while read -r name; do
    printf '%s: %s\n' "$name" "$(grep -rlE "${INCLUDE[@]}" "^(export )?(const|function) $name\b" src api | tr '\n' ' ')"
  done

section 'REVIEW: user data put into a URL without encodeURIComponent'
search '(fetch\(|href=\{?|url *=|src=\{?)`[^`]*\$\{' | grep -vE 'encodeURIComponent|\$\{(url|API_URL|BASE_URL)\}'

section 'REVIEW: busy state (loading, sending…) with neither catch nor finally to reset it'
for file in $(grep -lE "set(State|Loading|Busy|Sending|Saving|Checking)\((true|'loading'|'sending'|'saving'|'checking')\)" $(git ls-files 'src/*.tsx')); do
  grep -qE 'finally|catch' "$file" || echo "$file"
done

section 'Completeness: pages without a guide (PageHead guide=…, the Tutorial card)'
grep -nE '<PageHead' $(git ls-files 'src/*.tsx') | grep -v 'guide=' | grep -v 'Tutorial.tsx'

section 'Completeness: sections in the menu without a Tutorial card or a README Pages row'
for path in $(grep -oE "'/[a-z-]+'" src/shared/config/routes.ts | tr -d "'" | sort -u); do
  grep -q "\`$path" README.md || echo "README Pages table has no $path"
done
