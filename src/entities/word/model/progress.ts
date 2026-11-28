import { useSyncExternalStore } from 'react';

import {
  asLanguage,
  getSettings,
  isStudied,
  type Language,
  languageOfTense,
} from '@/shared/config';
import { dayKey } from '@/shared/lib/dates';
import { asFields, loadChecked, trySave, watchStorage } from '@/shared/lib/storage';

import { type Word } from './types';

// Correct answers in a row that make a word learned (and take it off the hard list).
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
  // on the "Words to learn" list: starred by hand or missed in an exercise
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
  // answers given per local day, "2026-11-12" → 14
  days?: Record<string, number>;
}

const EMPTY: Progress = { words: {}, forms: {} };

/** Saved progress with every entry checked: a word or form with missing fields is dropped rather
    than breaking the exercises, Stats and Mistakes. */
const asProgress = (raw: unknown): Progress => {
  const data = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const entries = (value: unknown) =>
    Object.entries(value && typeof value === 'object' ? value : {});
  const words: Record<string, WordStat> = {};
  for (const [key, value] of entries(data.words)) {
    const fields = asFields(value, {
      fr: 'string',
      ru: 'string',
      right: 'number',
      wrong: 'number',
      streak: 'number',
      last: 'number',
    });
    if (!fields) continue;
    const stat = value as Record<string, unknown>;
    words[key] = {
      ...fields,
      tr: typeof stat.tr === 'string' ? stat.tr : '',
      kind: typeof stat.kind === 'string' ? stat.kind : 'other',
      lesson: typeof stat.lesson === 'string' ? stat.lesson : '',
      ...(stat.language !== undefined && { language: asLanguage(stat.language) }),
      hard: stat.hard === true,
    };
  }
  const forms: Record<string, FormStat> = {};
  for (const [key, value] of entries(data.forms)) {
    const fields = asFields(value, {
      inf: 'string',
      t: 'string',
      p: 'string',
      f: 'string',
      right: 'number',
      wrong: 'number',
      last: 'number',
    });
    if (fields) forms[key] = { ...fields, negative: (value as FormStat).negative === true };
  }
  const days: Record<string, number> = {};
  for (const [day, count] of entries(data.days)) if (typeof count === 'number') days[day] = count;
  return { words, forms, days };
};
let docId: string | null = null;
let state: Progress = EMPTY;
const subscribers = new Set<() => void>();
type ProgressUpdate = (progress: Progress) => Progress;
const pending = new Map<string, ProgressUpdate[]>();
const scheduled = new Set<string>();
let stopWatching: (() => void) | undefined;
const progressKey = (id: string) => `progress:${id}`;
const readProgress = (id: string) => loadChecked(progressKey(id), asProgress) ?? EMPTY;

const notifyProgress = () => {
  subscribers.forEach((notify) => notify());
};

const readWithPending = (id: string): Progress => {
  return (pending.get(id) ?? []).reduce((current, update) => update(current), readProgress(id));
};

