import { type GrammarRule } from '@/entities/lesson';

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
