import { notionIdFrom } from './source';
import type {
  Analysis,
  Conjugation,
  Discussion,
  Form,
  GapItem,
  GrammarRule,
  Language,
  Lesson,
  LessonExtras,
  LessonWord,
  Pair,
  PhotoItem,
  TextStudy,
  VerbRef,
  Word,
  WritingCheck,
} from './types';
import { asLanguage, TENSES } from './types';
import { asText, hash, shuffle } from './util';

/** The lessons' source from a pasted link: a Google Docs id, or "notion-<id>" for a Notion page. */
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

export function clean(text: string): string {
  return text
    .replace(/\r/g, '')
    .replace(/\\([!_[\]*`#+\-.()~>|{}])/g, '$1')
    .split('\n')
    .map((line) => line.replace(/\s+$/, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
}

/** The heading words a lesson may start with, and how each is shown. */
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
      date: new Date(mark.year, mark.month - 1, mark.day),
      body,
      hash: hash(body),
    };
  });
}

/** Pulls a "[bɔ̃ʒuʁ]" or "[бонжур]" transcription out of a string. */
export function splitTranscription(source: string): { text: string; tr: string } {
  const match = source.match(/\[([^\]]+)\]/);
  if (!match || match.index === undefined) return { text: source, tr: '' };
  const text = (source.slice(0, match.index) + ' ' + source.slice(match.index + match[0].length))
    .replace(/\s+/g, ' ')
    .replace(/^[\s,;:–—-]+|[\s,;:–—-]+$/g, '');
  return { text, tr: (match[1] ?? '').trim() };
}

/** Moves a transcription Claude left in fr or ru (older cached lessons) into tr. */
export function withTranscription(word: Omit<Word, 'tr'> & { tr?: string }): Word {
  const frenchParts = splitTranscription(word.fr),
    russianParts = splitTranscription(word.ru);
  return {
    ...word,
    fr: frenchParts.text || word.fr,
    ru: russianParts.text,
    tr: (word.tr || '').replace(/^\[|\]$/g, '').trim() || frenchParts.tr || russianParts.tr,
  };
}

const CYRILLIC = /[А-Яа-яЁё]/;
/** Fallback when Claude is unavailable: "mot - перевод" lines. */
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

/** The words the teacher starred in a lesson, as written before the translation or transcription. */
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

export function localParse(body: string): Analysis {
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
  return { language: 'fr', topic: '', words, pairs: [], verbs: [], local: true };
}

type JsonObject = Record<string, unknown>;
const asObject = (value: unknown): JsonObject =>
  value && typeof value === 'object' ? (value as JsonObject) : {};
const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
/** The non-empty strings of a list. */
const asTexts = (value: unknown): string[] => asArray(value).map(asText).filter(Boolean);

/** The grammar, homework and book exercises Claude found in a lesson; missing parts are empty. */
/** Claude's check of a written answer; null when the reply has no corrected text. */
export function normalizeWritingCheck(raw: unknown): WritingCheck | null {
  const data = asObject(raw);
  const corrected = asText(data.corrected);
  if (!corrected) return null;
  return {
    corrected,
    mistakes: asArray(data.mistakes)
      .map(asObject)
      .map((mistake) => ({
        wrong: asText(mistake.wrong),
        right: asText(mistake.right),
        why: asText(mistake.why),
      }))
      .filter((mistake) => mistake.wrong || mistake.right),
    comment: asText(data.comment),
  };
}

export function normalizeExtras(raw: unknown): LessonExtras {
  const data = asObject(raw);
  return {
    language: asLanguage(data.language),
    grammar: asArray(data.grammar)
      .map(normalizeGrammarRule)
      .filter((rule): rule is GrammarRule => !!rule?.title),
    homework: asArray(data.homework)
      .map(asObject)
      .map((item) => ({ task: asText(item.task), meaning: asText(item.meaning) }))
      .filter((item) => item.task),
    book: asArray(data.book)
      .map(asObject)
      .map((exercise) => ({
        title: asText(exercise.title),
        instructions: asText(exercise.instructions),
        items: asTexts(exercise.items),
      }))
      .filter((exercise) => exercise.title || exercise.instructions || exercise.items.length),
  };
}

export function normalizeAnalysis(raw: unknown): Analysis {
  const data = asObject(raw);
  const seen = new Set<string>();
  const words: Word[] = asArray(data.words)
    .map(asObject)
    .map((word) =>
      withTranscription({
        fr: asText(word.fr),
        ru: asText(word.ru),
        kind: asText(word.kind) || 'other',
        added: !!word.added,
        tr: asText(word.tr),
        sense: asText(word.sense).toLowerCase() || undefined,
        ...(word.key === true && { key: true }),
      })
    )
    .filter(
      (word) => word.fr && !seen.has(word.fr.toLowerCase()) && !!seen.add(word.fr.toLowerCase())
    );
  const pairs: Pair[] = asArray(data.pairs)
    .map(asObject)
    .map((pair) => ({
      a: asText(pair.a),
      b: asText(pair.b),
      kind: pair.kind === 'synonym' ? ('synonym' as const) : ('antonym' as const),
    }))
    .filter((pair) => pair.a && pair.b && pair.a !== pair.b);
  const seenVerbs = new Set<string>();
  const verbs: VerbRef[] = asArray(data.verbs)
    .map(asObject)
    .map((verb) => ({ inf: asText(verb.inf), ru: asText(verb.ru) }))
    .filter(
      (verb) =>
        verb.inf &&
        !seenVerbs.has(verb.inf.toLowerCase()) &&
        !!seenVerbs.add(verb.inf.toLowerCase())
    );
  // An empty list is a real answer (a lesson without vocabulary); a missing one means the reply was malformed.
  if (!Array.isArray(data.words)) throw new Error('malformed');
  const language = asLanguage(data.language);
  return { language, topic: asText(data.topic), words, pairs, verbs, local: false };
}

/** "je me" "lève" → "je" "me lève": the reflexive pronoun belongs to the answer, not the person. */
export function withPerson(form: Form): Form {
  const match = form.p.match(/^(\S+)\s+(me|te|se|nous|vous|[mts]['’])$/i);
  if (!match) return form;
  const [, person = '', pronoun = ''] = match;
  return { p: person, f: /['’]$/.test(pronoun) ? pronoun + form.f : `${pronoun} ${form.f}` };
}

export function normalizeConjugation(raw: unknown, infinitive: string): Conjugation {
  const data = asObject(raw);
  const rawTenses = asObject(data.tenses);
  const tenses = {} as Record<(typeof TENSES)[number], Form[]>;
  for (const tense of TENSES)
    tenses[tense] = asArray(rawTenses[tense])
      .map(asObject)
      .map((form) => withPerson({ p: asText(form.p), f: asText(form.f) }))
      .filter((form) => form.f);
  if (!tenses['présent'].length) throw new Error('empty');
  return {
    inf: asText(data.inf) || infinitive,
    ru: asText(data.ru),
    aux: asText(data.aux),
    pp: asText(data.pp),
    tenses,
  };
}

export function normalizeGaps(raw: unknown): GapItem[] {
  const normalize = (text: string) => text.toLowerCase().replace(/[’']/g, "'").trim();
  const items = asArray(raw)
    .map(asObject)
    .map((item) => {
      const answer = asText(item.answer);
      if (!answer) return null;
      const wrongOptions = [
        ...new Set(
          asArray(item.options)
            .map(asText)
            .filter((option) => option && normalize(option) !== normalize(answer))
        ),
      ].slice(0, 3);
      return {
        before: String(item.before ?? ''),
        after: String(item.after ?? ''),
        answer,
        word: asText(item.word),
        ru: asText(item.ru),
        choices: shuffle([answer, ...wrongOptions]),
        why: asText(item.why),
      };
    })
    .filter((item): item is GapItem => !!item);
  if (!items.length) throw new Error('empty');
  return items;
}

function photoItem(raw: unknown, language: Language): PhotoItem {
  const item = asObject(raw);
  return {
    fr: asText(item.fr),
    context: asText(item.context),
    ru: asText(item.ru),
    base: asText(item.base),
    kind: asText(item.kind) || 'other',
    tense: asText(item.tense),
    explanation: asText(item.explanation),
    language,
  };
}

export function normalizePhoto(raw: unknown): PhotoItem[] {
  const data = asObject(raw);
  const language = asLanguage(data.language);
  return asArray(data.items)
    .map((item) => photoItem(item, language))
    .filter((item) => item.fr);
}

/** One marked word or phrase explained; null when the answer has no translation to show. */
export function normalizeExplanation(raw: unknown, selection: string): PhotoItem | null {
  const item = photoItem(raw, asLanguage(asObject(raw).language));
  return item.ru ? { ...item, fr: item.fr || selection } : null;
}

/** The translated paragraphs; throws when the answer has none. */
export function normalizeTranslation(raw: unknown): string[] {
  const paragraphs = asTexts(asObject(raw).paragraphs);
  if (!paragraphs.length) throw new Error('empty');
  return paragraphs;
}

/** Words, questions and statements built from a text, with the text's language. */
export function normalizeStudy(raw: unknown): { language: Language; study: TextStudy } {
  const data = asObject(raw);
  const language = asLanguage(data.language);
  const seen = new Set<string>();
  const words: Word[] = asArray(data.words)
    .map(asObject)
    .map((word) => ({
      fr: asText(word.fr),
      ru: asText(word.ru),
      tr: '',
      kind: asText(word.kind) || 'other',
      added: false,
      sense: asText(word.sense).toLowerCase() || undefined,
      language,
    }))
    .filter(
      (word) =>
        word.fr && word.ru && !seen.has(word.fr.toLowerCase()) && !!seen.add(word.fr.toLowerCase())
    );
  const questions = asArray(data.questions)
    .map(asObject)
    .map((item) => ({ question: asText(item.question), ru: asText(item.ru) }))
    .filter((item) => item.question);
  const statements = asArray(data.statements)
    .map(asObject)
    .map((item) => ({
      text: asText(item.text),
      ru: asText(item.ru),
      correct: item.correct === true,
      why: asText(item.why),
    }))
    .filter((item) => item.text);
  if (!words.length && !questions.length && !statements.length) throw new Error('empty');
  return { language, study: { title: asText(data.title), words, questions, statements } };
}

/** Picks string fields out of an answer, "" for anything missing. */
export function asObjectText<K extends string>(raw: unknown, keys: K[]): Record<K, string> {
  const object = asObject(raw);
  return Object.fromEntries(keys.map((key) => [key, asText(object[key])])) as Record<K, string>;
}

export function normalizeDiscussion(raw: unknown): Discussion | null {
  const data = asObject(raw);
  const question = asText(data.question);
  if (!question) return null;
  return {
    question,
    ru: asText(data.ru),
    followUps: asTexts(data.followUps),
    vocabulary: asArray(data.vocabulary)
      .map(asObject)
      .map((item) => ({ word: asText(item.word), ru: asText(item.ru) }))
      .filter((item) => item.word),
    starters: asTexts(data.starters),
    grammarTip: asText(data.grammarTip),
    grammarRule: normalizeGrammarRule(data.grammarRule),
  };
}

function normalizeGrammarRule(raw: unknown): Discussion['grammarRule'] {
  const data = asObject(raw);
  const title = asText(data.title);
  const summary = asText(data.summary);
  if (!title && !summary) return null;
  return {
    title,
    summary,
    formation: asTexts(data.formation),
    usage: asTexts(data.usage),
    examples: asArray(data.examples)
      .map(asObject)
      .map((item) => ({ text: asText(item.text), translation: asText(item.translation) }))
      .filter((item) => item.text),
    pitfall: asText(data.pitfall),
  };
}
