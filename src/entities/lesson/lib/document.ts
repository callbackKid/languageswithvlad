import { splitTranscription, type Word } from '@/entities/word/@x/lesson';
import { type Language } from '@/shared/config/languages';
import { hash } from '@/shared/lib/util';

import { type Analysis, type Lesson, type LessonWord } from '../model/types';
import { notionIdFrom } from './source';

// The lessons' source from a pasted link: a Google Docs id, or "notion-<id>" for a Notion page.
export function docIdFrom(input: string): string | null {
  const text = input.trim();
  const notion = notionIdFrom(text);
  if (notion) return notion;
  if (/^notion-[0-9a-f]{32}$/.test(text)) return text;
  // same bounds as the server, which rejects anything longer
  const match = text.match(/\/d\/([a-zA-Z0-9_-]{20,100})(?![a-zA-Z0-9_-])/);
  if (match?.[1]) return match[1];
  return /^[a-zA-Z0-9_-]{20,100}$/.test(text) ? text : null;
}

// The document's text without Markdown escapes, trailing spaces and runs of blank lines.
export function clean(text: string): string {
  return text
    .replace(/\r/g, '')
    .replace(/\\([!_[\]*`#+\-.()~>|{}])/g, '$1')
    .split('\n')
    .map((line) => line.replace(/\s+$/, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
}

// The heading words a lesson may start with, and how each is shown.
const LESSON_WORDS: [RegExp, LessonWord][] = [
  [/^lesson$/i, 'Lesson'],
  [/^lektion$/i, 'Lektion'],
  [/^(?:lecci[óo]n|clase)$/i, 'Lección'],
  [/^(?:li[çc][ãa]o|aula)$/i, 'Lição'],
  [/^lezione$/i, 'Lezione'],
];

/** Every line like "14.10.2026 1 Leçon" (or Lesson, Lektion, Lección, Clase, Lição, Aula, Lezione)
    starts a lesson. */
export function splitLessons(text: string): Lesson[] {
  const cleaned = clean(text);
  const headingPattern =
    /^[ \t]*(\d{1,2})\.(\d{1,2})\.(\d{4})[ \t]+(\d+)[ \t]*(le[çc]on|lesson|lektion|lecci[óo]n|clase|li[çc][ãa]o|aula|lezione)(?![\p{L}])[^\n]*$/gimu;
  const marks: {
    start: number;
    end: number;
    day: number;
    month: number;
    year: number;
    number: number;
    word: Lesson['word'];
  }[] = [];
  let match: RegExpExecArray | null;
  while ((match = headingPattern.exec(cleaned))) {
    const label = match[5] ?? '';
    marks.push({
      start: match.index,
      end: match.index + match[0].length,
      day: Number(match[1]),
      month: Number(match[2]),
      year: Number(match[3]),
      number: Number(match[4]),
      word: LESSON_WORDS.find(([pattern]) => pattern.test(label))?.[1] ?? 'Leçon',
    });
  }
  const pad = (value: number) => String(value).padStart(2, '0');
  // the key names the lesson in addresses, saved notes and progress, so it must be unique:
  // a second lesson with the same date and number gets "-2"
  const seenKeys = new Map<string, number>();
  return marks.map((mark, index) => {
    const body = cleaned.slice(mark.end, marks[index + 1]?.start ?? cleaned.length).trim();
    const baseKey = `${mark.year}-${pad(mark.month)}-${pad(mark.day)}_${mark.number}`;
    const repeats = (seenKeys.get(baseKey) ?? 0) + 1;
    seenKeys.set(baseKey, repeats);
    return {
      key: repeats === 1 ? baseKey : `${baseKey}-${repeats}`,
      n: mark.number,
      word: mark.word,
      // "31.02.2026" is a typo for the end of February, not 3 March; the key keeps what was
      // written, since the server finds the heading by it
      date: new Date(
        mark.year,
        mark.month - 1,
        Math.min(mark.day, new Date(mark.year, mark.month, 0).getDate())
      ),
      body,
      hash: hash(body),
    };
  });
}

const CYRILLIC = /[А-Яа-яЁё]/;

// Fallback when Claude is unavailable: "mot - перевод" lines.
// a line that starts with an emoji, or with spaces: still part of a report (src/lib/report.ts)
const REPORT_LINE = /^(?:\s|\p{Extended_Pictographic})/u;

/** A lesson's text without the student's report and questions: from a line starting with 📝
    or ❓ up to the first line that doesn't start with an emoji or spaces. Their sentences
    aren't vocabulary. */
export function withoutReport(body: string): string {
  const kept: string[] = [];
  let inReport = false;
  for (const line of body.split('\n')) {
    if (line.startsWith('📝') || line.startsWith('❓')) inReport = true;
    else if (inReport && !(line.trim() && REPORT_LINE.test(line))) inReport = false;
    if (!inReport) kept.push(line);
  }
  return kept.join('\n');
}

// "★ la boulangerie — пекарня": the teacher marks a key word of the lesson with a star
const KEY_MARK = /[★⭐]/u;

const KEY_MARKS = /[★⭐]\uFE0F?/gu;

// articles and "to", left out when comparing a starred line with a word ("boulangerie" and "la boulangerie")
const LEADING_ARTICLE =
  /^(?:(?:le|la|les|un|une|der|die|das|ein|eine|el|los|las|una|o|a|os|as|um|uma|il|lo|i|gli|uno|the|to)\s+|(?:l|un)')/;

const comparable = (text: string) =>
  text
    .toLowerCase()
    .replace(/[’`ʼ]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .replace(LEADING_ARTICLE, '');

// The words the teacher starred in a lesson, as written before the translation or transcription.
function starredWords(body: string): Set<string> {
  const starred = new Set<string>();
  for (const line of body.split('\n')) {
    if (!KEY_MARK.test(line)) continue;
    const text = line
      .replace(KEY_MARKS, '')
      .replace(/^\s*[-*•]\s*/, '')
      .trim();
    const head = comparable(text.split(/\s+[-—–=]\s+|\s*\[/)[0] ?? '');
    if (head) starred.add(head);
  }
  return starred;
}

/** The lesson's words with the starred ones marked as key words. Claude marks them too, but an
    analysis kept from before the star was added, or one with a corrected spelling, may miss it. */
export function markKeyWords(words: Word[], body: string): Word[] {
  const starred = starredWords(body);
  if (!starred.size) return words;
  return words.map((word) =>
    word.key || !starred.has(comparable(word.fr)) ? word : { ...word, key: true }
  );
}

/** The language a heading word points to ("Lektion" → German), for lessons read without Claude.
    "Leçon" is the oldest heading, and French. */
const LESSON_WORD_LANGUAGES: Record<LessonWord, Language> = {
  Leçon: 'fr',
  Lesson: 'en',
  Lektion: 'de',
  Lección: 'es',
  Lição: 'pt',
  Lezione: 'it',
};

// The language a lesson's heading word stands for.
export const languageOfLesson = (lesson: Pick<Lesson, 'word'>): Language =>
  LESSON_WORD_LANGUAGES[lesson.word];

// The lesson's words without Claude, from "mot — перевод" lines, in the language of its heading.
export function localParse(body: string, language: Language = 'fr'): Analysis {
  const words: Word[] = [];
  const seen = new Set<string>();
  for (let line of withoutReport(body).split('\n')) {
    const starred = KEY_MARK.test(line);
    line = line
      .replace(KEY_MARKS, '')
      .replace(/^\s*[-*•]\s*/, '')
      .replace(/\*+/g, '')
      .trim();
    const { text, tr } = splitTranscription(line);
    line = text;
    if (!line) continue;
    let fr = '',
      ru = '';
    const [, left = '', right = ''] = line.match(/^(.+?)\s+[-—–=]\s+(.+)$/) ?? [];
    if (left && !CYRILLIC.test(left) && CYRILLIC.test(right)) {
      fr = left;
      ru = right;
    } else {
      const [, french = '', russian = ''] = line.match(/^([^А-Яа-яЁё]+?)\s+([А-Яа-яЁё].*)$/) ?? [];
      fr = french;
      ru = russian;
    }
    fr = fr.replace(/[-—–=\s]+$/, '').trim();
    if (!fr || fr.length > 40 || /\d/.test(fr)) continue;
    const identity = fr.toLowerCase();
    if (seen.has(identity)) continue;
    seen.add(identity);
    words.push({
      fr,
      ru: ru.trim(),
      kind: 'other',
      added: false,
      tr,
      ...(starred && { key: true }),
    });
  }
  return { language, topic: '', words, pairs: [], verbs: [], local: true };
}
