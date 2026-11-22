import { type Word } from '../model/types';

// Pulls a "[bɔ̃ʒuʁ]" or "[бонжур]" transcription out of a string.
export function splitTranscription(source: string): { text: string; tr: string } {
  const match = source.match(/\[([^\]]+)\]/);
  if (!match || match.index === undefined) return { text: source, tr: '' };
  const text = (source.slice(0, match.index) + ' ' + source.slice(match.index + match[0].length))
    .replace(/\s+/g, ' ')
    .replace(/^[\s,;:–—-]+|[\s,;:–—-]+$/g, '');
  return { text, tr: (match[1] ?? '').trim() };
}

// Moves a transcription Claude left in fr or ru (older cached lessons) into tr.
export function withTranscription(word: Omit<Word, 'tr'> & { tr?: string }): Word {
  const frenchParts = splitTranscription(word.fr),
    russianParts = splitTranscription(word.ru);
  return {
    ...word,
    fr: frenchParts.text || word.fr,
    ru: russianParts.text,
    tr: (word.tr || '').replace(/^\[|\]$/g, '').trim() || frenchParts.tr || russianParts.tr,
  };
}
