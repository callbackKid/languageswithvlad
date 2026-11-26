import { isVerbLanguage, type Language, type VerbLanguage } from '@/shared/config';

import { type Conjugation } from '../model/types';

/* The group (conjugation class) of a verb, for sorting a lesson's verbs, and the two orders the
   Verbs tab offers. French has the three groups learners know: 1 for -er verbs (but aller), 2 for
   -ir verbs with -issons (finir), 3 for the rest. Spanish and Portuguese count -ar, -er and -ir as
   1, 2 and 3, Italian -are, -ere and -ire. German verbs have no such groups. */

export type VerbGroup = 1 | 2 | 3;
export const VERB_SORTS = ['alphabet', 'group'] as const;
export type VerbSort = (typeof VERB_SORTS)[number];

/** French -ir verbs of the 3rd group, as endings, so compounds count too (devenir, revenir,
    découvrir). A verb whose table is loaded is checked by its nous form instead, which also sets
    right the few 2nd-group verbs that end like these (assortir, répartir). */
const FRENCH_THIRD_GROUP_IR = [
  'venir',
  'tenir',
  'partir',
  'sortir',
  'dormir',
  'mentir',
  'sentir',
  'servir',
  'courir',
  'mourir',
  'vrir',
  'frir',
  'cueillir',
  'bouillir',
  'fuir',
  'quérir',
  'vêtir',
  'faillir',
  'gésir',
  'ouïr',
];

// The infinitive without its reflexive pronoun: "se lever", "alzarsi", "sich waschen" → its verb.
const bareInfinitive = (infinitive: string, language: VerbLanguage): string => {
  const lower = infinitive.trim().toLowerCase();
  if (language === 'fr') return lower.replace(/^(se |s['’])/, '');
  // levantarse, alzarsi, levantar-se
  if (language === 'es') return lower.replace(/se$/, '');
  if (language === 'it') return lower.replace(/si$/, 'e');
  if (language === 'pt') return lower.replace(/-se$/, '');
  if (language === 'de') return lower.replace(/^sich /, '');
  return lower;
};

// A verb's group, or null when its language has none or the ending is unusual.
export const verbGroup = (
  infinitive: string,
  language: VerbLanguage,
  conjugation?: Conjugation | null
): VerbGroup | null => {
  const verb = bareInfinitive(infinitive, language);
  if (language === 'fr') {
    if (verb === 'aller') return 3;
    if (verb.endsWith('er')) return 1;
    // -oir verbs (pouvoir, s'asseoir) end in -ir too but are all 3rd group
    if (!verb.endsWith('ir') || verb.endsWith('oir')) return 3;
    const nous = conjugation?.tenses.présent?.find((form) => form.p.trim() === 'nous')?.f;
    if (nous) return /issons$/.test(nous.trim()) ? 2 : 3;
    return FRENCH_THIRD_GROUP_IR.some((ending) => verb.endsWith(ending)) ? 3 : 2;
  }
  if (language === 'es' || language === 'pt') {
    if (verb.endsWith('ar')) return 1;
    // pôr and its compounds (compor, propor) belong with the -er verbs
    if (verb.endsWith('er') || /[oô]r$/.test(verb)) return 2;
    if (verb.endsWith('ir')) return 3;
    return null;
  }
  if (language === 'it') {
    if (verb.endsWith('are')) return 1;
    // porre, tradurre, trarre came from -ere verbs
    if (verb.endsWith('ere') || verb.endsWith('rre')) return 2;
    if (verb.endsWith('ire')) return 3;
    return null;
  }
  return null;
};

/** Verbs in alphabetical order, or, by group, in groups 1, 2, 3 and then those without one, each
    group alphabetical. A reflexive verb sorts by the verb itself (se lever with the l's), and é
    sorts with e. */
export const sortVerbs = <T extends { inf: string; language?: Language }>(
  verbs: T[],
  sort: VerbSort,
  groupOf: (verb: T) => VerbGroup | null,
  locale: string
): { group: VerbGroup | null; verbs: T[] }[] => {
  const collator = new Intl.Collator(locale, { sensitivity: 'base' });
  const nameOf = (verb: T) =>
    bareInfinitive(verb.inf, isVerbLanguage(verb.language) ? verb.language : 'fr');
  const sorted = [...verbs].sort((a, b) => collator.compare(nameOf(a), nameOf(b)));
  if (sort === 'alphabet') return [{ group: null, verbs: sorted }];
  const groups: (VerbGroup | null)[] = [1, 2, 3, null];
  return groups
    .map((group) => ({ group, verbs: sorted.filter((verb) => groupOf(verb) === group) }))
    .filter((entry) => entry.verbs.length);
};
