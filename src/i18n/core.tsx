import { Fragment, type ReactNode, useSyncExternalStore } from 'react';

import { load, save } from '../lib/storage';

// The language of the interface (buttons, hints, the Tutorial). Translations of words stay Russian.
export type UiLanguage = 'en' | 'ru' | 'fr' | 'de' | 'es' | 'pt' | 'it';
export const UI_LANGUAGES: { id: UiLanguage; name: string; flag: string }[] = [
  { id: 'en', name: 'English', flag: '🇬🇧' },
  { id: 'ru', name: 'Русский', flag: '🇷🇺' },
  { id: 'fr', name: 'Français', flag: '🇫🇷' },
  { id: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { id: 'es', name: 'Español', flag: '🇪🇸' },
  { id: 'pt', name: 'Português', flag: '🇵🇹' },
  { id: 'it', name: 'Italiano', flag: '🇮🇹' },
];
// For dates, numbers and plural rules.
export const LOCALES: Record<UiLanguage, string> = {
  en: 'en-GB',
  ru: 'ru-RU',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
  pt: 'pt-PT',
  it: 'it-IT',
};

// A text, or its plural forms picked by {count}: "1 lesson", "2 урока", "5 уроков".
export type Message = string | PluralMessage;
export interface PluralMessage {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}
export type Params = Record<string, string | number>;

/* The chosen language lives here and in the browser, so every component sees the same one
   and changing it re-renders them all. */
const STORAGE_KEY = 'ui-language';
const isUiLanguage = (value: unknown): value is UiLanguage =>
  UI_LANGUAGES.some((language) => language.id === value);

// The browser's language when the app supports it, English otherwise.
function browserLanguage(): UiLanguage {
  const preferred = typeof navigator === 'undefined' ? [] : navigator.languages || [];
  for (const tag of preferred) {
    const code = tag.slice(0, 2).toLowerCase();
    if (isUiLanguage(code)) return code;
  }
  return 'en';
}

let current: UiLanguage = (() => {
  const saved = load<string>(STORAGE_KEY);
  return isUiLanguage(saved) ? saved : browserLanguage();
})();
const listeners = new Set<() => void>();
if (typeof document !== 'undefined') document.documentElement.lang = current;

// Changes the interface language everywhere and keeps the choice on this device.
export function setUiLanguage(language: UiLanguage) {
  current = language;
  save(STORAGE_KEY, language);
  document.documentElement.lang = language;
  listeners.forEach((listener) => listener());
}
// The interface language, for code outside React.
export const getUiLanguage = () => current;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
// The interface language; the component re-renders when it changes.
export const useUiLanguage = () => useSyncExternalStore(subscribe, getUiLanguage, getUiLanguage);

/**
 * One area's texts in every language. English is the reference: the other languages must have
 * exactly its keys, so a missing translation is a type error.
 */
export function defineMessages<Keys extends string>(
  messages: { en: Record<Keys, Message> } & Record<Exclude<UiLanguage, 'en'>, Record<Keys, Message>>
) {
  return messages;
}
type Messages<Keys extends string> = Record<UiLanguage, Record<Keys, Message>>;

const pluralRules = new Map<UiLanguage, Intl.PluralRules>();
function pickForm(message: Message | undefined, language: UiLanguage, params?: Params): string {
  // a key missing from the dictionaries shows as nothing rather than breaking the page
  if (message === undefined) return '';
  if (typeof message === 'string') return message;
  const count = Number(params?.count ?? 0);
  let rules = pluralRules.get(language);
  if (!rules) {
    rules = new Intl.PluralRules(LOCALES[language]);
    pluralRules.set(language, rules);
  }
  return message[rules.select(count)] ?? message.other;
}

const fill = (text: string, params?: Params) =>
  params
    ? text.replace(/\{([\p{L}\p{N}_]+)\}/gu, (whole, name: string) => String(params[name] ?? whole))
    : text;

// A text with <b>tags</b> and {placeholders} turned into React: tags by the renderers, placeholders by values.
function richText(
  text: string,
  tags: Record<string, (chunk: ReactNode) => ReactNode>,
  values: Record<string, ReactNode>
): ReactNode {
  const parts: ReactNode[] = [];
  // placeholder names may use any letters: {leçon}
  const pattern = /<(\w+)>([\s\S]*?)<\/\1>|<(\w+)\/>|\{([\p{L}\p{N}_]+)\}/gu;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const [whole, tag, inner = '', selfClosing, name] = match;
    if (tag) {
      const render = tags[tag];
      const content = richText(inner, {}, values);
      parts.push(render ? render(content) : content);
    } else if (selfClosing) {
      parts.push(tags[selfClosing]?.(null) ?? null);
    } else if (name) {
      parts.push(name in values ? values[name] : whole);
    }
    last = match.index + whole.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.map((part, index) => <Fragment key={index}>{part}</Fragment>);
}

export interface Translator<Keys extends string> {
  // the plain text, with {placeholders} filled in
  t: (key: Keys, params?: Params) => string;
  // the text as React, for <b>bold</b>, links and other markup inside it
  rich: (
    key: Keys,
    tags?: Record<string, (chunk: ReactNode) => ReactNode>,
    values?: Record<string, ReactNode>
  ) => ReactNode;
  language: UiLanguage;
  locale: string;
}

// One translator per dictionary and language, so t and rich keep their identity between
// renders and are safe in dependency lists.
const translators = new WeakMap<object, Partial<Record<UiLanguage, Translator<string>>>>();

// One area's texts in a language, for code outside React; components use useTranslation.
export function translator<Keys extends string>(
  messages: Messages<Keys>,
  language: UiLanguage = current
): Translator<Keys> {
  let byLanguage = translators.get(messages);
  if (!byLanguage) {
    byLanguage = {};
    translators.set(messages, byLanguage);
  }
  const cached = byLanguage[language];
  if (cached) return cached as Translator<Keys>;

  const text = (key: Keys, params?: Params) =>
    pickForm(messages[language][key] ?? messages.en[key], language, params);
  const created: Translator<Keys> = {
    t: (key, params) => fill(text(key, params), params),
    rich: (key, tags = {}, values = {}) => {
      const count = values.count;
      return richText(text(key, typeof count === 'number' ? { count } : undefined), tags, values);
    },
    language,
    locale: LOCALES[language],
  };
  byLanguage[language] = created as Translator<string>;
  return created;
}

// The texts of one area in the chosen language; the component re-renders when it changes.
export function useTranslation<Keys extends string>(messages: Messages<Keys>): Translator<Keys> {
  return translator(messages, useUiLanguage());
}
