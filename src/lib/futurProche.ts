import type { Form } from './types';

/* The futur proche is aller in the présent + the infinitive (je vais manger), so the app builds it
   from the infinitive instead of asking Claude: verb tables saved before it was added get it too. */

const ALLER = [
  ['je', 'vais'],
  ['tu', 'vas'],
  ['il/elle/on', 'va'],
  ['nous', 'allons'],
  ['vous', 'allez'],
  ['ils/elles', 'vont'],
] as const;
// each person's reflexive pronoun before a consonant, and before a vowel or a mute h
const REFLEXIVE = [
  ['me ', 'm'],
  ['te ', 't'],
  ['se ', 's'],
  ['nous ', 'nous '],
  ['vous ', 'vous '],
  ['se ', 's'],
] as const;

// "manger" → je vais manger…; "se lever" → je vais me lever…; "s'habiller" → je vais m'habiller…
export function futurProche(infinitive: string): Form[] {
  const verb = infinitive.trim().replace(/\s+/g, ' ');
  // "s'habiller", "s’en aller": the pronoun is elided, with the infinitive's own apostrophe
  const elided = verb.match(/^s(['’])\s*(.+)$/i);
  const reflexive = elided ? null : verb.match(/^se (.+)$/i);
  return ALLER.map(([person, aller], index) => {
    const [pronoun, beforeVowel] = REFLEXIVE[index] ?? ['', ''];
    let rest = verb;
    if (elided) {
      const [, apostrophe = "'", stem = ''] = elided;
      rest = (beforeVowel.endsWith(' ') ? beforeVowel : beforeVowel + apostrophe) + stem;
    } else if (reflexive) rest = pronoun + (reflexive[1] ?? '');
    return { p: person, f: `${aller} ${rest}` };
  });
}
