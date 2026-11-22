/* The menu on a selected word: which selections it opens for, the sentence sent with the word,
   the cards Claude already wrote (kept on this device, so the same word in the same sentence is
   never asked twice), and the line a card adds to a lesson in the document. */

import { normalizeWordCard, type PhotoItem, type Word, type WordCard } from '@/entities/word';
import { getSettings, type Language, LANGUAGES } from '@/shared/config';
import { type UiLanguage } from '@/shared/i18n';
import { asFields, load, save } from '@/shared/lib/storage';
import { hash } from '@/shared/lib/util';

// the server takes up to 200 characters (MAX_SELECTION_LENGTH in api/text.ts): a phrase, not a paragraph
export const MAX_SELECTION_LENGTH = 200;
// the server takes up to 600 (MAX_CONTEXT_LENGTH in api/text.ts)
const MAX_CONTEXT_LENGTH = 500;
const CARDS_KEY = 'words:cards';
// The oldest cards are dropped beyond this many, so storage doesn't fill up.
const MAX_CARDS = 150;

// Keep in step with the width of .word-actions in styles.css.
const MENU_WIDTH = 380;
// Space between the menu and the edges of the window or the selected text, in pixels.
const GAP = 8;
// Where the menu goes under something on the screen, kept inside the window, in page coordinates.
export function menuPlace(box: DOMRect): { top: number; left: number } {
  const left = Math.max(GAP, Math.min(box.left, window.innerWidth - MENU_WIDTH - GAP));
  return { top: box.bottom + window.scrollY + GAP, left: left + window.scrollX };
}

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
/** A card's key: Russian cards keep the key they always had, so they open without Claude; a card in
    another translation language gets its own. */
export const cardKey = (selection: string, context: string, translateTo: UiLanguage) =>
  hash(`${selection.toLowerCase()}|${context}`) + (translateTo === 'ru' ? '' : ':' + translateTo);
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

/** The card Claude wrote for this selection in this sentence, in translateTo (the current setting
    when left out), checked; null when there is none. */
export function readWordCard(
  selection: string,
  context: string,
  translateTo: UiLanguage = getSettings().translateTo
): WordCard | null {
  const saved = savedCards()[cardKey(selection, context, translateTo)];
  return saved ? normalizeWordCard(saved.card, selection) : null;
}

// Keeps a card made in translateTo, dropping the oldest beyond MAX_CARDS.
export function saveWordCard(
  selection: string,
  context: string,
  card: WordCard,
  translateTo: UiLanguage
): void {
  const entries = Object.entries({
    ...savedCards(),
    [cardKey(selection, context, translateTo)]: { card, at: Date.now() },
  })
    .sort(([, a], [, b]) => b.at - a.at)
    .slice(0, MAX_CARDS);
  save(CARDS_KEY, Object.fromEntries(entries));
}

/** Opens the word menu on a word that wasn't selected: one clicked on the Text page, or typed in
    Look up a word. Its detail is a LookUp. */
export const LOOK_UP_EVENT = 'cahier:look-up';
/** Sent by the menu when it has a card for a word from a part of a page marked
    data-word-source="…" (the Text page keeps the words asked about). Its detail is a CardFound. */
export const CARD_EVENT = 'cahier:word-card';

export interface LookUp {
  text: string;
  context: string;
  language: Language;
  // where the menu goes on a wide screen, in page coordinates
  top: number;
  left: number;
  source: string | null;
}
export interface CardFound {
  card: WordCard;
  source: string;
}

// Asks the menu to open on a word.
export const lookUp = (detail: LookUp) =>
  window.dispatchEvent(new CustomEvent(LOOK_UP_EVENT, { detail }));

// A look-up from an event, checked: it comes from page code, but through the untyped DOM.
export function asLookUp(raw: unknown): LookUp | null {
  const fields = asFields(raw, {
    text: 'string',
    context: 'string',
    language: 'string',
    top: 'number',
    left: 'number',
  });
  const language = learnedLanguage(fields?.language);
  const text = cleanSelection(fields?.text ?? '');
  if (!fields || !language || !text) return null;
  const source = (raw as { source?: unknown }).source;
  return { ...fields, text, language, source: typeof source === 'string' ? source : null };
}

// The fields of a card that a list of explained words keeps (the Text page's saved notes).
export const cardNote = (card: WordCard): PhotoItem => ({
  fr: card.fr,
  context: card.context,
  ru: card.ru,
  base: card.base,
  kind: card.kind,
  tense: card.tense,
  explanation: card.explanation,
  language: card.language,
});

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
