import { type GrammarRule } from '@/entities/lesson';
import { type Word } from '@/entities/word';
import { type Language } from '@/shared/config/languages';

export interface GapItem {
  before: string;
  after: string;
  answer: string;
  word: string;
  ru: string;
  choices: string[];
  // why the answer is right, for grammar practice; "" when not given
  why: string;
}

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

/** A question of an exercise the teacher makes in lesson mode: choose the answer, fill the gap,
    or translate a Russian sentence. */
export interface ExerciseQuestion {
  type: 'choice' | 'gap' | 'translate';
  prompt: string;
  // the answers to choose from, for "choice"; [] otherwise
  options: string[];
  answer: string;
  // other answers that are just as right
  accept: string[];
  // the Russian translation of the prompt ("" for "translate", whose prompt is Russian)
  ru: string;
  // why the answer is right, in Russian
  explanation: string;
}

export interface MadeExercise {
  title: string;
  language: Language;
  questions: ExerciseQuestion[];
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

// What Claude builds from a pasted text: words worth learning, questions, true-or-false statements.
export interface TextStudy {
  title: string;
  words: Word[];
  questions: { question: string; ru: string }[];
  statements: { text: string; ru: string; correct: boolean; why: string }[];
}

// A text the student pasted to read: an article, a story, a post.
export interface ReaderText {
  id: string;
  title: string;
  text: string;
  // when it was pasted
  at: number;
  // known once Claude has read any part of it
  language?: Language;
  // words and phrases the student asked about, newest first
  notes: PhotoItem[];
  // the Russian translation, one item per paragraph
  translation?: string[];
  study?: TextStudy;
}

// A discussion question for the start of a lesson.
export interface Discussion {
  question: string;
  ru: string;
  followUps: string[];
  vocabulary: { word: string; ru: string }[];
  // sentence beginnings that use the grammar topic
  starters: string[];
  grammarTip: string;
  // the grammar point explained, when one was chosen; in the interface language
  grammarRule: GrammarRule | null;
}
