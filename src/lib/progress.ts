import { useSyncExternalStore } from 'react';
import { load, save } from './storage';
import type { Language, Word } from './types';

/** Correct answers in a row that make a word learned (and take it off the hard list). */
export const LEARNED_STREAK = 3;

export interface WordStat {
  fr: string;
  ru: string;
  tr: string;
  kind: string;
  lesson: string;
  language?: Language;
  right: number;
  wrong: number;
  streak: number;
  last: number;
  /** on the "My words" list: starred by hand or missed in an exercise */
  hard: boolean;
}
export interface FormStat {
  inf: string;
  t: string;
  p: string;
  f: string;
  negative?: boolean;
  right: number;
  wrong: number;
  last: number;
}
export interface Progress {
  words: Record<string, WordStat>;
  forms: Record<string, FormStat>;
  /** answers given per local day, "2026-11-12" → 14 */
  days?: Record<string, number>;
}

/** Answers a day that count as a full day of practice. */
export const DAILY_GOAL = 20;

const EMPTY: Progress = { words: {}, forms: {} };
let docId: string | null = null;
let state: Progress = EMPTY;
const subscribers = new Set<() => void>();

export const wordKey = (fr: string) =>
  fr.toLowerCase().replace(/[’`ʼ]/g, "'").replace(/\s+/g, ' ').trim();
export const formKey = (infinitive: string, tense: string, person: string, negative = false) =>
  `${infinitive.toLowerCase()}|${tense}|${person}${negative ? '|ne' : ''}`;
export const isLearned = (stat: WordStat | undefined) => !!stat && stat.streak >= LEARNED_STREAK;

/** Safe to call while rendering: the new state is readable at once, subscribers hear about it after the render. */
export function setProgressDoc(id: string | null) {
  if (id === docId) return;
  docId = id;
  state = (id && load<Progress>('progress:' + id)) || EMPTY;
  queueMicrotask(() => subscribers.forEach((notify) => notify()));
}

const dayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/** Counts one more answer for today. */
function withAnswer(progress: Progress): Progress {
  const today = dayKey(new Date());
  const days = progress.days || {};
  return { ...progress, days: { ...days, [today]: (days[today] || 0) + 1 } };
}

/** Today's answers and the run of days in a row with at least one answer; a run still counts until today is over. */
export function dailyStats(progress: Progress = state): { today: number; streak: number } {
  const days = progress.days || {};
  const cursor = new Date();
  const today = days[dayKey(cursor)] || 0;
  if (!today) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days[dayKey(cursor)]) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { today, streak };
}

function commit(next: Progress) {
  state = next;
  if (docId) save('progress:' + docId, next);
  subscribers.forEach((notify) => notify());
}

function baseStat(word: Word, old?: WordStat): WordStat {
  return {
    right: 0,
    wrong: 0,
    streak: 0,
    last: 0,
    hard: false,
    ...old,
    // keep the newest spelling, translation and lesson for the lists
    fr: word.fr,
    ru: word.ru,
    tr: word.tr,
    kind: word.kind,
    lesson: word.lesson || old?.lesson || '',
    language: word.language ?? old?.language,
  };
}

export function recordWord(word: Word, ok: boolean) {
  const identity = wordKey(word.fr);
  const stat = baseStat(word, state.words[identity] as WordStat | undefined);
  if (ok) {
    stat.right++;
    stat.streak++;
    if (stat.streak >= LEARNED_STREAK) stat.hard = false;
  } else {
    stat.wrong++;
    stat.streak = 0;
    stat.hard = true;
  }
  stat.last = Date.now();
  commit(withAnswer({ ...state, words: { ...state.words, [identity]: stat } }));
}

export function setHard(word: Word, hard: boolean) {
  const identity = wordKey(word.fr);
  const stat = baseStat(word, state.words[identity]);
  stat.hard = hard;
  // starring a learned word means the student wants to review it again
  if (hard && stat.streak >= LEARNED_STREAK) stat.streak = 0;
  commit({ ...state, words: { ...state.words, [identity]: stat } });
}

export function recordForm(
  infinitive: string,
  tense: string,
  person: string,
  form: string,
  ok: boolean,
  negative = false
) {
  const identity = formKey(infinitive, tense, person, negative);
  const old: FormStat | undefined = state.forms[identity];
  const stat: FormStat = {
    inf: infinitive,
    t: tense,
    p: person,
    f: form,
    negative,
    right: old?.right ?? 0,
    wrong: old?.wrong ?? 0,
    last: Date.now(),
  };
  if (ok) stat.right++;
  else stat.wrong++;
  commit(withAnswer({ ...state, forms: { ...state.forms, [identity]: stat } }));
}

export const getProgress = () => state;

export function useProgress(): Progress {
  return useSyncExternalStore(
    (listener) => {
      subscribers.add(listener);
      return () => {
        subscribers.delete(listener);
      };
    },
    () => state
  );
}

export const statWord = (stat: WordStat): Word => ({
  fr: stat.fr,
  ru: stat.ru,
  tr: stat.tr,
  kind: stat.kind,
  added: false,
  lesson: stat.lesson,
  language: stat.language,
});

const byMisses = <T extends { wrong: number; right: number }>(first: T, second: T) =>
  second.wrong - first.wrong || first.right - second.right;

/** The words and verb forms missed most often, most misses first. */
export function topMistakes(
  progress: Progress = state,
  limit = 20
): { words: WordStat[]; forms: FormStat[] } {
  return {
    words: Object.values(progress.words)
      .filter((stat) => stat.wrong > 0)
      .sort(byMisses)
      .slice(0, limit),
    forms: Object.values(progress.forms)
      .filter((stat) => stat.wrong > 0)
      .sort(byMisses)
      .slice(0, limit),
  };
}
