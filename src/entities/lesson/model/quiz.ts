import { type Conjugation, knownTenses, negate, type VerbRef } from '@/entities/verb/@x/lesson';
import { formKey, isLearned, type Progress, type Word, wordKey } from '@/entities/word/@x/lesson';
import { type Tense } from '@/shared/config';
import { type UiLanguage } from '@/shared/i18n';
import { canSpeak } from '@/shared/lib/speech';
import { shuffle } from '@/shared/lib/util';

import { readConjugation, verbLanguageOf } from './bank';

export interface FormQuestion {
  inf: string;
  t: Tense;
  p: string;
  f: string;
  negative?: boolean;
}
export type QuizItem =
  | { kind: 'pick-ru'; word: Word; choices: string[] }
  | { kind: 'pick-fr'; word: Word; choices: string[] }
  | { kind: 'type-fr'; word: Word }
  // dictation: the word is read aloud and typed
  | { kind: 'listen'; word: Word }
  | { kind: 'form'; form: FormQuestion }
  // the blitz: a sentence with the word as its gap (in the form the sentence needs), picked from choices
  | {
      kind: 'gap';
      word: Word;
      before: string;
      after: string;
      answer: string;
      choices: string[];
      // the whole sentence in Russian
      ru: string;
    }
  // the blitz: the word's definition in its own language, the word typed
  | { kind: 'define'; word: Word; definition: string };

const DAY = 86400000;
// How much more often a key word of the lesson (★) is asked.
const KEY_WEIGHT = 2.5;

// Key words first, each group in the order given: for exercises that take the first few.
export function keyWordsFirst<T extends { key?: boolean }>(items: T[]): T[] {
  return [...items.filter((item) => item.key), ...items.filter((item) => !item.key)];
}

// Draws n items without replacement, each with probability proportional to its weight.
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

/** Hard words first, then new and half-known ones; learned words come back now and then for
    review. The lesson's key words (★) come up more often whatever their state. */
export function pickWords(words: Word[], progress: Progress, count: number): Word[] {
  const now = Date.now();
  const weight = (word: Word) => {
    const stat = progress.words[wordKey(word.fr)];
    if (!stat) return 2;
    if (stat.hard) return 5;
    if (isLearned(stat)) return 0.3 + Math.min((now - stat.last) / (7 * DAY), 2);
    return 2.5;
  };
  // a word without a translation can't be asked
  return weighted(
    words.filter((word) => word.ru),
    (word) => weight(word) * (word.key ? KEY_WEIGHT : 1),
    count
  );
}

/** Every form of a verb in the tenses the student has learned (Settings, or their level); French
    verbs also in the negative (negate knows French only). */
export function verbForms(conjugation: Conjugation): FormQuestion[] {
  const language = conjugation.language ?? 'fr';
  const all: FormQuestion[] = [];
  for (const tense of knownTenses(language))
    for (const form of conjugation.tenses[tense] || []) {
      all.push({ inf: conjugation.inf, t: tense, p: form.p, f: form.f });
      if (language === 'fr')
        all.push({ inf: conjugation.inf, t: tense, ...negate(form, tense), negative: true });
    }
  return all;
}

// Forms of the verbs whose tables the student has opened, missed forms more often.
export function pickForms(verbs: VerbRef[], progress: Progress, count: number): FormQuestion[] {
  const all: FormQuestion[] = [];
  for (const verb of verbs) {
    const language = verbLanguageOf(verb);
    // only the forms are asked, which are the same whatever the translation language: a table
    // opened before the setting changed still counts
    const conjugation =
      readConjugation(verb.inf, language) ?? readConjugation(verb.inf, language, 'ru');
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
  // translations in the other languages: articles and small words that most of them share
  ...['the', 'and', 'for', 'with', 'from'],
  ...['der', 'die', 'das', 'und', 'mit', 'sich', 'ein', 'eine'],
  ...['les', 'une', 'des', 'pour', 'avec', 'dans'],
  ...['los', 'las', 'una', 'del', 'con', 'para', 'por'],
  ...['uma', 'dos', 'das', 'com'],
  ...['della', 'per'],
  // "oneself", "someone", "something": every reflexive or object verb's translation has one
  ...['oneself', 'someone', 'something', 'etwas', 'jemanden', 'jemandem'],
  ...['quelqu', 'quelque', 'chose', 'algo', 'alguien', 'alguém', 'qualcosa', 'qualcuno', 'gli'],
]);
// The words of a translation in any alphabet, lowercase, without the short and the filler ones.
const translationWords = (text: string) =>
  text
    .toLowerCase()
    .replace(/ё/g, 'е')
    .split(/[^\p{L}]+/u)
    .filter((part) => part.length > 2 && !FILLER.has(part));

