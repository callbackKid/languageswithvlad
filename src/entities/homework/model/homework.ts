import { type Lesson } from '@/entities/lesson/@x/homework';
import {
  type Tense,
  type TENSES_BY_LANGUAGE,
  VERB_LANGUAGES,
  type VerbLanguage,
} from '@/shared/config';
import { hash } from '@/shared/lib/util';

/* "Devoirs: verbes être, avoir — présent; mots de la leçon 5; 5 phrases au passé composé"
   in a lesson: the homework for the next lesson. Read straight from the text, like
   "le cours prochain:", without Claude. The items can also go one per line under the label:

     Devoirs:
     - mots de la leçon 5
     - 5 phrases au passé composé

   or under the label alone as a heading, without a colon ("Les devoirs", then "1. …"). */

/** The label, in the app's languages, also with an article or "my" ("les devoirs:", "my homework:").
    Only spaces or a list mark may come before it, so a line of the student's report (it starts
    with an emoji) is never read as homework. */
const LABEL_NAME = String.raw`(?:(?:les|mes|the|my|die|meine|los|las|la|mis|i|miei|os|as|meus|minhas)\s+)?(?:devoirs?|homework|hausaufgaben?|deberes|tareas?|trabalhos? de casa|tpc|compiti|д\/?з|домашнее задание|домашка)`;
const LABEL = new RegExp(String.raw`^\s*(?:[-•*]\s*)?${LABEL_NAME}\s*(?::|—|–|-)\s*`, 'iu');
// The label alone on its line, as a heading over a list of tasks ("Les devoirs", "ДЗ").
const LABEL_HEADING = new RegExp(String.raw`^\s*${LABEL_NAME}\s*$`, 'iu');
const LIST_ITEM = /^\s*(?:[-•*]|\d{1,2}[.)])\s+/;

export type HomeworkKind = 'words' | 'gaps' | 'verbs' | 'writing' | 'other';
export interface HomeworkItem {
  // as the teacher wrote it
  text: string;
  kind: HomeworkKind;
  // words, gaps: "mots de la leçon 5" → 5; otherwise the lesson the homework is in
  lessonNumber?: number;
  // verbs: "verbes être, avoir — présent" → être, avoir in the présent
  verbs?: string[];
  /** every tense the item names, in each language that has one by that name ("presente" is
      Spanish, Italian and Portuguese): the exercise keeps those of the lesson's language */
  tenses?: Tense[];
}
export interface Homework {
  // the lesson the homework was written in
  lesson: Lesson;
  items: HomeworkItem[];
}

// what an item asks for, in the app's languages; checked in this order
const GAPS = /trous|\bgaps?\b|lücken|huecos|lacunas|spazi vuoti|пропуск/iu;
const VERBS = /\b(?:verbes?|verbs?|verben|verbos?|verbi)\b|conjug|konjug|coniug|глагол|спряж/iu;
// the same words whole, to take them out of the list of verbs
const VERB_WORDS =
  /\b(?:verbes?|verbs?|verben|verbos?|verbi)\b|\S*(?:conjug|konjug|coniug|спряж)\S*|глагол\S*/giu;
// "aller et venir au passé composé": what is left after the tense's name
const TRAILING_PREPOSITION = /\s+(?:au|aux|à|en|in|im|the|no|na|al|nel|в)\s*$/iu;
// between two verbs: "être et avoir", "ser y estar", "глаголы être и avoir"; \b knows only Latin
// letters, so the bounds are written out
const VERB_SEPARATOR = /,|(?<!\p{L})(?:et|and|und|y|e|и)(?!\p{L})/u;

/** The names a teacher may write for each tense, short ones too ("futur", "presente"), all
    lowercase; they are compared without accents, so "passe compose" counts. */
const TENSE_NAMES: {
  [Key in VerbLanguage]: Record<string, (typeof TENSES_BY_LANGUAGE)[Key][number]>;
} = {
  fr: {
    présent: 'présent',
    'passé composé': 'passé composé',
    imparfait: 'imparfait',
    'futur proche': 'futur proche',
    'futur simple': 'futur simple',
    futur: 'futur simple',
    'conditionnel présent': 'conditionnel présent',
    conditionnel: 'conditionnel présent',
    impératif: 'impératif',
  },
  de: {
    präsens: 'Präsens',
    perfekt: 'Perfekt',
    präteritum: 'Präteritum',
    imperfekt: 'Präteritum',
    'futur i': 'Futur I',
    futur: 'Futur I',
    'konjunktiv ii': 'Konjunktiv II',
    konjunktiv: 'Konjunktiv II',
  },
  es: {
    'presente de indicativo': 'presente de indicativo',
    presente: 'presente de indicativo',
    'pretérito perfecto compuesto': 'pretérito perfecto compuesto',
    // the simple one is the indefinido: longer names are tried first
    'pretérito perfecto simple': 'pretérito indefinido',
    'pretérito perfecto': 'pretérito perfecto compuesto',
    'pretérito indefinido': 'pretérito indefinido',
    indefinido: 'pretérito indefinido',
    'pretérito imperfecto': 'pretérito imperfecto',
    imperfecto: 'pretérito imperfecto',
    'futuro simple': 'futuro simple',
    futuro: 'futuro simple',
    'condicional simple': 'condicional simple',
    condicional: 'condicional simple',
  },
  it: {
    'indicativo presente': 'indicativo presente',
    presente: 'indicativo presente',
    'passato prossimo': 'passato prossimo',
    imperfetto: 'imperfetto',
    'futuro semplice': 'futuro semplice',
    futuro: 'futuro semplice',
    'condizionale presente': 'condizionale presente',
    condizionale: 'condizionale presente',
  },
  pt: {
    'presente do indicativo': 'presente do indicativo',
    presente: 'presente do indicativo',
    'pretérito perfeito': 'pretérito perfeito',
    perfeito: 'pretérito perfeito',
    'pretérito imperfeito': 'pretérito imperfeito',
    imperfeito: 'pretérito imperfeito',
    'futuro do presente': 'futuro do presente',
    futuro: 'futuro do presente',
    condicional: 'condicional',
  },
};

