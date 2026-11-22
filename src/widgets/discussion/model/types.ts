import { type GrammarRule } from '@/entities/lesson';
import { type UiLanguage } from '@/shared/i18n';

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
  // the language of ru and the examples' translations; Russian for one made before it was kept
  translatedTo: UiLanguage;
}
