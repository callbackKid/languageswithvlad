import { normalizeGrammarRule } from '@/entities/lesson';
import { type Word } from '@/entities/word';
import { asLanguage, type Language } from '@/shared/config/languages';
import { asArray, asObject, asTexts } from '@/shared/lib/json';
import { asText, shuffle } from '@/shared/lib/util';

import {
  type Discussion,
  type ExerciseQuestion,
  type GapItem,
  type MadeExercise,
  type PhotoItem,
  type ReaderText,
  type TextStudy,
  type WordCard,
} from './types';

// a group name from Claude is cut to this length, like the names sent back to it (api/analyze.ts)
const MAX_GROUP_NAME_LENGTH = 60;

/** Claude's groups by meaning for the words sent: each word (as sent) to its group's name, its
    spelling matched without regard to case. Words left out aren't in the map; throws when no word
    came back in a group. */
export function normalizeWordGroups(raw: unknown, sent: string[]): Map<string, string> {
  const wanted = new Map(sent.map((word) => [word.toLowerCase(), word]));
  const found = new Map<string, string>();
  for (const group of asArray(asObject(raw).groups).map(asObject)) {
    const name = asText(group.name).slice(0, MAX_GROUP_NAME_LENGTH);
    if (!name) continue;
    for (const listed of asArray(group.words).map(asText)) {
      const word = wanted.get(listed.toLowerCase());
      if (word && !found.has(word)) found.set(word, name);
    }
  }
  if (!found.size) throw new Error('empty');
  return found;
}

// Gap sentences with their choices shuffled; throws when there are none.
export function normalizeGaps(raw: unknown): GapItem[] {
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
}

function photoItem(raw: unknown, language: Language): PhotoItem {
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

// A discussion question and what comes with it; null when the answer has no question.
export function normalizeDiscussion(raw: unknown): Discussion | null {
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
  };
}
