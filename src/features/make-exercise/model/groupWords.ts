import { pickWords } from '@/entities/lesson';
import { type Progress, type Word } from '@/entities/word';
import { type Language } from '@/shared/config';

// the questions in a round on one group of words
export const GROUP_QUESTIONS = 15;
// The minimum selection of translated words in one language.
export const MIN_GROUP_WORDS = 3;
// the most words sent; keep in step with MAX_EXERCISE_WORDS in api/analyze.ts
const MAX_GROUP_WORDS = 30;

// A group may mix languages. Take the language with the most words eligible for the round.
const inMainLanguage = (words: Word[]): { language: Language; words: Word[] } | null => {
  const byLanguage = new Map<Language, Word[]>();
  for (const word of words) {
    if (!word.fr.trim() || !word.ru.trim()) continue;
    const language = word.language ?? 'fr';
    const group = byLanguage.get(language);
    if (group) group.push(word);
    else byLanguage.set(language, [word]);
  }
  // Ties go to the language whose first eligible word comes first.
  let main: { language: Language; words: Word[] } | null = null;
  for (const [language, candidates] of byLanguage)
    if (!main || candidates.length > main.words.length) main = { language, words: candidates };
  return main;
};

// Whether the selected words include enough translations in one language to start a round.
export const canMakeGroupExercise = (words: Word[]): boolean => {
  return (inMainLanguage(words)?.words.length ?? 0) >= MIN_GROUP_WORDS;
};

/** The words a round on one group practises: those in the group's main language, the weaker ones
    first when there are too many. null when fewer than MIN_GROUP_WORDS are left. */
export const wordsForGroupExercise = (
  words: Word[],
  progress: Progress
): { language: Language; words: string[] } | null => {
  const main = inMainLanguage(words);
  if (!main || main.words.length < MIN_GROUP_WORDS) return null;
  const chosen =
    main.words.length > MAX_GROUP_WORDS
      ? pickWords(main.words, progress, MAX_GROUP_WORDS)
      : main.words;
  return { language: main.language, words: chosen.map((word) => word.fr) };
};
