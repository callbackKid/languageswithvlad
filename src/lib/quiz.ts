import { readConj } from './bank';
import { canSpeak } from './speech';
import { negate } from './negation';
import { formKey, isLearned, type Progress, wordKey } from './progress';
import { TENSES, type Conjugation, type Tense, type VerbRef, type Word } from './types';
import { shuffle } from './util';

export interface FormQ {
  inf: string;
  t: Tense;
  p: string;
  f: string;
  negative?: boolean;
}
export type QItem =
  | { kind: 'pick-ru'; word: Word; choices: string[] }
  | { kind: 'pick-fr'; word: Word; choices: string[] }
  | { kind: 'type-fr'; word: Word }
  /** dictation: the word is read aloud and typed */
  | { kind: 'listen'; word: Word }
  | { kind: 'form'; form: FormQ };

const DAY = 86400000;

/** Draws n items without replacement, each with probability proportional to its weight. */
function weighted<T>(items: T[], weight: (item: T) => number, count: number): T[] {
  const pool = items.map((item) => ({ item, weight: Math.max(weight(item), 0.01) }));
  const out: T[] = [];
  while (out.length < count && pool.length) {
    let threshold = Math.random() * pool.reduce((sum, entry) => sum + entry.weight, 0);
    let index = 0;
    while (index < pool.length - 1 && (threshold -= pool[index]?.weight ?? 0) > 0) index++;
    const [picked] = pool.splice(index, 1);
    if (!picked) break;
    out.push(picked.item);
  }
  return out;
}

/** Hard words first, then new and half-known ones; learned words come back now and then for review. */
export function pickWords(words: Word[], progress: Progress, count: number): Word[] {
  const now = Date.now();
  // a word without a translation can't be asked
  return weighted(
    words.filter((word) => word.ru),
    (word) => {
      const stat = progress.words[wordKey(word.fr)];
      if (!stat) return 2;
      if (stat.hard) return 5;
      if (isLearned(stat)) return 0.3 + Math.min((now - stat.last) / (7 * DAY), 2);
      return 2.5;
    },
    count
  );
}

/** Every form of a verb, affirmative and negative. */
export function verbForms(conjugation: Conjugation): FormQ[] {
  const all: FormQ[] = [];
  for (const tense of TENSES)
    for (const form of conjugation.tenses[tense] || []) {
      all.push({ inf: conjugation.inf, t: tense, p: form.p, f: form.f });
      all.push({ inf: conjugation.inf, t: tense, ...negate(form, tense), negative: true });
    }
  return all;
}

/** Forms of the verbs whose tables the student has opened, missed forms more often. */
export function pickForms(verbs: VerbRef[], progress: Progress, count: number): FormQ[] {
  const all: FormQ[] = [];
  for (const verb of verbs) {
    const conjugation = readConj(verb.inf);
    if (conjugation) all.push(...verbForms(conjugation));
  }
  return weighted(
    all,
    (candidate) => {
      const stat =
        progress.forms[formKey(candidate.inf, candidate.t, candidate.p, candidate.negative)];
      return stat ? 1 + stat.wrong * 2 - stat.right * 0.3 : 1;
    },
    count
  );
}

// too common to tell two translations apart
const FILLER = new Set([
  'что',
  'это',
  'для',
  'как',
  'кто',
  'где',
  'при',
  'или',
  'себя',
  'быть',
  'его',
  'она',
  'они',
  'чем',
]);
const russianWords = (text: string) =>
  text
    .toLowerCase()
    .replace(/ё/g, 'е')
    .split(/[^а-я]+/)
    .filter((part) => part.length > 2 && !FILLER.has(part));

/** True when the candidate could also be a right answer: same sense, or translations sharing a word (выделить, отметить / отметить). */
function overlaps(word: Word, sense: string | undefined, candidate: Word): boolean {
  if (sense && sense === candidate.sense) return true;
  const own = new Set(russianWords(word.ru));
  return russianWords(candidate.ru).some((part) => own.has(part));
}

/** Three wrong answers of the same kind of word when possible, none of them close in meaning. */
function distractors(word: Word, pool: Word[], side: 'fr' | 'ru'): string[] | null {
  const seen = new Set([word[side].toLowerCase()]);
  const out: string[] = [];
  // words rebuilt from mistakes carry no sense, the lesson's copy does
  const sense = word.sense || pool.find((candidate) => candidate.fr === word.fr)?.sense;
  const allowed = pool.filter((candidate) => !overlaps(word, sense, candidate));
  const same = shuffle(allowed.filter((candidate) => candidate.kind === word.kind)),
    other = shuffle(allowed.filter((candidate) => candidate.kind !== word.kind));
  for (const candidate of [...same, ...other]) {
    const value = candidate[side];
    if (!value || seen.has(value.toLowerCase())) continue;
    seen.add(value.toLowerCase());
    out.push(value);
    if (out.length === 3) return out;
  }
  return null;
}

/** Every word read aloud once, to be typed. */
export function buildDictation(targets: Word[]): QItem[] {
  return shuffle(targets).map((word) => ({ kind: 'listen' as const, word }));
}

export function buildQuiz(targets: Word[], pool: Word[], forms: FormQ[] = []): QItem[] {
  // every question starts from or ends at the translation
  const items: QItem[] = targets
    .filter((word) => word.ru)
    .map((word) => {
      const roll = Math.random();
      if (roll < 0.4) {
        const wrongAnswers = distractors(word, pool, 'ru');
        if (wrongAnswers)
          return { kind: 'pick-ru', word, choices: shuffle([word.ru, ...wrongAnswers]) };
      }
      if (roll < 0.7) {
        const wrongAnswers = distractors(word, pool, 'fr');
        if (wrongAnswers)
          return { kind: 'pick-fr', word, choices: shuffle([word.fr, ...wrongAnswers]) };
      }
      if (canSpeak && roll > 0.88) return { kind: 'listen', word };
      return { kind: 'type-fr', word };
    });
  return shuffle([...items, ...forms.map((form) => ({ kind: 'form' as const, form }))]);
}
