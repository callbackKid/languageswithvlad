import { TENSES_BY_LANGUAGE, type VerbLanguage } from '@/shared/config';
import { asArray, asObject } from '@/shared/lib/json';
import { asText } from '@/shared/lib/util';

import { futurProche } from '../lib/futurProche';
import { type Conjugation, type Form } from './types';

// "je me" "lève" → "je" "me lève": the reflexive pronoun belongs to the answer, not the person.
export const withPerson = (form: Form): Form => {
  const match = form.p.match(/^(\S+)\s+(me|te|se|nous|vous|[mts]['’])$/i);
  if (!match) return form;
  const [, person = '', pronoun = ''] = match;
  return { p: person, f: /['’]$/.test(pronoun) ? pronoun + form.f : `${pronoun} ${form.f}` };
};

// A verb's tables in the tenses of its language; throws when even the first tense is missing.
export const normalizeConjugation = (
  raw: unknown,
  infinitive: string,
  language: VerbLanguage
): Conjugation => {
  const data = asObject(raw);
  const rawTenses = asObject(data.tenses);
  const tenses: Conjugation['tenses'] = {};
  for (const tense of TENSES_BY_LANGUAGE[language])
    tenses[tense] = asArray(rawTenses[tense])
      .map(asObject)
      .map((form) => ({ p: asText(form.p), f: asText(form.f) }))
      // "je me" + "lève" is a French slip only
      .map((form) => (language === 'fr' ? withPerson(form) : form))
      .filter((form) => form.f);
  // the first tense (présent, Präsens) is the one every verb has
  if (!tenses[TENSES_BY_LANGUAGE[language][0]]?.length) throw new Error('empty');
  const verb = asText(data.inf) || infinitive;
  if (language === 'fr') tenses['futur proche'] = futurProche(verb);
  return {
    inf: verb,
    ru: asText(data.ru),
    aux: asText(data.aux),
    pp: asText(data.pp),
    language,
    tenses,
  };
};
