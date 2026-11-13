import type { Form, Tense } from './types';

const VOWEL = /^[aeiouyàâäéèêëîïôöûùüœæh]/i;
// verbs whose h is aspirated keep a full "ne": je ne hais pas
const ASPIRATED_H = /^(ha[iï]|hurl|hach|hauss|heurt|hiss|hant|harcel|hât|hu[eé])/i;
// object and reflexive pronouns stand between ne and the verb: ne me lève pas, n'y vais pas
const PRONOUNS = /^(?:(?:me|te|se|nous|vous|y|en)\s+|[mts]['’]\s*)*/i;
// lève-toi → ne te lève pas, va-t'en → ne t'en va pas
const IMPERATIVE_PRONOUN = /-(toi|nous|vous|t['’]en)$/i;

/** "je" "mange" → "je" "ne mange pas"; "j'" "ai mangé" → "je" "n'ai pas mangé". */
export function negate(form: Form, tense: Tense): Form {
  let text = form.f.trim();
  if (tense === 'impératif') {
    const match = text.match(IMPERATIVE_PRONOUN);
    const pronoun = match?.[1];
    if (match && pronoun && match.index !== undefined)
      text = `${pronoun.toLowerCase() === 'toi' ? 'te' : pronoun} ${text.slice(0, match.index)}`;
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
}
