import { getUiLanguage, type UiLanguage, useUiLanguage } from '@/shared/i18n';

import { type Language } from './languages';
import { getSettings, useSettings } from './settings';

/* Which language a translation is written in: the one chosen in Settings, unless that is the
   language of the word itself (a French word isn't "translated" into French). */

/** The language a translation goes into when the chosen one is the word's own language: the
    interface language, or, when that is the same too, English (Russian for a learner of English). */
export function translationFallback(translateTo: UiLanguage, uiLanguage: UiLanguage): UiLanguage {
  if (uiLanguage !== translateTo) return uiLanguage;
  return translateTo === 'en' ? 'ru' : 'en';
}

// The language translations of a word in `learned` are written in; learned is left out when unknown.
export function resolveTranslationLanguage(
  translateTo: UiLanguage,
  uiLanguage: UiLanguage,
  learned?: Language
): UiLanguage {
  return translateTo === learned ? translationFallback(translateTo, uiLanguage) : translateTo;
}

/** The fields of a request in which Claude finds out the language itself (a lesson, a photo, a
    text): the translation language and the one to use for a text in that very language. */
export function translationFields(translateTo: UiLanguage = getSettings().translateTo): {
  translateTo: UiLanguage;
  translateFallback: UiLanguage;
} {
  return { translateTo, translateFallback: translationFallback(translateTo, getUiLanguage()) };
}

// resolveTranslationLanguage with the current settings, for code outside React.
export const translationLanguage = (learned?: Language): UiLanguage =>
  resolveTranslationLanguage(getSettings().translateTo, getUiLanguage(), learned);

/** The translation language for each learned language, as a function, so a list can resolve it
    per word; the component re-renders when the setting or the interface language changes. */
export function useTranslationLanguage(): (learned?: Language) => UiLanguage {
  const { translateTo } = useSettings();
  const uiLanguage = useUiLanguage();
  return (learned) => resolveTranslationLanguage(translateTo, uiLanguage, learned);
}
