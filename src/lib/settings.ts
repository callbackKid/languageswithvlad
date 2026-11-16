import { useSyncExternalStore } from 'react';

import type { Section } from './sections';
import { load, save } from './storage';
import { type Language, LANGUAGES } from './types';

/* The student's settings, saved in this browser. The interface language has its own store
   (src/i18n/core.tsx); everything else lives here. */

export const LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type Level = (typeof LEVELS)[number];
export const THEMES = ['system', 'light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];
export const SPEECH_SPEEDS = ['normal', 'slow'] as const;
export type SpeechSpeed = (typeof SPEECH_SPEEDS)[number];
export const DAILY_GOALS = [10, 20, 30, 50] as const;

/** Sections that can't be hidden: the way back to everything else. */
export const ALWAYS_SHOWN: Section[] = ['home'];

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
  const storedLevels: Partial<Record<Language, unknown>> = value.levels ?? {};
  const levels = { ...DEFAULTS.levels };
  for (const language of LANGUAGES) {
    const level = storedLevels[language];
    if (LEVELS.includes(level as Level)) levels[language] = level as Level;
  }
  return {
    studying: studying.length ? studying : DEFAULTS.studying,
    levels,
    theme: THEMES.includes(value.theme) ? value.theme : DEFAULTS.theme,
    name: typeof value.name === 'string' ? value.name : '',
    avatar: typeof value.avatar === 'string' ? value.avatar : '',
    dailyGoal: DAILY_GOALS.includes(value.dailyGoal as (typeof DAILY_GOALS)[number])
      ? value.dailyGoal
      : DEFAULTS.dailyGoal,
    speechSpeed: SPEECH_SPEEDS.includes(value.speechSpeed) ? value.speechSpeed : 'normal',
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

/** The page reads data-theme ("light" or "dark"): the chosen theme, or the system's. */
function applyTheme(settings: Settings) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = isDark(settings) ? 'dark' : 'light';
}
applyTheme(current);
if (typeof window !== 'undefined')
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    applyTheme(current);
    // a new object, or subscribers would see the same snapshot and skip the re-render
    // (the board draws in the theme's colours)
    current = { ...current };
    listeners.forEach((listener) => listener());
  });

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
