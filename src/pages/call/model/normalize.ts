import { type Language } from '@/shared/config';
import { asArray, asObject, asTexts } from '@/shared/lib/json';
import { asText } from '@/shared/lib/util';

import { type ExerciseQuestion, type MadeExercise } from './types';

/** A made exercise's questions, each checked: a choice keeps its answer among its options (or
    becomes a gap to type), and a question without a prompt or an answer is dropped. Throws when
    none is left. */
export function normalizeExercise(raw: unknown, language: Language): MadeExercise {
  const data = asObject(raw);
  const questions = asArray(data.questions)
    .map(asObject)
    .map((item): ExerciseQuestion => {
      const answer = asText(item.answer);
      const options = asTexts(item.options);
      const kind = asText(item.type);
      const type =
        kind === 'translate'
          ? 'translate'
          : kind === 'choice' && options.length > 1 && options.includes(answer)
            ? 'choice'
            : 'gap';
      return {
        type,
        prompt: asText(item.prompt),
        options: type === 'choice' ? options : [],
        answer,
        accept: asTexts(item.accept),
        ru: asText(item.ru),
        explanation: asText(item.explanation),
      };
    })
    .filter((question) => question.prompt && question.answer);
  if (!questions.length) throw new Error('empty');
  return { title: asText(data.title), language, questions };
}
