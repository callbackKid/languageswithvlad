// Checks every interface text (src/shared/i18n/messages/*.ts) and every News entry in all seven languages
// for what the type checker can't see: placeholders and tags that differ from English, plural forms
// a language needs, quotes and apostrophes of the wrong kind, "..." instead of "…", texts left in
// English, stray spaces. Prints one line per finding; the exit code is 1 when there are any.
//
// npx tsx .claude/skills/audit-app/check-texts.ts [--only <file>]
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

type Message = string | Record<string, string>;
type Dictionary = Record<string, Record<string, Message>>;

const ROOT = process.cwd();
const MESSAGES_DIR = join(ROOT, 'src/shared/i18n/messages');
const LANGUAGES = ['en', 'ru', 'fr', 'de', 'es', 'pt', 'it'] as const;
// the plural forms each language needs for whole counts (Intl.PluralRules, ignoring `many` for
// millions in French, Spanish, Italian and Portuguese, where `other` is the right fallback)
const PLURAL_FORMS: Record<string, string[]> = {
  en: ['one', 'other'],
  ru: ['one', 'few', 'many', 'other'],
  fr: ['one', 'other'],
  de: ['one', 'other'],
  es: ['one', 'other'],
  pt: ['one', 'other'],
  it: ['one', 'other'],
};
// quotes a language must not use (CODE_STYLE.md, Texts); straight " is wrong everywhere
const WRONG_QUOTES: Record<string, RegExp> = {
  en: /[«»„]/,
  ru: /[“”„]/,
  fr: /[“”„]/,
  de: /[«»”]/,
};
// texts this short, or made only of these, are the same in every language on purpose
const SAME_EVERYWHERE =
  /^[\s\p{P}\p{S}\p{N}{}A-Z0-9]*$|^(Claude|Anki|Zoom|Notion|Google|Telegram|OK|PDF|A\d|B\d|C\d)/u;
const MIN_UNTRANSLATED_LENGTH = 14;

const only = process.argv.includes('--only')
  ? process.argv[process.argv.indexOf('--only') + 1]
  : '';
const findings: string[] = [];
const report = (where: string, problem: string, text = '') =>
  findings.push(`${where}: ${problem}${text ? `  ⟨${text.slice(0, 110)}⟩` : ''}`);

const placeholders = (text: string) =>
  [...text.matchAll(/\{([\p{L}\p{N}_]+)\}/gu)]
    .map((match) => match[1])
    .sort()
    .join(',');
const tags = (text: string) =>
  [...text.matchAll(/<\/?(\w+)\/?>/g)]
    .map((match) => match[0])
    .sort()
    .join(',');
const forms = (message: Message): string[] =>
  typeof message === 'string' ? [message] : Object.values(message);

function checkText(where: string, language: string, text: string) {
  if (/"/.test(text)) report(where, 'straight " quote', text);
  if (/\p{L}'\p{L}|\s'|'\s|^'|'$/u.test(text))
    report(where, "straight ' apostrophe or quote", text);
  if (/\.\.\./.test(text)) report(where, '"..." instead of "…"', text);
  if (WRONG_QUOTES[language]?.test(text)) report(where, `quotes of another language`, text);
  if (/ {2,}/.test(text)) report(where, 'double space', text);
  if (/^\s|\s$/.test(text)) report(where, 'leading or trailing space', text);
  if (/ [,.;:!?)](?!\S*\})/.test(text) && language !== 'fr')
    report(where, 'space before punctuation', text);
  if (language === 'fr' && /\p{L}[;:!?](\s|$)/u.test(text))
    report(where, 'French needs a (no-break) space before ; : ! ?', text);
  // German relative clauses repeat articles on purpose: "die Notizen, die die App liest"
  const repeated = /(?<![\p{L}])(\p{L}+) \1(?![\p{L}])/iu.exec(text)?.[1];
  if (repeated && !(language === 'de' && /^(die|der|das|den|dem)$/i.test(repeated)))
    report(where, `repeated word “${repeated}”`, text);
}

function checkDictionary(file: string, name: string, dictionary: Dictionary) {
  const english = dictionary.en ?? {};
  for (const [key, englishMessage] of Object.entries(english)) {
    const englishForms = forms(englishMessage);
    const englishPlaceholders = new Set(englishForms.map(placeholders));
    const englishTags = new Set(englishForms.map(tags));
    for (const language of LANGUAGES) {
      const where = `${file} ${name}.${language}.${key}`;
      const message = dictionary[language]?.[key];
      if (message === undefined) {
        report(where, 'missing');
        continue;
      }
      if (typeof message !== 'string') {
        const missing = PLURAL_FORMS[language]?.filter((form) => !(form in message)) ?? [];
        if (missing.length) report(where, `plural forms missing: ${missing.join(', ')}`);
      } else if (typeof englishMessage !== 'string' && /\{count\}/.test(englishForms[0] ?? '')) {
        report(where, 'English has plural forms, this language a single text', message);
      }
      for (const text of forms(message)) {
        // a form like ru "one" may write the number as a word ("один"), so compare the union
        const own = placeholders(text);
        if (
          !englishPlaceholders.has(own) &&
          ![...englishPlaceholders].some((set) => set.includes(own))
        )
          report(where, `placeholders {${own}} ≠ English {${[...englishPlaceholders][0]}}`, text);
        if (!englishTags.has(tags(text))) report(where, `tags differ from English`, text);
        checkText(where, language, text);
        if (
          language !== 'en' &&
          text.length >= MIN_UNTRANSLATED_LENGTH &&
          englishForms.includes(text) &&
          !SAME_EVERYWHERE.test(text)
        )
          report(where, 'same as English (untranslated?)', text);
      }
    }
  }
}

const files = readdirSync(MESSAGES_DIR).filter((file) => file.endsWith('.ts'));
for (const file of files) {
  if (only && !file.includes(only)) continue;
  const module = (await import(pathToFileURL(join(MESSAGES_DIR, file)).href)) as Record<
    string,
    unknown
  >;
  for (const [name, value] of Object.entries(module))
    if (value && typeof value === 'object' && 'en' in value)
      checkDictionary(file, name, value as Dictionary);
}

if (!only || only.includes('news')) {
  const { NEWS } = (await import(
    pathToFileURL(join(ROOT, 'src/entities/news/model/news.ts')).href
  )) as {
    NEWS: { date: string; items: { text: Record<string, string> }[] }[];
  };
  let previous = '9999-99-99';
  for (const day of NEWS) {
    if (day.date >= previous) report(`news.ts ${day.date}`, `not newest first (after ${previous})`);
    previous = day.date;
    day.items.forEach((item, index) => {
      for (const language of LANGUAGES) {
        const text = item.text[language];
        const where = `news.ts ${day.date}#${index}.${language}`;
        if (!text) report(where, 'missing');
        else {
          checkText(where, language, text);
          if (language !== 'en' && text === item.text.en) report(where, 'same as English', text);
        }
      }
    });
  }
}

process.stdout.write(findings.join('\n') + `\n${findings.length} findings\n`);
process.exitCode = findings.length ? 1 : 0;
