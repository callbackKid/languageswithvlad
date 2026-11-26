import { type PhotoItem, photoItem } from '@/entities/word';
import { asLanguage } from '@/shared/config';
import { asArray, asObject } from '@/shared/lib/json';

// The underlined words Claude read on a photo, all in the book's language.
export const normalizePhoto = (raw: unknown): PhotoItem[] => {
  const data = asObject(raw);
  const language = asLanguage(data.language);
  return asArray(data.items)
    .map((item) => photoItem(item, language))
    .filter((item) => item.fr);
};

// The words of several photos as one list, in photo order; a word marked on two pages comes once.
export const mergePhotoItems = (scans: PhotoItem[][]): PhotoItem[] => {
  const seen = new Set<string>();
  return scans.flat().filter((item) => {
    const key = `${item.language ?? 'fr'}:${(item.base || item.fr).toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
