import { normalizeGrammarRule } from '@/entities/lesson';
import { asUiLanguage } from '@/shared/config';
import { type UiLanguage } from '@/shared/i18n';
import { asArray, asObject, asTexts } from '@/shared/lib/json';
import { asText } from '@/shared/lib/util';

import { type Discussion } from './types';

// A discussion question and what comes with it; null when the answer has no question.
export const normalizeDiscussion = (raw: unknown, translatedTo: UiLanguage): Discussion | null => {
  const data = asObject(raw);
  const question = asText(data.question);
  if (!question) return null;
  return {
    question,
    ru: asText(data.ru),
    followUps: asTexts(data.followUps),
    vocabulary: asArray(data.vocabulary)
      .map(asObject)
      .map((item) => ({ word: asText(item.word), ru: asText(item.ru) }))
      .filter((item) => item.word),
    starters: asTexts(data.starters),
    grammarTip: asText(data.grammarTip),
    grammarRule: normalizeGrammarRule(data.grammarRule),
    translatedTo: asUiLanguage(data.translatedTo) ?? translatedTo,
  };
};
