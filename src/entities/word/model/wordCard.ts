import { type Language } from '@/shared/config';

// A word or phrase the student marked: underlined on a photo of a book page, or picked in a pasted text.
export interface PhotoItem {
  fr: string;
  context: string;
  ru: string;
  // dictionary form (infinitive, masculine singular, noun with article); "" when fr already is one
  base: string;
  kind: string;
  // tense or mood of a verb form, "" otherwise
  tense: string;
  explanation: string;
  // the language of the book; French when missing (older scans)
  language?: Language;
}

// A word or phrase selected anywhere in the app: its explanation in its sentence, a definition in its own language and examples.
export interface WordCard extends PhotoItem {
  language: Language;
  // the dictionary form's own translation (вставать), where ru fits the sentence (встаю)
  baseRu: string;
  // in the word's own language, and its Russian translation
  definition: string;
  definitionRu: string;
  examples: { text: string; ru: string }[];
}
