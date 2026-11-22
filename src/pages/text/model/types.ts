import { type PhotoItem, type Word } from '@/entities/word';
import { type Language } from '@/shared/config';

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
