import { type Word } from '@/entities/word';
import { asArray, asObject } from '@/shared/lib/json';
import { asText } from '@/shared/lib/util';

// an article at the start of a noun, in the learned languages (le, l', der, el, o, il…)
const ARTICLE =
  /^(?:(?:le|la|les|un|une|des|der|die|das|ein|eine|el|los|las|una|o|a|os|as|um|uma|il|lo|i|gli|uno)\s+|(?:l|un)['’]\s*)/i;

// a group name from Claude is cut to this length, like the names sent back to it (api/analyze.ts)
const MAX_GROUP_NAME_LENGTH = 60;

/** Claude's groups by meaning for the words sent: each word (as sent) to its group's name, its
    spelling matched without regard to case. Words left out aren't in the map, even when that is
    all of them (the caller keeps them as in no group, so they aren't asked about again); throws
    only when the answer has no list of groups at all. */
export function normalizeWordGroups(raw: unknown, sent: string[]): Map<string, string> {
  const { groups } = asObject(raw);
  if (!Array.isArray(groups)) throw new Error('no_groups');
  const wanted = new Map(sent.map((word) => [word.toLowerCase(), word]));
  const found = new Map<string, string>();
  for (const group of asArray(groups).map(asObject)) {
    const name = asText(group.name).slice(0, MAX_GROUP_NAME_LENGTH);
    if (!name) continue;
    for (const listed of asArray(group.words).map(asText)) {
      const word = wanted.get(listed.toLowerCase());
      if (word && !found.has(word)) found.set(word, name);
    }
  }
  return found;
}

// a definition longer than this is cut (the prompt asks for about 15 words)
const MAX_DEFINITION_LENGTH = 300;

/** Claude's definitions for the blitz, each matched to its word (spelling compared without regard
    to case). A definition that contains the word itself gives the answer away and is left out;
    throws when none is left. */
export function normalizeDefinitions(
  raw: unknown,
  words: Word[]
): { word: Word; definition: string }[] {
  const wanted = new Map(words.map((word) => [word.fr.toLowerCase(), word]));
  const found = new Map<Word, string>();
  for (const item of asArray(raw).map(asObject)) {
    const word = wanted.get(asText(item.word).toLowerCase());
    const definition = asText(item.definition).slice(0, MAX_DEFINITION_LENGTH);
    if (!word || !definition || found.has(word)) continue;
    if (definition.toLowerCase().includes(bareWord(word.fr).toLowerCase())) continue;
    found.set(word, definition);
  }
  if (!found.size) throw new Error('empty');
  return [...found].map(([word, definition]) => ({ word, definition }));
}

// The word without a leading article, as it would appear inside a sentence: "la boulangerie" → "boulangerie".
function bareWord(text: string): string {
  return text.replace(ARTICLE, '').trim() || text;
}
