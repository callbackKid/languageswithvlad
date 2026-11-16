import { type Lesson, type Tense, TENSES } from './types';
import { hash } from './util';

/* "Devoirs: verbes être, avoir — présent; mots de la leçon 5; 5 phrases au passé composé"
   in a lesson: the homework for the next lesson. Read straight from the text, like
   "le cours prochain:", without Claude. The items can also go one per line under the label:

     Devoirs:
     - mots de la leçon 5
     - 5 phrases au passé composé */

// the label, in the app's languages; only spaces or a list mark may come before it, so a line
// of the student's report (it starts with an emoji) is never read as homework
const LABEL =
  /^\s*(?:[-•*]\s*)?(?:devoirs?|homework|hausaufgaben?|deberes|tareas?|trabalhos? de casa|tpc|compiti|д\/?з|домашнее задание|домашка)\s*(?::|—|–|-)\s*/iu;
const LIST_ITEM = /^\s*(?:[-•*]|\d{1,2}[.)])\s+/;

export type HomeworkKind = 'words' | 'gaps' | 'verbs' | 'writing' | 'other';
export interface HomeworkItem {
  /** as the teacher wrote it */
  text: string;
  kind: HomeworkKind;
  /** words, gaps: "mots de la leçon 5" → 5; otherwise the lesson the homework is in */
  lessonNumber?: number;
  /** verbs: "verbes être, avoir — présent" → être, avoir in the présent */
  verbs?: string[];
  tense?: Tense;
}
export interface Homework {
  /** the lesson the homework was written in */
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
const TRAILING_PREPOSITION = /\s+(?:au|à|en|in|im|the|no|al|nel|в)\s*$/iu;
const WRITING =
  /phrases?|sentences?|\bsätze\b|\bsatz\b|frases?|frasi|écri|rédig|\bwrite\b|schreib|escrib|escrev|scriv|напис|сочин|décri|describe|beschreib|descriv|descrev|опиши|tradu|translat|übersetz|перев(?:ест|ед|од)/iu;
const WORDS =
  /\b(?:mots|words|wörter|vokabeln|palabras|palavras|parole|vocaboli)\b|vocabula|vokabular|лексик|слова/iu;
const NUMBER = /(\d{1,3})/;

/** "verbes être, avoir — présent" → the verbs and the tense, when they can be told. */
function readVerbs(text: string): { verbs: string[]; tense?: Tense } {
  const lower = text.toLowerCase();
  // the longest name first: "conditionnel présent" before "présent"
  const tense = [...TENSES]
    .sort((first, second) => second.length - first.length)
    .find((name) => lower.includes(name));
  let rest = text.replace(VERB_WORDS, ' ');
  if (tense) rest = rest.replace(new RegExp(tense, 'iu'), ' ');
  const listed = rest
    .split(/\s+[—–-]\s+|:/)
    .map((part) => part.trim().replace(TRAILING_PREPOSITION, '').trim())
    .find(Boolean);
  const verbs = (listed ?? '')
    .split(/,|\bet\b|\band\b|\bund\b|\by\b|\be\b|\bи\b/u)
    .map((verb) => verb.trim().replace(/[.;]+$/, ''))
    // one or two words: "aller", "se lever"
    .filter((verb) => verb && verb.split(/\s+/).length <= 2 && !/\d/.test(verb));
  return { verbs, tense };
}

/** What one item asks for. */
export function readItem(text: string): HomeworkItem {
  const number = Number(text.match(NUMBER)?.[1]) || undefined;
  if (GAPS.test(text)) return { text, kind: 'gaps', lessonNumber: number };
  if (VERBS.test(text)) {
    const { verbs, tense } = readVerbs(text);
    if (verbs.length) return { text, kind: 'verbs', verbs, tense };
  }
  if (WRITING.test(text)) return { text, kind: 'writing' };
  if (WORDS.test(text)) return { text, kind: 'words', lessonNumber: number };
  return { text, kind: 'other' };
}

/** The items of the last homework block in a lesson's text; none when it has no block. */
export function homeworkItems(body: string): string[] {
  const lines = body.split('\n');
  let items: string[] = [];
  lines.forEach((line, index) => {
    if (!LABEL.test(line)) return;
    // a newer block in the same lesson replaces an older one
    items = line
      .replace(LABEL, '')
      .split(';')
      .map((item) => item.trim())
      .filter(Boolean);
    for (const next of lines.slice(index + 1)) {
      if (!LIST_ITEM.test(next)) break;
      const item = next.replace(LIST_ITEM, '').trim();
      if (item) items.push(item);
    }
  });
  return items.map((item) => item.replace(/[.;]+$/, ''));
}

/** The homework of the newest lesson: what is due for the next lesson. Homework written in an
    older lesson is left out, since that lesson has happened since. */
export function findHomework(lessons: Lesson[]): Homework | null {
  const lesson = lessons[lessons.length - 1];
  if (!lesson) return null;
  const items = homeworkItems(lesson.body);
  return items.length ? { lesson, items: items.map(readItem) } : null;
}

/** Where the ticks of a lesson's homework are kept: by the items' text, shared with the
    lesson's Homework tab. */
export const homeworkKey = (docId: string, lessonKey: string) => `homework:${docId}:${lessonKey}`;

/** Where a written task's answer and its check are kept. */
export const writingKey = (docId: string, lessonKey: string, task: string) =>
  `writing:${docId}:${lessonKey}:${hash(task)}`;