/** Lowercase and without accents, one character for each character of the text, so a position
    found in it is the same position in the text. */
const fold = (text: string) =>
  [...text.toLowerCase()].map((char) => char.normalize('NFD').replace(/\p{M}/gu, '')).join('');

/** The tenses an item names, in every language that has a tense by that name, and the text with
    those names taken out (so they aren't read as verbs). */
const findTenses = (text: string): { tenses: Tense[]; rest: string } => {
  const source = text.normalize('NFC');
  const folded = fold(source);
  const found = new Set<Tense>();
  const spans: [number, number][] = [];
  for (const language of VERB_LANGUAGES) {
    const names: Record<string, Tense> = TENSE_NAMES[language];
    // within one language a name is used once: "pretérito perfecto simple" isn't also "pretérito perfecto"
    let free = folded;
    for (const name of Object.keys(names).sort((first, second) => second.length - first.length)) {
      const pattern = new RegExp(`(?<!\\p{L})${fold(name)}(?!\\p{L})`, 'u');
      const match = pattern.exec(free);
      const tense = names[name];
      if (!match || !tense) continue;
      found.add(tense);
      spans.push([match.index, match.index + match[0].length]);
      free =
        free.slice(0, match.index) +
        ' '.repeat(match[0].length) +
        free.slice(match.index + match[0].length);
    }
  }
  let rest = source;
  for (const [start, end] of spans)
    rest = rest.slice(0, start) + ' '.repeat(end - start) + rest.slice(end);
  return { tenses: [...found], rest };
};
const WRITING =
  /phrases?|sentences?|\bsätze\b|\bsatz\b|frases?|frasi|écri|rédig|\bwrite\b|schreib|escrib|escrev|scriv|напис|сочин|предложени|décri|describe|beschreib|descriv|descrev|опиши|tradu|translat|übersetz|перев(?:ест|ед|од)/iu;
const WORDS =
  /\b(?:mots|words|wörter|vokabeln|palabras|palavras|parole|vocaboli)\b|vocabula|vokabular|лексик|слова/iu;
const WORDS_FIRST = new RegExp(`^\\s*(?:${WORDS.source})`, 'iu');
// An explicit translation instruction can name verbs without asking for conjugation.
const TRANSLATION_FIRST =
  /^\s*(?:tradu(?:ire|is|isez|ction|cir|ce|zca|cci[oó]n|zir|za|[çc][ãa]o|rre|ci|cete|zione)|translate|translation|(?:ü|ue)bersetz(?:en|e|t|ung)|перев(?:ести|еди(?:те)?|од))(?!\p{L})/iu;
const VOCABULARY_TO_TRANSLATE = new RegExp(
  String.raw`^\s*(?:\d+\s+)?(?:${WORDS.source}|${VERBS.source}|глаголы)\s+(?:à traduire|to translate|zu (?:ü|ue)bersetzen|(?:a|para) traducir|para traduzir|da tradurre|для перевода)(?!\p{L})`,
  'iu'
);
const LESSON_LABEL =
  '(?:le[çc]on|lesson|lektion|lecci[oó]n|clase|li[çc][aã]o|aula|lezione|урок(?:а|е|у)?)';
// A lesson reference names the lesson directly ("leçon 5", "5. Lektion", "урок №5").
const LESSON_WITH_NUMBER = String.raw`${LESSON_LABEL}\s*(?:(?:n[or]\.?|n[º°]|[#№])\s*)?(\d{1,3})(?![\p{L}\p{N}]|[.,]\d)`;
const ORDINAL_ENDING = String.raw`(?:\.?[ºª]|\.|er|re|[èe]re|[èe]me|e|st|nd|rd|th|-(?:й|го|му|м))`;
const NUMBER_WITH_LESSON = String.raw`(?<!\d[.,])(\d{1,3})${ORDINAL_ENDING}?\s+${LESSON_LABEL}(?![\p{L}\p{N}])`;
const LESSON_REFERENCE = new RegExp(
  String.raw`(?<![\p{L}\p{N}])(?:${LESSON_WITH_NUMBER}|${NUMBER_WITH_LESSON})`,
  'iu'
);

