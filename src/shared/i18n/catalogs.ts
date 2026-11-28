import { getInterfaceCatalogUrl } from 'virtual:interface-catalogs';

import { type Message, type UiLanguage } from './core';

type Dictionary = Record<string, Message>;
type LocalizedDictionary = Partial<Record<UiLanguage, Dictionary>>;

const dictionaries = new Map<string, LocalizedDictionary>();
const loadedCatalogs = new Map<UiLanguage, Map<string, Dictionary>>();
const loads = new Map<UiLanguage, Promise<void>>();

// The build replaces startup dictionaries with these stable objects before emitting the bundle.
export const getInterfaceDictionary = (key: string): LocalizedDictionary => {
  const existing = dictionaries.get(key);
  if (existing) return existing;
  const dictionary: LocalizedDictionary = {};
  for (const [language, catalog] of loadedCatalogs) {
    const messages = catalog.get(key);
    if (messages) dictionary[language] = messages;
  }
  dictionaries.set(key, dictionary);
  return dictionary;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const isDictionary = (value: unknown): value is Dictionary =>
  isObject(value) &&
  Object.values(value).every(
    (message) =>
      typeof message === 'string' ||
      (isObject(message) &&
        typeof message.other === 'string' &&
        Object.values(message).every((form) => typeof form === 'string'))
  );

const downloadCatalog = async (url: string, language: UiLanguage) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Interface catalog could not be downloaded.');
  const data: unknown = await response.json();
  if (!isObject(data)) throw new Error('Invalid interface catalog.');
  const catalog = new Map<string, Dictionary>();
  for (const [key, messages] of Object.entries(data)) {
    if (!isDictionary(messages)) throw new Error('Invalid interface dictionary.');
    catalog.set(key, messages);
  }
  const updates: [LocalizedDictionary, Dictionary][] = [];
  for (const [key, dictionary] of dictionaries) {
    const messages = catalog.get(key);
    if (!messages) throw new Error('Missing interface dictionary.');
    updates.push([dictionary, messages]);
  }
  loadedCatalogs.set(language, catalog);
  for (const [dictionary, messages] of updates) dictionary[language] = messages;
};

export const loadInterfaceCatalog = (language: UiLanguage): Promise<void> => {
  const url = getInterfaceCatalogUrl(language);
  if (!url) return Promise.resolve(); // Development uses the source dictionaries directly.
  const existing = loads.get(language);
  if (existing) return existing;
  const pending = downloadCatalog(url, language).catch((error: unknown) => {
    loads.delete(language);
    throw error;
  });
  loads.set(language, pending);
  return pending;
};
