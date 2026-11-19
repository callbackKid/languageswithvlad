export type Grade = 'ok' | 'accent' | 'bad' | 'empty';

/** Without accents, and with the letters many keyboards lack spelled out (sœur → soeur,
    Straße → strasse): an answer that differs only there is a near miss, not a mistake. */
const strip = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/ß/g, 'ss');
// Case, punctuation ("Je t'aime." = "je t'aime") and invisible characters don't count; apostrophes, hyphens and the (e)s brackets do.
const normalize = (text: string) =>
  String(text || '')
    .normalize('NFC')
    .toLowerCase()
    .replace(/[’‘`ʼ]/g, "'")
    .replace(/\p{Cf}/gu, '')
    .replace(/[^\p{L}\p{M}\p{N}'()\-\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// "allé(e)s" → allés, allées … every optional part on or off.
function variants(answer: string): string[] {
  const normalized = normalize(answer);
  const match = normalized.match(/\(([^)]*)\)/);
  if (!match || match.index === undefined) return [normalized];
  const before = normalized.slice(0, match.index),
    after = normalized.slice(match.index + match[0].length);
  return [...variants(before + after), ...variants(before + match[1] + after)];
}

// How close a typed answer is: right, right but for the accents, wrong, or not answered.
export function grade(input: string, answer: string, pronoun = ''): Grade {
  const typed = normalize(input);
  // only a blank field is empty; an answer of only punctuation ("?" for "I don't know") is wrong,
  // so the right answer is shown instead of Check doing nothing
  if (!typed) return /[^\s\p{Cf}]/u.test(input) ? 'bad' : 'empty';
  // The answer may be typed with or without the subject pronoun. Both readings are tried,
  // since in "nous nous levons" the reflexive pronoun looks like the subject one. A person like
  // "il/elle/on" is split before normalize, which turns "/" into a space: any one of them counts,
  // and so does the whole label copied as it is.
  const readings = [typed];
  const persons = [pronoun, ...pronoun.split('/')].map(normalize).filter(Boolean);
  for (const part of [...new Set(persons)]) {
    if (part.endsWith("'") && typed.startsWith(part)) {
      readings.push(typed.slice(part.length).trim());
      break;
    }
    if (typed.startsWith(part + ' ')) {
      readings.push(typed.slice(part.length + 1).trim());
      break;
    }
  }
  const accepted = variants(answer).map((variant) => variant.replace(/\s+/g, ' ').trim());
  if (readings.some((reading) => accepted.includes(reading))) return 'ok';
  if (readings.some((reading) => accepted.some((variant) => strip(variant) === strip(reading))))
    return 'accent';
  return 'bad';
}
