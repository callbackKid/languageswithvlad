import { pickWords } from '@/entities/lesson';
import { type Progress, type Word } from '@/entities/word';
import { type Language } from '@/shared/config';

// the questions in a round on one group of words
export const GROUP_QUESTIONS = 15;
// fewer ticked words than this make a thin round: the button waits for more
export const MIN_GROUP_WORDS = 3;
// the most words sent; keep in step with MAX_EXERCISE_WORDS in api/analyze.ts
const MAX_GROUP_WORDS = 30;

// The group's words in the language most of them are in: a group on Words to learn can mix languages, a round has one.
function inMainLanguage(words: Word[]): { language: Language; words: Word[] } | null {
  const counts = new Map<Language, number>();
  for (const word of words) {
    const language = word.language ?? 'fr';
    counts.set(language, (counts.get(language) ?? 0) + 1);
  }
  // a tie goes to the language whose word comes first
  let language: Language | null = null;
  for (const [candidate, count] of counts)
    if (language === null || count > (counts.get(language) ?? 0)) language = candidate;
  if (language === null) return null;
  return { language, words: words.filter((word) => (word.language ?? 'fr') === language) };
}

// Whether a round can be made on these words: at least MIN_GROUP_WORDS of them in one language.
export function canMakeGroupExercise(words: Word[]): boolean {
  return (inMainLanguage(words)?.words.length ?? 0) >= MIN_GROUP_WORDS;
}

// Whether the words are in more than one language (a group on Words to learn can mix them).
export const mixesLanguages = (words: Word[]): boolean =>
  new Set(words.map((word) => word.language ?? 'fr')).size > 1;

/** The words a round on one group practises: those in the group's main language, the weaker ones
    first when there are too many. null when fewer than MIN_GROUP_WORDS are left. */
export function wordsForGroupExercise(
  words: Word[],
  progress: Progress
): { language: Language; words: string[] } | null {
  const main = inMainLanguage(words);
  if (!main || main.words.length < MIN_GROUP_WORDS) return null;
  const chosen =
    main.words.length > MAX_GROUP_WORDS
      ? pickWords(main.words, progress, MAX_GROUP_WORDS)
      : main.words;
  // pickWords leaves out words without a translation, so count again
  if (chosen.length < MIN_GROUP_WORDS) return null;
  return { language: main.language, words: chosen.map((word) => word.fr) };
}
