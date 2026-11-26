import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { fetchConjugation, readConjugation, verbLanguageOf } from '@/entities/lesson';
import { type Conjugation, type VerbRef } from '@/entities/verb';
import { resolveTranslationLanguage, useSettings } from '@/shared/config';
import { type UiLanguage, useUiLanguage } from '@/shared/i18n';

type RequestState =
  | { state: 'loading' }
  | { state: 'unavailable' }
  | { state: 'error'; error: unknown; fresh: boolean };

interface Entry {
  table?: Conjugation;
  request?: RequestState;
}

// Identically spelled verbs can appear side by side in mixed-language practice.
export const verbIdentity = (verb: VerbRef) => `${verbLanguageOf(verb)}:${verb.inf.toLowerCase()}`;

const tableIdentity = (verb: VerbRef, translation: UiLanguage) =>
  `${verbIdentity(verb)}:${translation}`;

// Keeps request state and tables separate for each verb and effective translation language.
export const useVerbConjugations = (verbs: VerbRef[], hasClaude: boolean) => {
  const { translateTo } = useSettings();
  const uiLanguage = useUiLanguage();
  const translationOf = useCallback(
    (language: VerbRef['language']) =>
      resolveTranslationLanguage(translateTo, uiLanguage, language),
    [translateTo, uiLanguage]
  );
  const cached = useMemo(() => {
    const tables = new Map<string, Conjugation>();
    for (const verb of verbs) {
      const language = verbLanguageOf(verb);
      const translation = translationOf(language);
      const table = readConjugation(verb.inf, language, translation);
      if (table) tables.set(tableIdentity(verb, translation), table);
    }
    return tables;
  }, [verbs, translationOf]);

  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const pending = useRef(new Set<string>());
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const lookup = (verb: VerbRef): Entry => {
    const key = tableIdentity(verb, translationOf(verbLanguageOf(verb)));
    return { table: entries[key]?.table ?? cached.get(key), request: entries[key]?.request };
  };

  const load = useCallback(
    async (verb: VerbRef, fresh = false) => {
      const language = verbLanguageOf(verb);
      const translation = translationOf(language);
      const key = tableIdentity(verb, translation);
      if (pending.current.has(key)) return;
      const cached = entries[key]?.table ?? readConjugation(verb.inf, language, translation);
      if (!fresh && cached) {
        if (!entries[key]?.table || entries[key]?.request)
          setEntries((previous) => ({ ...previous, [key]: { table: cached } }));
        return;
      }
      if (!hasClaude) {
        setEntries((previous) => ({
          ...previous,
          [key]: { table: cached ?? undefined, request: { state: 'unavailable' } },
        }));
        return;
      }
      pending.current.add(key);
      setEntries((previous) => ({
        ...previous,
        [key]: { table: cached ?? undefined, request: { state: 'loading' } },
      }));
      try {
        const table = await fetchConjugation(verb, fresh, translation);
        if (isMounted.current) setEntries((previous) => ({ ...previous, [key]: { table } }));
      } catch (error) {
        if (isMounted.current)
          setEntries((previous) => ({
            ...previous,
            [key]: { table: cached ?? undefined, request: { state: 'error', error, fresh } },
          }));
      } finally {
        pending.current.delete(key);
      }
    },
    [entries, hasClaude, translationOf]
  );

  return { lookup, load, translationOf };
};
