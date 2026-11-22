import { type LessonPhonetics, normalizePhonetics } from '@/entities/lesson';
import { loadChecked } from '@/shared/lib/storage';

// Where a lesson's Phonetics reading is kept: by the lesson text's hash and the interface language.
export const phoneticsKey = (hash: string, uiLanguage: string) => `phonetics:${hash}:${uiLanguage}`;

/** The reading kept on the device (Claude's answer as it came, read the way it is read on
    arrival); null when there is none or it is broken. */
export function readPhonetics(key: string): LessonPhonetics | null {
  return loadChecked(key, (raw) => {
    try {
      return normalizePhonetics(raw);
    } catch {
      return null;
    }
  });
}
