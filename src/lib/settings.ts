import { useSyncExternalStore } from 'react';
import type { Section } from './sections';
import { load, save } from './storage';
import { LANGUAGES, type Language } from './types';

/* The student's settings, saved in this browser. The interface language has its own store
   (src/i18n/core.tsx); everything else lives here. */

export const LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type Level = (typeof LEVELS)[number];
export type Theme = 'system' | 'light' | 'dark';
export type SpeechSpeed = 'normal' | 'slow';
export const DAILY_GOALS = [10, 20, 30, 50] as const;

/** Sections that can't be hidden: the way back to everything else. */
export const ALWAYS_SHOWN: Section[] = ['home', 'settings'];

export interface Settings {
  /** the languages the student learns; exercises and Discuss only offer these */
  studying: Language[];
  /** the student's level in each language, the default for Discuss and exercise sentences */
  levels: Record<Language, Level>;
  theme: Theme;
  name: string;
  /** a small square picture as a data: URL, or "" */
  avatar: string;
  /** answers a day for the 🔥 streak's daily goal */
  dailyGoal: number;
  speechSpeed: SpeechSpeed;
  /** sections taken out of the menu (their addresses still work) */
  hidden: Section[];
}

const DEFAULTS: Settings = {
  studying: [...LANGUAGES],
  levels: { fr: 'A2', en: 'A2', de: 'A2' },
  theme: 'system',
  name: '',
  avatar: '',
  dailyGoal: 20,
  speechSpeed: 'normal',
  hidden: [],
};
const KEY = 'settings';

/** Older or hand-edited values never break the app: anything unknown falls back to the default. */
function sanitize(raw: Partial<Settings> | null): Settings {
  const value = { ...DEFAULTS, ...raw };
  const studying = (Array.isArray(value.studying) ? value.studying : []).filter((language) =>
    LANGUAGES.includes(language)
  );
  return {
    ...value,
    studying: studying.length ? studying : DEFAULTS.studying,
    levels: { ...DEFAULTS.levels, ...value.levels },
    theme: ['system', 'light', 'dark'].includes(value.theme) ? value.theme : 'system',
    dailyGoal: DAILY_GOALS.includes(value.dailyGoal as never) ? value.dailyGoal : 20,
    hidden: Array.isArray(value.hidden) ? value.hidden : [],
  };
}

let current = sanitize(load<Partial<Settings>>(KEY));
const listeners = new Set<() => void>();

const prefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

/** The theme actually shown, after "system" is resolved. */
export const isDark = (settings: Settings = current) =>
  settings.theme === 'dark' || (settings.theme === 'system' && prefersDark());

/** The page reads data-theme: no attribute follows the system, "light"/"dark" force one. */
function applyTheme(settings: Settings) {
  if (typeof document === 'undefined') return;
  if (settings.theme === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = settings.theme;
}
applyTheme(current);
if (typeof window !== 'undefined')
  // components that draw in the theme's colours (the board) re-render when the system switches
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => listeners.forEach((listener) => listener()));

export const getSettings = () => current;

export function updateSettings(changes: Partial<Settings>) {
  current = sanitize({ ...current, ...changes });
  save(KEY, current);
  applyTheme(current);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export const useSettings = () => useSyncExternalStore(subscribe, getSettings, getSettings);

/** Whether a word in this language should appear in exercises. */
export const isStudied = (language: Language | undefined, settings: Settings = current) =>
  settings.studying.includes(language ?? 'fr');
