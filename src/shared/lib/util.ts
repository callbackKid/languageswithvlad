import { type UiLanguage } from '@/shared/i18n';

// the download has started by then, so the file's address can be let go (milliseconds)
const RELEASE_AFTER = 1000;

/** A lesson's topic as shown: Claude writes it in English only, so with another interface
    language it is left out rather than shown in English. */
export const shownTopic = (topic: string, uiLanguage: UiLanguage): string =>
  uiLanguage === 'en' ? topic : '';

// A shuffled copy (Fisher–Yates).
export const shuffle = <T>(items: readonly T[]): T[] => {
  const copy = items.slice();
  for (let index = copy.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    // both positions are inside the array, so neither value is missing
    const current = copy[index] as T;
    copy[index] = copy[other] as T;
    copy[other] = current;
  }
  return copy;
};
// A short hash of a text (djb2): the key of a lesson's cached analysis.
export const hash = (text: string): string => {
  let digest = 5381;
  for (let index = 0; index < text.length; index++)
    digest = ((digest << 5) + digest + text.charCodeAt(index)) | 0;
  return (digest >>> 0).toString(36);
};
// A string from outside data, trimmed; "" for anything else.
export const asText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

/** Keeps "levé(e)(s)" on one line: browsers may break before "(", so a word joiner (U+2060) glues it
    to the letter before. For display only; grading and speech use the plain form. */
export const keepBracketsTogether = (text: string): string => text.replace(/(\S)\(/g, '$1⁠(');

// Saves text as a file in the browser's downloads.
export const downloadText = (filename: string, text: string, type = 'text/plain') => {
  const url = URL.createObjectURL(new Blob([text], { type: type + ';charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), RELEASE_AFTER);
};
