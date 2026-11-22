import { normalizePhotoItems, type Word } from '@/entities/word';
import { asLanguage, type Language, LANGUAGES } from '@/shared/config';
import { asArray, asObject, asTexts } from '@/shared/lib/json';
import { asText } from '@/shared/lib/util';

import { type ReaderText, type TextStudy } from './types';

// A pasted text as saved on the device, with what Claude made of it; null when it has no text.
export function normalizeReaderText(raw: unknown): ReaderText | null {
  const data = asObject(raw);
  const id = asText(data.id);
  const text = typeof data.text === 'string' ? data.text : '';
  if (!id || !text.trim()) return null;
  let study: TextStudy | undefined;
  try {
    study = data.study === undefined ? undefined : normalizeStudy(data.study).study;
  } catch {
    // a study with nothing in it is made again on request
  }
  const translation = asTexts(data.translation);
  return {
    id,
    title: asText(data.title),
    text,
    at: typeof data.at === 'number' ? data.at : 0,
    ...(data.language !== undefined && { language: asLanguage(data.language) }),
    notes: normalizePhotoItems(data.notes),
    ...(translation.length && { translation }),
    ...(study && { study }),
  };
}

/** The translated paragraphs, and the text's language when Claude named one it knows (null
    otherwise); throws when the answer has no paragraphs. */
export function normalizeTranslation(raw: unknown): {
  paragraphs: string[];
  language: Language | null;
} {
  const data = asObject(raw);
  const paragraphs = asTexts(data.paragraphs);
  if (!paragraphs.length) throw new Error('empty');
  return { paragraphs, language: LANGUAGES.find((code) => code === data.language) ?? null };
}

// Words, questions and statements built from a text, with the text's language.
export function normalizeStudy(raw: unknown): { language: Language; study: TextStudy } {
  const data = asObject(raw);
  const language = asLanguage(data.language);
  const seen = new Set<string>();
  const words: Word[] = asArray(data.words)
    .map(asObject)
    .map((word) => ({
      fr: asText(word.fr),
      ru: asText(word.ru),
      tr: '',
      kind: asText(word.kind) || 'other',
      added: false,
      sense: asText(word.sense).toLowerCase() || undefined,
      language,
    }))
    .filter(
      (word) =>
        word.fr && word.ru && !seen.has(word.fr.toLowerCase()) && !!seen.add(word.fr.toLowerCase())
    );
  const questions = asArray(data.questions)
    .map(asObject)
    .map((item) => ({ question: asText(item.question), ru: asText(item.ru) }))
    .filter((item) => item.question);
  const statements = asArray(data.statements)
    .map(asObject)
    .map((item) => ({
      text: asText(item.text),
      ru: asText(item.ru),
      correct: item.correct === true,
      why: asText(item.why),
    }))
    .filter((item) => item.text);
  if (!words.length && !questions.length && !statements.length) throw new Error('empty');
  return { language, study: { title: asText(data.title), words, questions, statements } };
}
