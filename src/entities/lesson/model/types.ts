import { type VerbRef } from '@/entities/verb/@x/lesson';
import { type Pair, type Word } from '@/entities/word/@x/lesson';
import { type Language } from '@/shared/config';

export interface Analysis {
  language: Language;
  topic: string;
  words: Word[];
  pairs: Pair[];
  verbs: VerbRef[];
  // true when parsed locally without Claude
  local: boolean;
}

// The word a lesson's heading uses: "14.10.2026 1 Leçon", "… 1 Lección"…
export type LessonWord = 'Leçon' | 'Lesson' | 'Lektion' | 'Lección' | 'Lição' | 'Lezione';

export interface Lesson {
  key: string;
  n: number;
  word: LessonWord;
  date: Date;
  body: string;
  hash: string;
  // shown instead of "Leçon 3", for lessons that don't come from the document
  title?: string;
}

// A homework task as the teacher wrote it, with what it asks in the interface language.
export interface HomeworkTask {
  task: string;
  meaning: string;
}

// An exercise from the student's book, copied into the lesson.
export interface BookExercise {
  title: string;
  instructions: string;
  items: string[];
}

// What a lesson holds besides its words: read by Claude once, in the interface language.
export interface LessonExtras {
  language: Language;
  grammar: GrammarRule[];
  homework: HomeworkTask[];
  book: BookExercise[];
}

export interface GrammarRule {
  title: string;
  summary: string;
  formation: string[];
  usage: string[];
  // a transcription only on a pronunciation point's examples (the Phonetics tab)
  examples: { text: string; translation: string; transcription?: string }[];
  pitfall: string;
}

/** A lesson's pronunciation points, read by Claude once in the interface language. Each is shaped
    as a grammar rule: its reading rules in formation, usage empty, transcribed examples. */
export interface LessonPhonetics {
  language: Language;
  topics: GrammarRule[];
}
