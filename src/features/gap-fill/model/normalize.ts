import { asArray, asObject } from '@/shared/lib/json';
import { asText, shuffle } from '@/shared/lib/util';

import { type GapItem } from './types';

// Gap sentences with their choices shuffled; throws when there are none.
export const normalizeGaps = (raw: unknown): GapItem[] => {
  const normalize = (text: string) => text.toLowerCase().replace(/[’']/g, "'").trim();
  const items = asArray(raw)
    .map(asObject)
    .map((item) => {
      const answer = asText(item.answer);
      if (!answer) return null;
      const wrongOptions = [
        ...new Set(
          asArray(item.options)
            .map(asText)
            .filter((option) => option && normalize(option) !== normalize(answer))
        ),
      ].slice(0, 3);
      return {
        before: String(item.before ?? ''),
        after: String(item.after ?? ''),
        answer,
        word: asText(item.word),
        ru: asText(item.ru),
        choices: shuffle([answer, ...wrongOptions]),
        why: asText(item.why),
      };
    })
    .filter((item): item is GapItem => !!item);
  if (!items.length) throw new Error('empty');
  return items;
};