// A word's key in saved progress. Saved in students' browsers: never change it.
export const wordKey = (fr: string) =>
  fr.toLowerCase().replace(/[’`ʼ]/g, "'").replace(/\s+/g, ' ').trim();
// A verb form's key in saved progress. Saved in students' browsers: never change it.
export const formKey = (infinitive: string, tense: string, person: string, negative = false) =>
  `${infinitive.toLowerCase()}|${tense}|${person}${negative ? '|ne' : ''}`;
// Learned: answered right LEARNED_STREAK times in a row.
export const isLearned = (stat: WordStat | undefined) => !!stat && stat.streak >= LEARNED_STREAK;

// Select the progress snapshot before the first render or when the user changes documents.
export const setProgressDoc = (id: string | null) => {
  if (id === docId) return;
  stopWatching?.();
  docId = id;
  state = id ? readWithPending(id) : EMPTY;
  stopWatching = id
    ? watchStorage(progressKey(id), () => {
        state = readWithPending(id);
        notifyProgress();
      })
    : undefined;
  queueMicrotask(notifyProgress);
};

// Counts one more answer for today.
const withAnswer = (progress: Progress, answeredAt: number): Progress => {
  const today = dayKey(new Date(answeredAt));
  const days = progress.days || {};
  return { ...progress, days: { ...days, [today]: (days[today] || 0) + 1 } };
};

// Today's answers and the run of days in a row with at least one answer; a run still counts until today is over.
export const dailyStats = (progress: Progress = state): { today: number; streak: number } => {
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
};

const flush = (id: string) => {
  if (!scheduled.delete(id)) return;
  const next = readWithPending(id);
  if (trySave(progressKey(id), next)) pending.delete(id);
  if (docId === id) {
    state = next;
    notifyProgress();
  }
};

const commit = (update: ProgressUpdate) => {
  const id = docId;
  // Keep feedback immediate even while another tab holds the document's write lock.
  state = update(state);
  if (!id) {
    notifyProgress();
    return;
  }
  const updates = pending.get(id);
  if (updates) updates.push(update);
  else pending.set(id, [update]);
  notifyProgress();
  if (scheduled.has(id)) return;
  scheduled.add(id);
  // Re-read inside the lock. A snapshot that was current when the answer was entered can be stale.
  if (navigator.locks) {
    void navigator.locks.request(progressKey(id), () => flush(id)).catch(() => flush(id));
  } else {
    // On older browsers, still read the latest snapshot before writing and listen for changes.
    flush(id);
  }
};

const baseStat = (word: Word, old?: WordStat): WordStat => {
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
};

// Counts an answer on a word; a wrong one puts the word on Words to learn.
export const recordWord = (word: Word, ok: boolean) => {
  const identity = wordKey(word.fr);
  const answeredAt = Date.now();
  commit((current) => {
    const stat = baseStat(word, current.words[identity]);
    if (ok) {
      stat.right++;
      stat.streak++;
      if (stat.streak >= LEARNED_STREAK) stat.hard = false;
    } else {
      stat.wrong++;
      stat.streak = 0;
      stat.hard = true;
    }
    stat.last = answeredAt;
    return withAnswer({ ...current, words: { ...current.words, [identity]: stat } }, answeredAt);
  });
};

// Stars or unstars a word (Words to learn).
export const setHard = (word: Word, hard: boolean) => {
  const identity = wordKey(word.fr);
  commit((current) => {
    const stat = baseStat(word, current.words[identity]);
    stat.hard = hard;
    // starring a learned word means the student wants to review it again
    if (hard && stat.streak >= LEARNED_STREAK) stat.streak = 0;
    return { ...current, words: { ...current.words, [identity]: stat } };
  });
};

// Counts an answer on one verb form.
export const recordForm = (
  infinitive: string,
  tense: string,
  person: string,
  form: string,
  ok: boolean,
  negative = false
) => {
  const identity = formKey(infinitive, tense, person, negative);
  const answeredAt = Date.now();
  commit((current) => {
    const old = current.forms[identity];
    const stat: FormStat = {
      inf: infinitive,
      t: tense,
      p: person,
      f: form,
      negative,
      right: (old?.right ?? 0) + Number(ok),
      wrong: (old?.wrong ?? 0) + Number(!ok),
      last: answeredAt,
    };
    return withAnswer({ ...current, forms: { ...current.forms, [identity]: stat } }, answeredAt);
  });
};

// The open document's progress, for code outside React.
export const getProgress = () => state;

// outside the hook, so React subscribes once instead of on every render
const subscribe = (listener: () => void) => {
  subscribers.add(listener);
  return () => {
    subscribers.delete(listener);
  };
};

// The open document's progress; the component re-renders with every answer counted.
export const useProgress = (): Progress => {
  return useSyncExternalStore(subscribe, getProgress);
};

// Subscribe to one displayed value without rendering again for unrelated progress updates.
export const useProgressValue = <Value extends boolean | number>(
  select: (progress: Progress) => Value
): Value => useSyncExternalStore(subscribe, () => select(getProgress()));

// A saved word as a Word again, for exercises on Words to learn and mistakes.
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

// The words and verb forms missed most often, most misses first.
export const topMistakes = (
  progress: Progress = state,
  limit = 20
): { words: WordStat[]; forms: FormStat[] } => {
  // only the languages the student learns (Settings); a verb form's tense names its language
  const settings = getSettings();
  return {
    words: Object.values(progress.words)
      .filter((stat) => stat.wrong > 0 && isStudied(stat.language, settings))
      .sort(byMisses)
      .slice(0, limit),
    forms: Object.values(progress.forms)
      .filter((stat) => stat.wrong > 0 && isStudied(languageOfTense(stat.t), settings))
      .sort(byMisses)
      .slice(0, limit),
  };
};
