import { asLanguage, type Language } from '@/shared/config/languages';
import { asArray, asObject } from '@/shared/lib/json';
import { asText } from '@/shared/lib/util';

import { type PhotoItem, type WordCard } from './wordCard';

export function photoItem(raw: unknown, language: Language): PhotoItem {
  const item = asObject(raw);
  return {
    fr: asText(item.fr),
    context: asText(item.context),
    ru: asText(item.ru),
    base: asText(item.base),
    kind: asText(item.kind) || 'other',
    tense: asText(item.tense),
    explanation: asText(item.explanation),
    language,
  };
}

// Saved photo or text notes, each with the language it was saved with.
export function normalizePhotoItems(raw: unknown): PhotoItem[] {
  return asArray(raw)
    .map((item) => photoItem(item, asLanguage(asObject(item).language)))
    .filter((item) => item.fr);
}

// A selected word's card; null when Claude gave no translation.
export function normalizeWordCard(raw: unknown, selection: string): WordCard | null {
  const data = asObject(raw);
  const language = asLanguage(data.language);
  const item = photoItem(raw, language);
  if (!item.ru) return null;
  return {
    ...item,
    fr: item.fr || selection,
    language,
    baseRu: asText(data.baseRu) || item.ru,
    definition: asText(data.definition),
    definitionRu: asText(data.definitionRu),
    examples: asArray(data.examples)
      .map(asObject)
      .map((example) => ({ text: asText(example.text), ru: asText(example.ru) }))
      .filter((example) => example.text),
  };
}
