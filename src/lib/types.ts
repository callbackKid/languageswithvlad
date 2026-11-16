/** The language a lesson teaches; translations are always Russian. Its name in each interface
    language is in i18n/messages/common.ts ("name.<code>"). */
export type Language = 'fr' | 'en' | 'de' | 'es' | 'pt' | 'it';
export const LANGUAGES: Language[] = ['fr', 'en', 'de', 'es', 'pt', 'it'];
export const asLanguage = (value: unknown): Language =>
  LANGUAGES.includes(value as Language) ? (value as Language) : 'fr';

export interface Word {
  fr: string;
  ru: string;
  kind: string;
  added: boolean;
  /** pronunciation as the teacher wrote it, without brackets */
  tr: string;
  /** key of the lesson the word comes from, set when lessons are merged */
  lesson?: string;
  /** language of fr (the word being learned), set with lesson; French when missing */
  language?: Language;
  /** short English gloss of the meaning; words that mean nearly the same share it, so neither is offered as a wrong answer for the other */
  sense?: string;
  /** a key word of the lesson: the teacher marked its line with ★, and exercises ask it more often */
  key?: boolean;
}
export interface Pair {
  a: string;
  b: string;
  kind: 'synonym' | 'antonym';
}
export interface VerbRef {
  inf: string;
  ru: string;
}
export interface Analysis {
  language: Language;
  topic: string;
  words: Word[];
  pairs: Pair[];
  verbs: VerbRef[];
  /** true when parsed locally without Claude */
  local: boolean;
}
/** The word a lesson's heading uses: "14.10.2026 1 Leçon", "… 1 Lección"… */
export type LessonWord = 'Leçon' | 'Lesson' | 'Lektion' | 'Lección' | 'Lição' | 'Lezione';

export interface Lesson {
  key: string;
  n: number;
  word: LessonWord;
  date: Date;
  body: string;
  hash: string;
  /** shown instead of "Leçon 3", for lessons that don't come from the document */
  title?: string;
}

export const TENSES = [
  'présent',
  'passé composé',
  'imparfait',
  'futur simple',
  'conditionnel présent',
  'impératif',
] as const;
export type Tense = (typeof TENSES)[number];
export interface Form {
  p: string;
  f: string;
}
export interface Conjugation {
  inf: string;
  ru: string;
  aux: string;
  pp: string;
  tenses: Record<Tense, Form[]>;
}
export interface GapItem {
  before: string;
  after: string;
  answer: string;
  word: string;
  ru: string;
  choices: string[];
  /** why the answer is right, for grammar practice; "" when not given */
  why: string;
}

/** A homework task as the teacher wrote it, with what it asks in the interface language. */
export interface HomeworkTask {
  task: string;
  meaning: string;
}
/** An exercise from the student's book, copied into the lesson. */
export interface BookExercise {
  title: string;
  instructions: string;
  items: string[];
}
/** What a lesson holds besides its words: read by Claude once, in the interface language. */
export interface LessonExtras {
  language: Language;
  grammar: GrammarRule[];
  homework: HomeworkTask[];
  book: BookExercise[];
}

/** A word or phrase the student marked: underlined on a photo of a book page, or picked in a pasted text. */
export interface PhotoItem {
  fr: string;
  context: string;
  ru: string;
  /** dictionary form (infinitive, masculine singular, noun with article); "" when fr already is one */
  base: string;
  kind: string;
  /** tense or mood of a verb form, "" otherwise */
  tense: string;
  explanation: string;
  /** the language of the book; French when missing (older scans) */
  language?: Language;
}

/** What Claude builds from a pasted text: words worth learning, questions, true-or-false statements. */
export interface TextStudy {
  title: string;
  words: Word[];
  questions: { question: string; ru: string }[];
  statements: { text: string; ru: string; correct: boolean; why: string }[];
}

/** A text the student pasted to read: an article, a story, a post. */
export interface ReaderText {
  id: string;
  title: string;
  text: string;
  /** when it was pasted */
  at: number;
  /** known once Claude has read any part of it */
  language?: Language;
  /** words and phrases the student asked about, newest first */
  notes: PhotoItem[];
  /** the Russian translation, one item per paragraph */
  translation?: string[];
  study?: TextStudy;
}

/** A discussion question for the start of a lesson. */
export interface Discussion {
  question: string;
  ru: string;
  followUps: string[];
  vocabulary: { word: string; ru: string }[];
  /** sentence beginnings that use the grammar topic */
  starters: string[];
  grammarTip: string;
  /** the grammar point explained, when one was chosen; in the interface language */
  grammarRule: GrammarRule | null;
}
export interface GrammarRule {
  title: string;
  summary: string;
  formation: string[];
  usage: string[];
  examples: { text: string; translation: string }[];
  pitfall: string;
}
