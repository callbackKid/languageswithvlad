import { type Tense } from '@/shared/config';

import { type Form } from '../model/types';

const VOWEL = /^[aeiouyàâäéèêëîïôöûùüœæh]/i;
// verbs whose h is aspirated keep a full "ne": je ne hais pas
const ASPIRATED_H = /^(ha[iï]|hurl|hach|hauss|heurt|hiss|hant|harcel|hât|hu[eé])/i;
// object and reflexive pronouns stand between ne and the verb: ne me lève pas, n'y vais pas
const PRONOUNS = /^(?:(?:me|te|se|nous|vous|le|la|les|lui|leur|y|en)\s+|[lmts]['’]\s*)*/i;
// lève-toi → ne te lève pas, va-t'en → ne t'en va pas
const CLITIC_ORDER = [
  'me',
  'te',
  'se',
  'nous',
  'vous',
  'le',
  'la',
  'les',
  'lui',
  'leur',
  'y',
  'en',
];
const IMPERATIVE_PRONOUN = /(-(?:moi|toi|nous|vous|le|la|les|lui|leur|y|en|[mt]['’](?:en|y)))+$/i;

// "je" "mange" → "je" "ne mange pas"; "j'" "ai mangé" → "je" "n'ai pas mangé".
export const negate = (form: Form, tense: Tense): Form => {
  let text = form.f.trim();
  if (tense === 'impératif') {
    const match = text.match(IMPERATIVE_PRONOUN);
    if (match) {
      const affirmative = text.slice(0, match.index);
      // The extra s of vas-y and manges-en goes away when the clitic moves before the verb.
      const verb = /^-(?:y|en)$/i.test(match[0])
        ? affirmative.replace(/(?:es|vas)$/i, (ending) => ending.slice(0, -1))
        : affirmative;
      const pronouns = match[0]
        .toLowerCase()
        .replace(/m['’](en|y)/g, 'me-$1')
        .replace(/t['’](en|y)/g, 'te-$1')
        .slice(1)
        .split('-')
        .map((pronoun) => (pronoun === 'moi' ? 'me' : pronoun === 'toi' ? 'te' : pronoun))
        .sort((first, second) => CLITIC_ORDER.indexOf(first) - CLITIC_ORDER.indexOf(second));
      text = [...pronouns, verb]
        .join(' ')
        .replace(
          /\b(me|te|le|la) (?=[aeiouyàâäéèêëîïôöûùüœæh])/gi,
          (part, _pronoun, index, phrase) =>
            ASPIRATED_H.test(phrase.slice(index + part.length)) ? part : part[0] + "'"
        );
    }
  }
  const pronouns = text.match(PRONOUNS)?.[0] ?? '';
  // pas follows the conjugated word: the verb itself or the auxiliary
  const [verb, ...rest] = text.slice(pronouns.length).trim().split(/\s+/);
  const following = pronouns || verb || '';
  const ne = VOWEL.test(following) && !ASPIRATED_H.test(following) ? "n'" : 'ne ';
  return {
    p: form.p.replace(/^j['’]$/i, 'je'),
    f: ne + pronouns + [verb, 'pas', ...rest].join(' '),
  };
};
