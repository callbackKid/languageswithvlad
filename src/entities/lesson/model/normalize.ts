import { type VerbRef } from '@/entities/verb/@x/lesson';
import { type Pair, withTranscription, type Word } from '@/entities/word/@x/lesson';
import { asLanguage } from '@/shared/config';
import { asArray, asObject, asTexts } from '@/shared/lib/json';
import { asText } from '@/shared/lib/util';

import { type Analysis, type GrammarRule, type LessonExtras } from './types';

// The grammar, homework and book exercises Claude found in a lesson; missing parts are empty.
export function normalizeExtras(raw: unknown): LessonExtras {
  const data = asObject(raw);
  return {
    language: asLanguage(data.language),
    grammar: asArray(data.grammar)
      .map(normalizeGrammarRule)
      .filter((rule): rule is GrammarRule => !!rule?.title),
    homework: asArray(data.homework)
      .map(asObject)
      .map((item) => ({ task: asText(item.task), meaning: asText(item.meaning) }))
      .filter((item) => item.task),
    book: asArray(data.book)
      .map(asObject)
      .map((exercise) => ({
        title: asText(exercise.title),
        instructions: asText(exercise.instructions),
        items: asTexts(exercise.items),
      }))
      .filter((exercise) => exercise.title || exercise.instructions || exercise.items.length),
  };
}

// A lesson's words, pairs and verbs from Claude's answer or the device's copy; throws when the words are missing.
export function normalizeAnalysis(raw: unknown): Analysis {
  const data = asObject(raw);
  const seen = new Set<string>();
  const words: Word[] = asArray(data.words)
    .map(asObject)
    .map((word) =>
      withTranscription({
        fr: asText(word.fr),
        ru: asText(word.ru),
        kind: asText(word.kind) || 'other',
        added: !!word.added,
        tr: asText(word.tr),
        sense: asText(word.sense).toLowerCase() || undefined,
        ...(word.key === true && { key: true }),
      })
    )
    .filter(
      (word) => word.fr && !seen.has(word.fr.toLowerCase()) && !!seen.add(word.fr.toLowerCase())
    );
  const pairs: Pair[] = asArray(data.pairs)
    .map(asObject)
    .map((pair) => ({
      a: asText(pair.a),
      b: asText(pair.b),
      kind: pair.kind === 'synonym' ? ('synonym' as const) : ('antonym' as const),
    }))
    .filter((pair) => pair.a && pair.b && pair.a !== pair.b);
  const seenVerbs = new Set<string>();
  const verbs: VerbRef[] = asArray(data.verbs)
    .map(asObject)
    .map((verb) => ({ inf: asText(verb.inf), ru: asText(verb.ru) }))
    .filter(
      (verb) =>
        verb.inf &&
        !seenVerbs.has(verb.inf.toLowerCase()) &&
        !!seenVerbs.add(verb.inf.toLowerCase())
    );
  // An empty list is a real answer (a lesson without vocabulary); a missing one means the reply was malformed.
  if (!Array.isArray(data.words)) throw new Error('malformed');
  const language = asLanguage(data.language);
  return { language, topic: asText(data.topic), words, pairs, verbs, local: false };
}

// The grammar rule Claude explains for a lesson; null when the answer has neither a title nor a summary.
export function normalizeGrammarRule(raw: unknown): GrammarRule | null {
  const data = asObject(raw);
  const title = asText(data.title);
  const summary = asText(data.summary);
  if (!title && !summary) return null;
  return {
    title,
    summary,
    formation: asTexts(data.formation),
    usage: asTexts(data.usage),
    examples: asArray(data.examples)
      .map(asObject)
      .map((item) => ({ text: asText(item.text), translation: asText(item.translation) }))
      .filter((item) => item.text),
    pitfall: asText(data.pitfall),
  };
}
