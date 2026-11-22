import { asArray, asObject } from '@/shared/lib/json';
import { asText } from '@/shared/lib/util';

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
