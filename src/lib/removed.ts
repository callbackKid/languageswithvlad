import { useSyncExternalStore } from 'react';

import { wordKey } from './progress';
import { load, save } from './storage';
import type { Analysis } from './types';

/* What the student took out of a lesson's lists on this device: words Claude picked up by
   mistake, or that the student doesn't want to practise. They leave the lesson's tabs and every
   exercise, and come back with Restore. Kept by lesson key, apart from the lesson's analysis, so
   they stay out when the teacher edits the lesson and Claude reads it again. */

const KEY = 'removed';

export interface Removed {
  // lesson key → wordKey of each word taken out
  words: Record<string, string[]>;
}

// Only lists of texts under each lesson are kept: anything else saved there is dropped.
function asRemoved(raw: unknown): Removed {
  const words: Record<string, string[]> = {};
  const stored = raw && typeof raw === 'object' ? (raw as { words?: unknown }).words : null;
  if (stored && typeof stored === 'object')
    for (const [lessonKey, list] of Object.entries(stored)) {
      const texts = Array.isArray(list)
        ? list.filter((item): item is string => typeof item === 'string')
        : [];
      if (texts.length) words[lessonKey] = texts;
    }
  return { words };
}

let current: Removed = asRemoved(load<unknown>(KEY));
const listeners = new Set<() => void>();

function publish(next: Removed) {
  current = next;
  save(KEY, next);
  listeners.forEach((listener) => listener());
}

// Takes a word out of its lesson's list.
export function removeWord(lessonKey: string, fr: string) {
  const list = current.words[lessonKey] ?? [];
  const key = wordKey(fr);
  if (list.includes(key)) return;
  publish({ ...current, words: { ...current.words, [lessonKey]: [...list, key] } });
}

// Puts every word taken out of these lessons back.
export function restoreWords(lessonKeys: string[]) {
  const words = { ...current.words };
  for (const lessonKey of lessonKeys) delete words[lessonKey];
  publish({ ...current, words });
}

// How many words were taken out of these lessons.
export const removedWordCount = (removed: Removed, lessonKeys: string[]) =>
  lessonKeys.reduce((sum, lessonKey) => sum + (removed.words[lessonKey]?.length ?? 0), 0);

// A lesson's analysis without the words taken out of it; the same object when nothing was.
export function withoutRemoved(analysis: Analysis, lessonKey: string, removed: Removed): Analysis {
  const words = removed.words[lessonKey];
  if (!words?.length) return analysis;
  return {
    ...analysis,
    words: analysis.words.filter((word) => !words.includes(wordKey(word.fr))),
  };
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
// For code outside React (lessonWords).
export const getRemoved = () => current;
// What was taken out of the lessons; the component re-renders when that changes.
export const useRemoved = () => useSyncExternalStore(subscribe, getRemoved, getRemoved);