/** True when the candidate could also be a right answer: same sense, or translations sharing a
    word (выделить, отметить / отметить). A false overlap only drops a wrong answer. */
function overlaps(word: Word, sense: string | undefined, candidate: Word): boolean {
  if (sense && sense === candidate.sense) return true;
  const own = new Set(translationWords(word.ru));
  return translationWords(candidate.ru).some((part) => own.has(part));
}

// Three wrong answers of the same kind of word when possible, none of them close in meaning.
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

// The form of an adjective a dictation asks for, when its forms sound alike.
export type DictationForm = 'masculine' | 'feminine';

/** For a French adjective, the form to write: its masculine and feminine often sound the same
    (grec, grecque; bleu, bleue), so the dictation says which one is meant. It is read from the
    ending of the translation, in translation (its language), which is right even when the teacher
    wrote the feminine: Russian греческий / греческая, Spanish, Italian and Portuguese -o / -a.
    null when it can't be told (English, German and French don't show it, nor does a Russian
    plural or an Italian -e) or doesn't matter. */
export function dictationForm(word: Word, translation: UiLanguage): DictationForm | null {
  if ((word.language ?? 'fr') !== 'fr' || word.kind !== 'adjective') return null;
  // both forms written ("grec, grecque"): the dictation reads them both
  if (/[,/]/.test(word.fr)) return null;
  const [first = ''] = word.ru
    .trim()
    .toLowerCase()
    .split(/[\s,;(]/);
  if (translation === 'ru') {
    if (/(ая|яя)$/.test(first)) return 'feminine';
    if (/(ый|ий|ой)$/.test(first)) return 'masculine';
  }
  if (translation === 'es' || translation === 'it' || translation === 'pt') {
    if (first.endsWith('a')) return 'feminine';
    if (first.endsWith('o')) return 'masculine';
  }
  return null;
}

// Every word read aloud once, to be typed.
export function buildDictation(targets: Word[]): QuizItem[] {
  return shuffle(targets).map((word) => ({ kind: 'listen' as const, word }));
}

// A round of mixed questions on these words (pick, type, listen) and on these verb forms.
export function buildQuiz(targets: Word[], pool: Word[], forms: FormQuestion[] = []): QuizItem[] {
  // every question starts from or ends at the translation
  const items: QuizItem[] = targets
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

/** A choice question on each word that has three wrong answers to offer, for rounds played
    against the clock (the quiz game): no typing, about half one way and half the other. */
export function buildChoiceQuiz(targets: Word[], pool: Word[]): QuizItem[] {
  const items: QuizItem[] = [];
  for (const word of targets.filter((target) => target.ru)) {
    // the other direction when this one has too few wrong answers
    const sides: ('ru' | 'fr')[] = Math.random() < 0.5 ? ['ru', 'fr'] : ['fr', 'ru'];
    for (const side of sides) {
      const wrongAnswers = distractors(word, pool, side);
      if (!wrongAnswers) continue;
      items.push(
        side === 'ru'
          ? { kind: 'pick-ru', word, choices: shuffle([word.ru, ...wrongAnswers]) }
          : { kind: 'pick-fr', word, choices: shuffle([word.fr, ...wrongAnswers]) }
      );
      break;
    }
  }
  return shuffle(items);
}
