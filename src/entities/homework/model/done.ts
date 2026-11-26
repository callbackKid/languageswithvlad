import { useSyncExternalStore } from 'react';

import { loadTexts, save } from '@/shared/lib/storage';

/* The ticked homework tasks of each lesson, under homeworkKey: a list of task texts, the shape
   kept in students' browsers since ticks existed. Saving through here tells every component
   showing ticks (Home, a lesson's Homework tab, the lesson list's badges) to read them again. */

let version = 0;
const subscribers = new Set<() => void>();

// A lesson's ticked tasks; nothing when none are saved or what is saved isn't a list of texts.
export const loadDone = (key: string): string[] => loadTexts(key);

// Saves a lesson's ticked tasks and lets the components showing them know.
export const saveDone = (key: string, tasks: string[]) => {
  save(key, tasks);
  version++;
  subscribers.forEach((notify) => notify());
};

const getVersion = () => version;

// outside the hook, so React subscribes once instead of on every render
const subscribe = (listener: () => void) => {
  subscribers.add(listener);
  return () => {
    subscribers.delete(listener);
  };
};

// A number that changes whenever ticks are saved: a component re-reads them with loadDone.
export const useHomeworkDone = (): number => {
  return useSyncExternalStore(subscribe, getVersion);
};