// "verbes être, avoir — présent" → the verbs and the tenses, when they can be told.
const readVerbs = (text: string): { verbs: string[]; tenses: Tense[] } => {
  const { tenses, rest } = findTenses(text);
  const listed = rest
    .replace(VERB_WORDS, ' ')
    .split(/\s+[—–-]\s+|:/)
    .map((part) => part.trim().replace(TRAILING_PREPOSITION, '').trim())
    .find(Boolean);
  const verbs = (listed ?? '')
    .split(VERB_SEPARATOR)
    // "être, avoir au présent et au passé composé": a preposition left by a tense's name
    .map((verb) =>
      verb
        .trim()
        .replace(TRAILING_PREPOSITION, '')
        .replace(/[.;]+$/, '')
        .trim()
    )
    // one or two words: "aller", "se lever"
    .filter((verb) => verb && verb.split(/\s+/).length <= 2 && !/\d/.test(verb));
  return { verbs, tenses };
};

// What one item asks for.
export const readItem = (text: string): HomeworkItem => {
  const reference = LESSON_REFERENCE.exec(text.normalize('NFC'));
  const lessonNumber = Number(reference?.[1] ?? reference?.[2]) || undefined;
  if (GAPS.test(text)) return { text, kind: 'gaps', lessonNumber };
  if (TRANSLATION_FIRST.test(text) || VOCABULARY_TO_TRANSLATE.test(text))
    return { text, kind: 'writing' };
  if (VERBS.test(text)) {
    const { verbs, tenses } = readVerbs(text);
    if (verbs.length) return { text, kind: 'verbs', verbs, tenses };
  }
  // "mots de la leçon 6 — surtout : la phrase": a words task, whatever its words are
  if (WORDS_FIRST.test(text)) return { text, kind: 'words', lessonNumber };
  if (WRITING.test(text)) return { text, kind: 'writing' };
  if (WORDS.test(text)) return { text, kind: 'words', lessonNumber };
  return { text, kind: 'other' };
};

// The items of the last homework block in a lesson's text; none when it has no block.
export const homeworkItems = (body: string): string[] => {
  const lines = body.split('\n');
  let items: string[] = [];
  lines.forEach((line, index) => {
    const isHeading = LABEL_HEADING.test(line);
    if (!isHeading && !LABEL.test(line)) return;
    const listed: string[] = [];
    for (const next of lines.slice(index + 1)) {
      if (!LIST_ITEM.test(next)) break;
      const item = next.replace(LIST_ITEM, '').trim();
      if (item) listed.push(item);
    }
    // a heading counts only with a list under it: a line that just says "Devoirs" is no block
    if (isHeading && !listed.length) return;
    // a newer block in the same lesson replaces an older one
    const inline = isHeading
      ? []
      : line
          .replace(LABEL, '')
          .split(';')
          .map((item) => item.trim())
          .filter(Boolean);
    items = [...inline, ...listed];
  });
  return items.map((item) => item.replace(/[.;]+$/, ''));
};

/** A task's text for comparing: case, punctuation, the kind of apostrophe and extra spaces
    don't count, since the Homework tab ticks Claude's copy of a task and Home the teacher's.
    Claude may keep what homeworkItems drops: the label ("Devoirs : …") or a list mark ("1. …"). */
const taskText = (text: string) =>
  text
    .replace(LABEL, '')
    .replace(LIST_ITEM, '')
    .normalize('NFC')
    .toLowerCase()
    .replace(/[’‘`ʼ]/g, "'")
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Whether two texts are the same homework task ("Mots de la leçon 1." = "mots de la leçon 1").
export const sameTask = (first: string, second: string) => taskText(first) === taskText(second);

// Whether a task is among the ticked ones, however its text was copied.
export const isTaskDone = (done: string[], task: string) =>
  done.some((item) => sameTask(item, task));

// How many of a lesson's homework tasks are not ticked yet; null when its text has no homework.
export const homeworkLeft = (
  body: string,
  done: string[]
): { left: number; total: number } | null => {
  const items = homeworkItems(body);
  if (!items.length) return null;
  return { left: items.filter((item) => !isTaskDone(done, item)).length, total: items.length };
};

/** The homework of the newest lesson: what is due for the next lesson. Homework written in an
    older lesson is left out, since that lesson has happened since. */
export const findHomework = (lessons: Lesson[]): Homework | null => {
  const lesson = lessons[lessons.length - 1];
  if (!lesson) return null;
  const items = homeworkItems(lesson.body);
  return items.length ? { lesson, items: items.map(readItem) } : null;
};

/** Where the ticks of a lesson's homework are kept: by the items' text, shared with the
    lesson's Homework tab. */
export const homeworkKey = (docId: string, lessonKey: string) => `homework:${docId}:${lessonKey}`;

// Where a written task's answer and its check are kept.
export const writingKey = (docId: string, lessonKey: string, task: string) =>
  `writing:${docId}:${lessonKey}:${hash(task)}`;
