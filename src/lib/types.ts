/** The language a lesson teaches; translations are always Russian. */
export type Language = 'fr' | 'en' | 'de';
export const LANGUAGES: Language[] = ['fr', 'en', 'de'];
export const LANGUAGE_NAMES: Record<Language, string> = {
  fr: 'French',
  en: 'English',
  de: 'German',
};
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
export interface Lesson {
  key: string;
  n: number;
  word: 'Leçon' | 'Lesson' | 'Lektion';
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
}

/** A word or phrase the student underlined on a photo of a book page. */
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

/** A discussion question for the start of a lesson. */
export interface Discussion {
  question: string;
  ru: string;
  followUps: string[];
  vocabulary: { word: string; ru: string }[];
  /** sentence beginnings that use the grammar topic */
  starters: string[];
  grammarTip: string;
}
