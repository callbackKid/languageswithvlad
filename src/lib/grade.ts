export type Grade = 'ok' | 'accent' | 'bad' | 'empty';

const strip = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
/** Case, punctuation ("Je t'aime." = "je t'aime") and invisible characters don't count; apostrophes, hyphens and the (e)s brackets do. */
const normalize = (text: string) =>
  String(text || '')
    .normalize('NFC')
    .toLowerCase()
    .replace(/[’‘`ʼ]/g, "'")
    .replace(/\p{Cf}/gu, '')
    .replace(/[^\p{L}\p{M}\p{N}'()\-\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** "allé(e)s" → allés, allées … every optional part on or off. */
function variants(answer: string): string[] {
  const normalized = normalize(answer);
  const match = normalized.match(/\(([^)]*)\)/);
  if (!match || match.index === undefined) return [normalized];
  const before = normalized.slice(0, match.index),
    after = normalized.slice(match.index + match[0].length);
  return [...variants(before + after), ...variants(before + match[1] + after)];
}

export function grade(input: string, answer: string, pronoun = ''): Grade {
  const typed = normalize(input);
  if (!typed) return 'empty';
  // The answer may be typed with or without the subject pronoun. Both readings are tried,
  // since in "nous nous levons" the reflexive pronoun looks like the subject one.
  const readings = [typed];
  for (const part of normalize(pronoun).split('/').filter(Boolean)) {
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
