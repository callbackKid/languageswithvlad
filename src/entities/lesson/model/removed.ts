import { useSyncExternalStore } from 'react';

import { wordKey } from '@/entities/word/@x/lesson';
import { load, save } from '@/shared/lib/storage';

import { type Analysis } from './types';

/* What the student took out of a lesson's lists on this device: words and verbs Claude picked up
   by mistake, or that the student doesn't want to practise. They leave the lesson's tabs and every
   exercise, and come back with Restore. Kept by lesson key, apart from the lesson's analysis, so
   they stay out when the teacher edits the lesson and Claude reads it again. */

const KEY = 'removed';

export interface Removed {
  // lesson key → wordKey of each word taken out
  words: Record<string, string[]>;
  // lesson key → each verb's infinitive taken out, in lower case
  verbs: Record<string, string[]>;
}
export type RemovedKind = keyof Removed;

// Only lists of texts under each lesson are kept: anything else saved there is dropped.
const asLists = (stored: unknown): Record<string, string[]> => {
  const lists: Record<string, string[]> = {};
  if (stored && typeof stored === 'object')
    for (const [lessonKey, list] of Object.entries(stored)) {
      const texts = Array.isArray(list)
        ? list.filter((item): item is string => typeof item === 'string')
        : [];
      if (texts.length) lists[lessonKey] = texts;
    }
  return lists;
};
const asRemoved = (raw: unknown): Removed => {
  const stored =
    raw && typeof raw === 'object' ? (raw as Partial<Record<RemovedKind, unknown>>) : {};
  return { words: asLists(stored.words), verbs: asLists(stored.verbs) };
};

let current: Removed = asRemoved(load<unknown>(KEY));
const listeners = new Set<() => void>();

const publish = (next: Removed) => {
  current = next;
  save(KEY, next);
  listeners.forEach((listener) => listener());
};

// How a verb is kept in the list: its infinitive in lower case.
const verbKey = (infinitive: string) => infinitive.trim().toLowerCase();

const removeFrom = (kind: RemovedKind, lessonKey: string, key: string) => {
  const list = current[kind][lessonKey] ?? [];
  if (list.includes(key)) return;
  publish({ ...current, [kind]: { ...current[kind], [lessonKey]: [...list, key] } });
};

// Takes a word out of its lesson's list.
export const removeWord = (lessonKey: string, fr: string) =>
  removeFrom('words', lessonKey, wordKey(fr));
// Takes a verb out of its lesson's list.
export const removeVerb = (lessonKey: string, infinitive: string) =>
  removeFrom('verbs', lessonKey, verbKey(infinitive));

// Puts every word, or every verb, taken out of these lessons back.
export const restore = (kind: RemovedKind, lessonKeys: string[]) => {
  const lists = { ...current[kind] };
  for (const lessonKey of lessonKeys) delete lists[lessonKey];
  publish({ ...current, [kind]: lists });
};

// How many words, or verbs, were taken out of these lessons.
export const removedCount = (removed: Removed, kind: RemovedKind, lessonKeys: string[]) =>
  lessonKeys.reduce((sum, lessonKey) => sum + (removed[kind][lessonKey]?.length ?? 0), 0);

// A lesson's analysis without the words and verbs taken out of it; the same object when nothing was.
export const withoutRemoved = (
  analysis: Analysis,
  lessonKey: string,
  removed: Removed
): Analysis => {
  const words = removed.words[lessonKey] ?? [];
  const verbs = removed.verbs[lessonKey] ?? [];
  if (!words.length && !verbs.length) return analysis;
  return {
    ...analysis,
    words: analysis.words.filter((word) => !words.includes(wordKey(word.fr))),
    verbs: analysis.verbs.filter((verb) => !verbs.includes(verbKey(verb.inf))),
  };
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
// For code outside React (lessonWords).
export const getRemoved = () => current;
// What was taken out of the lessons; the component re-renders when that changes.
export const useRemoved = () => useSyncExternalStore(subscribe, getRemoved, getRemoved);
