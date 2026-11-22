import { normalizePhotoItems, type PhotoItem, photoItem, type Word } from '@/entities/word';
import { asLanguage, type Language } from '@/shared/config/languages';
import { asArray, asObject, asTexts } from '@/shared/lib/json';
import { asText } from '@/shared/lib/util';

import { type ExerciseQuestion, type MadeExercise, type ReaderText, type TextStudy } from './types';

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

// The underlined words Claude read on a photo, all in the book's language.
export function normalizePhoto(raw: unknown): PhotoItem[] {
  const data = asObject(raw);
  const language = asLanguage(data.language);
  return asArray(data.items)
    .map((item) => photoItem(item, language))
    .filter((item) => item.fr);
}

// The words of several photos as one list, in photo order; a word marked on two pages comes once.
export function mergePhotoItems(scans: PhotoItem[][]): PhotoItem[] {
  const seen = new Set<string>();
  return scans.flat().filter((item) => {
    const key = `${item.language ?? 'fr'}:${(item.base || item.fr).toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

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

// The translated paragraphs; throws when the answer has none.
export function normalizeTranslation(raw: unknown): string[] {
  const paragraphs = asTexts(asObject(raw).paragraphs);
  if (!paragraphs.length) throw new Error('empty');
  return paragraphs;
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
