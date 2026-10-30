/** The language a lesson teaches; translations are always Russian. */
export type Language = "fr" | "en";
export const LANGUAGE_NAMES: Record<Language, string> = { fr: "French", en: "English" };

export interface Word {
  fr: string; ru: string; kind: string; added: boolean;
  /** pronunciation as the teacher wrote it, without brackets */
  tr: string;
  /** key of the lesson the word comes from, set when lessons are merged */
  lesson?: string;
  /** language of fr (the word being learned), set with lesson; French when missing */
  language?: Language;
}
export interface Pair { a: string; b: string; kind: "synonym" | "antonym" }
export interface VerbRef { inf: string; ru: string }
export interface Analysis {
  language: Language;
  topic: string; words: Word[]; pairs: Pair[]; verbs: VerbRef[];
  /** true when parsed locally without Claude */
  local: boolean;
}
export interface Lesson { key: string; n: number; word: "Leçon" | "Lesson"; date: Date; body: string; hash: string }

export const TENSES = ["présent", "passé composé", "imparfait", "futur simple", "conditionnel présent", "impératif"] as const;
export type Tense = (typeof TENSES)[number];
export interface Form { p: string; f: string }
export interface Conjugation { inf: string; ru: string; aux: string; pp: string; tenses: Record<Tense, Form[]> }
export interface GapItem { before: string; after: string; answer: string; word: string; ru: string; choices: string[] }
