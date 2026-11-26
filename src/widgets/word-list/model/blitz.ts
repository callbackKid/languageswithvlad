import { type QuizItem } from '@/entities/lesson';
import { type Word } from '@/entities/word';
import { type GapItem } from '@/features/gap-fill';

// The words in one blitz round: half go into gap sentences, half are guessed from a definition.
export const BLITZ_SIZE = 10;

/** One blitz round: the gap sentences and the definitions taken in turn. A sentence whose word
    isn't one of the words sent (Claude changed its spelling) is left out, since its answer
    couldn't be counted for the word. */
export const buildBlitz = (
  gaps: GapItem[],
  definitions: { word: Word; definition: string }[],
  words: Word[]
): QuizItem[] => {
  const byText = new Map(words.map((word) => [word.fr.toLowerCase(), word]));
  const gapItems: QuizItem[] = [];
  for (const gap of gaps) {
    const word = byText.get(gap.word.toLowerCase());
    if (word)
      gapItems.push({
        kind: 'gap',
        word,
        before: gap.before,
        after: gap.after,
        answer: gap.answer,
        choices: gap.choices,
        ru: gap.ru,
      });
  }
  const defineItems: QuizItem[] = definitions.map(({ word, definition }) => ({
    kind: 'define',
    word,
    definition,
  }));
  const round: QuizItem[] = [];
  for (let index = 0; index < Math.max(gapItems.length, defineItems.length); index++) {
    const gap = gapItems[index];
    const define = defineItems[index];
    if (gap) round.push(gap);
    if (define) round.push(define);
  }
  return round;
};
