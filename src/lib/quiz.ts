import { readConj } from "./bank";
import { formKey, isLearned, type Progress, wordKey } from "./progress";
import { TENSES, type Tense, type VerbRef, type Word } from "./types";
import { shuffle } from "./util";

export interface FormQ { inf: string; t: Tense; p: string; f: string }
export type QItem =
  | { kind: "pick-ru"; word: Word; choices: string[] }
  | { kind: "pick-fr"; word: Word; choices: string[] }
  | { kind: "type-fr"; word: Word }
  | { kind: "form"; form: FormQ };

const DAY = 86400000;

/** Draws n items without replacement, each with probability proportional to its weight. */
function weighted<T>(items: T[], weight: (item: T) => number, count: number): T[] {
  const pool = items.map(item => ({ item, weight: Math.max(weight(item), 0.01) }));
  const out: T[] = [];
  while (out.length < count && pool.length) {
    let threshold = Math.random() * pool.reduce((sum, entry) => sum + entry.weight, 0);
    let index = 0;
    while (index < pool.length - 1 && (threshold -= pool[index].weight) > 0) index++;
    out.push(pool.splice(index, 1)[0].item);
  }
  return out;
}

/** Hard words first, then new and half-known ones; learned words come back now and then for review. */
export function pickWords(words: Word[], progress: Progress, count: number): Word[] {
  const now = Date.now();
  // a word without a translation can't be asked
  return weighted(words.filter(word => word.ru), word => {
    const stat = progress.words[wordKey(word.fr)];
    if (!stat) return 2;
    if (stat.hard) return 5;
    if (isLearned(stat)) return 0.3 + Math.min((now - stat.last) / (7 * DAY), 2);
    return 2.5;
  }, count);
}

/** Forms of the verbs whose tables the student has opened, missed forms more often. */
export function pickForms(verbs: VerbRef[], progress: Progress, count: number): FormQ[] {
  const all: FormQ[] = [];
  for (const verb of verbs) {
    const conjugation = readConj(verb.inf);
    if (!conjugation) continue;
    for (const tense of TENSES) for (const form of conjugation.tenses[tense] || []) all.push({ inf: conjugation.inf, t: tense, p: form.p, f: form.f });
  }
  return weighted(all, candidate => {
    const stat = progress.forms[formKey(candidate.inf, candidate.t, candidate.p)];
    return stat ? 1 + stat.wrong * 2 - stat.right * 0.3 : 1;
  }, count);
}

/** Three wrong answers of the same kind of word when possible. */
function distractors(word: Word, pool: Word[], side: "fr" | "ru"): string[] | null {
  const seen = new Set([word[side].toLowerCase()]);
  const out: string[] = [];
  const same = shuffle(pool.filter(candidate => candidate.kind === word.kind)), other = shuffle(pool.filter(candidate => candidate.kind !== word.kind));
  for (const candidate of [...same, ...other]) {
    const value = candidate[side];
    if (!value || seen.has(value.toLowerCase())) continue;
    seen.add(value.toLowerCase());
    out.push(value);
    if (out.length === 3) return out;
  }
  return null;
}

export function buildQuiz(targets: Word[], pool: Word[], forms: FormQ[] = []): QItem[] {
  // every question starts from or ends at the translation
  const items: QItem[] = targets.filter(word => word.ru).map(word => {
    const roll = Math.random();
    if (roll < 0.4) {
      const wrongAnswers = distractors(word, pool, "ru");
      if (wrongAnswers) return { kind: "pick-ru", word, choices: shuffle([word.ru, ...wrongAnswers]) };
    }
    if (roll < 0.7) {
      const wrongAnswers = distractors(word, pool, "fr");
      if (wrongAnswers) return { kind: "pick-fr", word, choices: shuffle([word.fr, ...wrongAnswers]) };
    }
    return { kind: "type-fr", word };
  });
  return shuffle([...items, ...forms.map(form => ({ kind: "form" as const, form }))]);
}
