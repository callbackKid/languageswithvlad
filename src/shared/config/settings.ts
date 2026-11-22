import { useSyncExternalStore } from 'react';

import { getUiLanguage, UI_LANGUAGES, type UiLanguage } from '@/shared/i18n';
import { hasSavedKey, load, save } from '@/shared/lib/storage';

import {
  type Language,
  LANGUAGES,
  type Tense,
  TENSES_BY_LANGUAGE,
  VERB_LANGUAGES,
  type VerbLanguage,
} from './languages';
import { type Section } from './routes';

/* The student's settings, saved in this browser. The interface language has its own store
   (src/shared/i18n/core.tsx); everything else lives here. */

export const LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type Level = (typeof LEVELS)[number];
export const THEMES = ['system', 'light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];
export const SPEECH_SPEEDS = ['normal', 'slow'] as const;
export type SpeechSpeed = (typeof SPEECH_SPEEDS)[number];
export const DAILY_GOALS = [10, 20, 30, 50] as const;

// Sections that can't be hidden: the way back to everything else.
export const ALWAYS_SHOWN: Section[] = ['home'];

// The tabs of a lesson page, in their order.
export const LESSON_TABS = [
  'words',
  'verbs',
  'grammar',
  'phonetics',
  'homework',
  'book',
  'notes',
  'source',
] as const;
export type LessonTab = (typeof LESSON_TABS)[number];

export interface Settings {
  // the languages the student learns; exercises and Discuss only offer these
  studying: Language[];
  // the student's level in each language, the default for Discuss and exercise sentences
  levels: Record<Language, Level>;
  theme: Theme;
  name: string;
  // a small square picture as a data: URL, or ""
  avatar: string;
  // answers a day for the 🔥 streak's daily goal
  dailyGoal: number;
  speechSpeed: SpeechSpeed;
  // sections taken out of the menu (their addresses still work)
  hidden: Section[];
  // tabs taken off the lesson page; at least one always stays
  hiddenTabs: LessonTab[];
  // the tenses quizzes ask, ticked by hand; a language missing here follows its level
  tenses: Partial<Record<VerbLanguage, Tense[]>>;
  // the language Claude writes word and sentence translations in; Russian for anyone who used the
  // app before it could be chosen
  translateTo: UiLanguage;
}

const DEFAULTS: Settings = {
  studying: [...LANGUAGES],
  levels: { fr: 'A2', en: 'A2', de: 'A2', es: 'A2', pt: 'A2', it: 'A2' },
  theme: 'system',
  name: '',
  avatar: '',
  dailyGoal: 20,
  speechSpeed: 'normal',
  hidden: [],
  hiddenTabs: [],
  tenses: {},
  translateTo: 'ru',
};
const KEY = 'settings';

/** The translation language of someone without one saved: Russian when they used the app before
    it could be chosen (their lessons are prepared in Russian), their interface language otherwise. */
export const defaultTranslateTo = (hasHistory: boolean, uiLanguage: UiLanguage): UiLanguage =>
  hasHistory ? 'ru' : uiLanguage;

const isUiLanguage = (value: unknown): value is UiLanguage =>
  UI_LANGUAGES.some((language) => language.id === value);

/** Older or hand-edited values never break the app: anything unknown falls back to the default.
    missingTranslateTo is used when no valid translation language is saved. */
function sanitize(raw: Partial<Settings> | null, missingTranslateTo: UiLanguage): Settings {
  const value = { ...DEFAULTS, ...raw };
  const studying = (Array.isArray(value.studying) ? value.studying : []).filter((language) =>
    LANGUAGES.includes(language)
  );
  const hiddenTabs = (Array.isArray(value.hiddenTabs) ? value.hiddenTabs : []).filter((tab) =>
    LESSON_TABS.includes(tab)
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
    hiddenTabs: hiddenTabs.length < LESSON_TABS.length ? hiddenTabs : [],
    tenses: sanitizeTenses(value.tenses),
    translateTo: isUiLanguage(raw?.translateTo) ? raw.translateTo : missingTranslateTo,
  };
}

// Only known tenses of each language, and never an empty list (that language then follows its level).
function sanitizeTenses(raw: unknown): Settings['tenses'] {
  const stored: Partial<Record<string, unknown>> = raw && typeof raw === 'object' ? raw : {};
  const tenses: Settings['tenses'] = {};
  for (const language of VERB_LANGUAGES) {
    const list = stored[language];
    const all: readonly Tense[] = TENSES_BY_LANGUAGE[language];
    const kept = Array.isArray(list) ? all.filter((tense) => list.includes(tense)) : [];
    if (kept.length) tenses[language] = kept;
  }
  return tenses;
}

const stored = load<Partial<Settings>>(KEY);
let current = sanitize(
  stored,
  defaultTranslateTo(stored !== null || hasSavedKey('an2:'), getUiLanguage())
);
// decided once: a new student's first lesson saves an an2: key, which must not make them "existing"
// on the next visit
if (stored?.translateTo !== current.translateTo) save(KEY, current);
const listeners = new Set<() => void>();

const prefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

// The theme actually shown, after "system" is resolved.
export const isDark = (settings: Settings = current) =>
  settings.theme === 'dark' || (settings.theme === 'system' && prefersDark());

// The browser bar and the phone's status bar take the page background (--bg in styles.css).
const THEME_COLOR = { light: '#ffffff', dark: '#191919' } as const;

// The page reads data-theme ("light" or "dark"): the chosen theme, or the system's.
function applyTheme(settings: Settings) {
  if (typeof document === 'undefined') return;
  const theme = isDark(settings) ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
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

// The settings, for code outside React.
export const getSettings = () => current;

// Changes some settings, saves them and applies the theme.
export function updateSettings(changes: Partial<Settings>) {
  current = sanitize({ ...current, ...changes }, current.translateTo);
  save(KEY, current);
  applyTheme(current);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
// The settings; the component re-renders when they change.
export const useSettings = () => useSyncExternalStore(subscribe, getSettings, getSettings);

// Whether a word in this language should appear in exercises.
export const isStudied = (language: Language | undefined, settings: Settings = current) =>
  settings.studying.includes(language ?? 'fr');
