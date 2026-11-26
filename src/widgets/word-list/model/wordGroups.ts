import { useEffect, useRef, useState } from 'react';

import { type Word } from '@/entities/word';
import { api } from '@/shared/api';
import { type UiLanguage } from '@/shared/i18n';
import { loadChecked, save } from '@/shared/lib/storage';

import { normalizeWordGroups } from './normalize';

/* Words sorted into groups by meaning (Food, Time and dates…) for the word lists of a lesson and
   of Words to learn. Claude names the groups in the interface language. Each word's group is kept
   on the device, per interface language, so a word is sent only once and a new word joins the
   groups already there. "" marks a word Claude left out, so it isn't sent again. */

// words sent in one request (keep in step with MAX_GROUP_WORDS in api/analyze.ts)
const MAX_GROUP_WORDS = 60;

// "fr:le pain" → "Food"
type GroupStore = Record<string, string>;

const storageKey = (uiLanguage: UiLanguage) => 'word-groups:' + uiLanguage;

const asGroupStore = (raw: unknown): GroupStore | null => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  return Object.fromEntries(
    Object.entries(raw).filter((entry): entry is [string, string] => typeof entry[1] === 'string')
  );
};

const loadGroups = (uiLanguage: UiLanguage): GroupStore =>
  loadChecked(storageKey(uiLanguage), asGroupStore) ?? {};

// A word's place in the store: the same spelling in two languages may mean different things.
const groupKey = (word: Word) => `${word.language ?? 'fr'}:${word.fr}`;

export interface WordGroup {
  // "" for the words in no group
  name: string;
  words: Word[];
}

// The words in their groups: the biggest group first, the words in no group last.
export const groupWords = (words: Word[], groupOf: (word: Word) => string): WordGroup[] => {
  const byName = new Map<string, Word[]>();
  for (const word of words) {
    const name = groupOf(word);
    byName.set(name, [...(byName.get(name) ?? []), word]);
  }
  return [...byName]
    .map(([name, groupWords]) => ({ name, words: groupWords }))
    .sort(
      (a, b) =>
        Number(a.name === '') - Number(b.name === '') ||
        b.words.length - a.words.length ||
        a.name.localeCompare(b.name)
    );
};

export type GroupingState = 'ready' | 'loading' | 'error';

/** The group of each word, asking Claude about the words not grouped yet (60 at a time) while
    enabled. groupOf gives "" for a word in no group, or one still waiting for its group. */
export const useWordGroups = (words: Word[], enabled: boolean, uiLanguage: UiLanguage) => {
  const [stored, setStored] = useState(() => ({ uiLanguage, groups: loadGroups(uiLanguage) }));
  // a new interface language has its own names
  const groups = stored.uiLanguage === uiLanguage ? stored.groups : loadGroups(uiLanguage);
  // the request that failed, so it isn't sent again until Try again
  const [failed, setFailed] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  // read when a request starts, so a new array of the same words doesn't start another
  const latestWords = useRef(words);
  useEffect(() => {
    latestWords.current = words;
  });

  const missing = enabled
    ? words.filter((word) => !Object.hasOwn(groups, groupKey(word))).slice(0, MAX_GROUP_WORDS)
    : [];
  const requestKey = missing.map(groupKey).join('\n');

  useEffect(() => {
    if (!requestKey) return;
    const wanted = new Set(requestKey.split('\n'));
    const batch = latestWords.current.filter((word) => wanted.has(groupKey(word)));
    // the names already in use, so the same topic keeps one name across lessons
    const known = [...new Set(Object.values(loadGroups(uiLanguage)).filter(Boolean))];
    let alive = true;
    api
      .wordGroups(
        batch.map((word) => ({ fr: word.fr, ru: word.ru })),
        known,
        uiLanguage
      )
      .then((raw) => {
        const found = normalizeWordGroups(
          raw,
          batch.map((word) => word.fr)
        );
        const updated = { ...loadGroups(uiLanguage) };
        for (const word of batch) updated[groupKey(word)] = found.get(word.fr) ?? '';
        // kept even if the page has changed meanwhile: the answer is paid for
        save(storageKey(uiLanguage), updated);
        if (alive) setStored({ uiLanguage, groups: updated });
      })
      .catch(() => {
        if (alive) setFailed(requestKey);
      });
    return () => {
      alive = false;
    };
  }, [requestKey, uiLanguage, attempt]);

  let state: GroupingState = 'ready';
  if (requestKey) state = failed === requestKey ? 'error' : 'loading';
  return {
    groupOf: (word: Word) => groups[groupKey(word)] ?? '',
    state,
    retry: () => {
      setFailed(null);
      setAttempt((previous) => previous + 1);
    },
  };
};
