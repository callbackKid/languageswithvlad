/* The menu on a selected word: which selections it opens for, the sentence sent with the word,
   the cards Claude already wrote (kept on this device, so the same word in the same sentence is
   never asked twice), and the line a card adds to a lesson in the document. */

import { normalizeWordCard } from './parse';
import { asFields, load, save } from './storage';
import { type Language, LANGUAGES, type PhotoItem, type Word, type WordCard } from './types';
import { hash } from './util';

// the server takes up to 200 characters (MAX_SELECTION_LENGTH in api/text.ts): a phrase, not a paragraph
export const MAX_SELECTION_LENGTH = 200;
// the server takes up to 600 (MAX_CONTEXT_LENGTH in api/text.ts)
const MAX_CONTEXT_LENGTH = 500;
const CARDS_KEY = 'words:cards';
// The oldest cards are dropped beyond this many, so storage doesn't fill up.
const MAX_CARDS = 150;

// The sentence of the paragraph that holds the selection; the paragraph's start when it spans several.
export function sentenceAround(paragraph: string, selection: string): string {
  const sentences = paragraph.split(/(?<=[.!?…»"])\s+/);
  const found = sentences.find((sentence) => sentence.includes(selection));
  return (found ?? paragraph).slice(0, MAX_CONTEXT_LENGTH);
}

// What was selected, on one line and without the punctuation around it; "" when it holds no letter.
export function cleanSelection(raw: string): string {
  const text = raw
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
  return /\p{L}/u.test(text) && text.length <= MAX_SELECTION_LENGTH ? text : '';
}

// The language a lang attribute names, when it is one the app teaches (not Russian, not the interface's).
export const learnedLanguage = (lang: string | null | undefined): Language | null =>
  LANGUAGES.find((language) => language === lang?.toLowerCase()) ?? null;

interface SavedCard {
  card: unknown;
  at: number;
}
const cardKey = (selection: string, context: string) =>
  hash(`${selection.toLowerCase()}|${context}`);
// The saved cards by key; an entry without its time is dropped (its card is checked when read).
function savedCards(): Record<string, SavedCard> {
  const raw = load<unknown>(CARDS_KEY);
  const entries = raw && typeof raw === 'object' ? Object.entries(raw) : [];
  return Object.fromEntries(
    entries.flatMap(([key, entry]) => {
      const fields = asFields(entry, { at: 'number' });
      return fields ? [[key, { card: (entry as { card?: unknown }).card, at: fields.at }]] : [];
    })
  );
}

// The card Claude wrote for this selection in this sentence, checked; null when there is none.
export function readWordCard(selection: string, context: string): WordCard | null {
  const saved = savedCards()[cardKey(selection, context)];
  return saved ? normalizeWordCard(saved.card, selection) : null;
}

// Keeps a card, dropping the oldest beyond MAX_CARDS.
export function saveWordCard(selection: string, context: string, card: WordCard): void {
  const entries = Object.entries({
    ...savedCards(),
    [cardKey(selection, context)]: { card, at: Date.now() },
  })
    .sort(([, a], [, b]) => b.at - a.at)
    .slice(0, MAX_CARDS);
  save(CARDS_KEY, Object.fromEntries(entries));
}

// "avoir raison — был прав (avait raison, imparfait, il)": one line of a lesson in the document.
export function docLine(item: PhotoItem): string {
  const notes = [item.base && item.base !== item.fr ? item.fr : '', item.tense]
    .filter(Boolean)
    .join(', ');
  return `${item.base || item.fr} — ${item.ru}${notes ? ` (${notes})` : ''}`;
}

// The card as a word for Words to learn: its dictionary form with that form's translation.
export const cardWord = (card: WordCard): Word => ({
  fr: card.base || card.fr,
  ru: card.baseRu,
  kind: card.kind,
  added: false,
  tr: '',
  language: card.language,
});
