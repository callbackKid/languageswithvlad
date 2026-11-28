import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { type Conjugation, normalizeConjugation, type VerbRef } from '@/entities/verb/@x/lesson';
import { type Pair, type Word, wordKey } from '@/entities/word/@x/lesson';
import { api } from '@/shared/api';
import {
  getSettings,
  isVerbLanguage,
  type Language,
  translationLanguage,
  useSettings,
  type VerbLanguage,
} from '@/shared/config';
import { type UiLanguage } from '@/shared/i18n';
import { loadChecked, save } from '@/shared/lib/storage';

import { languageOfLesson, localParse, markKeyWords } from '../lib/document';
import { normalizeAnalysis } from './normalize';
import { getRemoved, useRemoved, withoutRemoved } from './removed';
import { type Analysis, type Lesson } from './types';

// Only the newest lessons are prepared on their own; older ones wait until the student opens them.
export const AUTO_PREPARE = 1;

/** v2: analyses know the lesson's language; v1 entries treated English lessons as French.
    Translations in Russian keep the key they always had, so nobody pays for a lesson again;
    another translation language gets its own. */
export const analysisKey = (hash: string, translateTo: UiLanguage) =>
  'an2:' + hash + (translateTo === 'ru' ? '' : ':' + translateTo);
/** French tables keep the key they always had; another language gets its own, so verbs spelled
    alike in two languages never share a table. translation is the language of the table's ru
    (already resolved: a French verb is never translated into French); Russian adds nothing. */
export const conjugationKey = (
  infinitive: string,
  language: VerbLanguage,
  translation: UiLanguage
) =>
  (language === 'fr' ? 'conj:' : `conj:${language}:`) +
  infinitive.toLowerCase() +
  (translation === 'ru' ? '' : ':' + translation);

// The language of a verb's tables: its lesson's, French for a verb saved before others had any.
export const verbLanguageOf = (verb: VerbRef): VerbLanguage =>
  isVerbLanguage(verb.language) ? verb.language : 'fr';

/** Cached analysis with translations in translateTo (the current setting when left out), with
    transcriptions moved out of older entries. */
export const readAnalysis = (
  hash: string,
  translateTo: UiLanguage = getSettings().translateTo
): Analysis | null => {
  // the same check as Claude's answer, which also moves old transcriptions out (withTranscription)
  return loadChecked(analysisKey(hash, translateTo), normalizeAnalysis);
};

/** The language a prepared lesson teaches. It doesn't depend on the translation language, so a
    lesson not yet prepared in the current one still has it from its Russian analysis. */
export const readLessonLanguage = (hash: string): Language | null =>
  (readAnalysis(hash) ?? readAnalysis(hash, 'ru'))?.language ?? null;

/** Cached conjugation, translated into the current translation language. Older French entries get
    their language set and their reflexive pronouns moved out of the person. */
export const readConjugation = (
  infinitive: string,
  language: VerbLanguage,
  translation: UiLanguage = translationLanguage(language)
): Conjugation | null => {
  // the same check as Claude's answer: it sets the language and moves reflexive pronouns
  return loadChecked(conjugationKey(infinitive, language, translation), (raw) =>
    normalizeConjugation(raw, infinitive, language)
  );
};

/** A verb's tables: the saved ones, or (fresh, or none saved) Claude's, which are then saved.
    Throws when Claude's answer can't be used. */
export const fetchConjugation = async (
  verb: VerbRef,
  fresh = false,
  translation: UiLanguage = translationLanguage(verbLanguageOf(verb))
): Promise<Conjugation> => {
  const language = verbLanguageOf(verb);
  const cached = fresh ? null : readConjugation(verb.inf, language, translation);
  if (cached) return cached;
  const conjugation = normalizeConjugation(
    await api.conjugate(verb.inf, verb.ru, language, translation, fresh),
    verb.inf,
    language
  );
  save(conjugationKey(verb.inf, language, translation), conjugation);
  return conjugation;
};

export interface LessonInfo {
  key: string;
  n: number;
  word: Lesson['word'];
  topic: string;
  ready: boolean;
}
export type BankVerb = VerbRef & { lesson: string };
export type BankPair = Pair & { lesson: string };
type LessonVocabulary = Pick<Analysis, 'language' | 'words' | 'verbs'>;
type BankVocabulary = { words: Word[]; verbs: BankVerb[] };

// Keep the newest occurrence within the lessons being practised.
const collectVocabulary = (
  lessons: ReadonlyMap<string, LessonVocabulary>,
  selected?: ReadonlySet<string>
): BankVocabulary => {
  const words: Word[] = [];
  const verbs: BankVerb[] = [];
  const seenWords = new Set<string>();
  const seenVerbs = new Set<string>();
  for (const [lesson, { language, words: lessonWords, verbs: lessonVerbs }] of lessons) {
    if (selected && !selected.has(lesson)) continue;
    // The same spelling can occur in different languages.
    for (const word of lessonWords) {
      const identity = `${language}:${wordKey(word.fr)}`;
      if (!seenWords.has(identity)) {
        seenWords.add(identity);
        words.push({ ...word, lesson, language });
      }
    }
    for (const verb of lessonVerbs) {
      const identity = `${language}:${verb.inf.toLowerCase()}`;
      if (!seenVerbs.has(identity)) {
        seenVerbs.add(identity);
        verbs.push({ ...verb, lesson, language });
      }
    }
  }
  return { words, verbs };
};

export interface Bank {
  words: Word[];
  pairs: BankPair[];
  verbs: BankVerb[];
  // Deduplicate within the selected lessons so older occurrences can be practised on their own.
  selectVocabulary: (lessons: ReadonlySet<string>) => BankVocabulary;
  lessons: LessonInfo[];
  // newest lessons still being prepared by Claude
  pending: number;
  failed: number;
  // older lessons not prepared yet, left until the student opens them
  waiting: number;
  // Only analyses for the currently shown lesson revision and translation language enter the bank.
  put: (lesson: Pick<Lesson, 'key' | 'hash'>, analysis: Analysis, translateTo: UiLanguage) => void;
}

// Every prepared lesson's words, verbs and pairs, newest lesson first. The newest lessons are prepared one at a time if missing.
export const useBank = (lessons: Lesson[], hasClaude: boolean): Bank => {
  const { studying, translateTo } = useSettings();
  const [analyses, setAnalyses] = useState<Record<string, Analysis>>({});
  // The words of a newest lesson the teacher has just edited, kept from before the edit while
  // Claude reads it again, so they don't drop out of the exercises for those seconds (during a
  // lesson the document is read every minute).
  const [stale, setStale] = useState<Record<string, Analysis>>({});
  const shown = useMemo(() => ({ ...stale, ...analyses }), [stale, analyses]);
  const latestShown = useRef(shown);
  useEffect(() => {
    latestShown.current = shown;
  }, [shown]);
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const [tick, setTick] = useState(0);
  const busy = useRef(false);
  // Bumped when the document changes, so answers for the old one are dropped.
  const generation = useRef(0);
  const currentLessons = useRef(lessons);
  useLayoutEffect(() => {
    currentLessons.current = lessons;
  }, [lessons]);

  // The translation language of the analyses shown, so a switch keeps no words in the old one.
  const shownLanguage = useRef(translateTo);

  // Pick up cached lessons whenever the document or the translation language changes.
  useEffect(() => {
    generation.current++;
    const isSameLanguage = shownLanguage.current === translateTo;
    shownLanguage.current = translateTo;
    const out: Record<string, Analysis> = {};
    const kept: Record<string, Analysis> = {};
    const auto = new Set(lessons.slice(-AUTO_PREPARE).map((lesson) => lesson.key));
    for (const lesson of lessons) {
      const analysis =
        readAnalysis(lesson.hash, translateTo) ||
        (hasClaude ? null : localParse(lesson.body, languageOfLesson(lesson)));
      const before = latestShown.current[lesson.key];
      if (analysis) out[lesson.key] = analysis;
      // only lessons that are prepared again right away, in the language they were in
      else if (hasClaude && isSameLanguage && auto.has(lesson.key) && before)
        kept[lesson.key] = before;
    }
    setAnalyses(out);
    setStale(kept);
    setFailed(new Set());
  }, [lessons, hasClaude, translateTo]);

  useEffect(() => {
    if (!hasClaude || busy.current) return;
    // Check the cache too: on load this runs before the cached lessons reach state.
    const next = lessons
      .slice(-AUTO_PREPARE)
      .reverse()
      .find(
        (lesson) =>
          !analyses[lesson.key] &&
          !failed.has(lesson.key) &&
          !readAnalysis(lesson.hash, translateTo)
      );
    if (!next) return;
    busy.current = true;
    const requestGeneration = generation.current;
    api
      .analyze(next.body)
      .then((raw) => {
        const analysis = normalizeAnalysis(raw);
        // the language the request was made in, even if the setting changed meanwhile
        const cached = readAnalysis(next.hash, translateTo);
        if (!cached) save(analysisKey(next.hash, translateTo), analysis);
        if (requestGeneration === generation.current)
          setAnalyses((previous) =>
            previous[next.key] ? previous : { ...previous, [next.key]: cached ?? analysis }
          );
      })
      .catch(() => {
        if (requestGeneration === generation.current)
          setFailed((previous) => new Set(previous).add(next.key));
      })
      .finally(() => {
        busy.current = false;
        setTick((previous) => previous + 1);
      });
  }, [lessons, hasClaude, analyses, failed, tick, translateTo]);

  const put = useCallback(
    ({ key, hash }: Pick<Lesson, 'key' | 'hash'>, analysis: Analysis, askedIn: UiLanguage) => {
      if (askedIn !== getSettings().translateTo) return;
      if (!currentLessons.current.some((lesson) => lesson.key === key && lesson.hash === hash))
        return;
      setAnalyses((previous) => ({ ...previous, [key]: analysis }));
    },
    []
  );

  const removed = useRemoved();
  return useMemo(() => {
    const vocabulary = new Map<string, LessonVocabulary>();
    const pairs: BankPair[] = [];
    const lessonInfos: LessonInfo[] = [];
    for (const lesson of [...lessons].reverse()) {
      const prepared = shown[lesson.key];
      // without the words the student took out of the lesson
      const analysis = prepared && withoutRemoved(prepared, lesson.key, removed);
      // lessons in languages the student doesn't learn stay out of practice (Settings)
      if (analysis && !studying.includes(analysis.language)) continue;
      lessonInfos.push({
        key: lesson.key,
        n: lesson.n,
        word: lesson.word,
        topic: analysis?.topic || '',
        ready: !!analysis,
      });
      if (!analysis) continue;
      vocabulary.set(lesson.key, {
        language: analysis.language,
        words: markKeyWords(analysis.words, lesson.body),
        verbs: analysis.verbs,
      });
      pairs.push(...analysis.pairs.map((pair) => ({ ...pair, lesson: lesson.key })));
    }
    const auto = new Set(lessons.slice(-AUTO_PREPARE).map((lesson) => lesson.key));
    const missing = lessons.filter((lesson) => !analyses[lesson.key] && !failed.has(lesson.key));
    const pending = hasClaude ? missing.filter((lesson) => auto.has(lesson.key)).length : 0;
    const waiting = hasClaude ? missing.length - pending : 0;
    return {
      ...collectVocabulary(vocabulary),
      pairs,
      selectVocabulary: (selected) => collectVocabulary(vocabulary, selected),
      lessons: lessonInfos,
      pending,
      failed: failed.size,
      waiting,
      put,
    };
  }, [lessons, analyses, shown, failed, hasClaude, put, studying, removed]);
};

/** Only the newest lesson is prepared by itself (AUTO_PREPARE). An older one a page needs (the
    warm-up's previous lesson, "mots de la leçon 5" in the homework) is prepared here if this
    device doesn't have it yet. True while Claude is reading it. */
export const usePreparedLesson = (
  lesson: Lesson | null,
  bank: Bank,
  hasClaude: boolean
): boolean => {
  const { translateTo } = useSettings();
  const ready =
    !lesson ||
    bank.lessons.some((info) => info.key === lesson.key && info.ready) ||
    !!readAnalysis(lesson.hash, translateTo);
  const [preparing, setPreparing] = useState(false);
  const { put } = bank;
  useEffect(() => {
    if (!lesson || ready || !hasClaude) return;
    let alive = true;
    setPreparing(true);
    api
      .analyze(lesson.body)
      .then((raw) => {
        const analysis = normalizeAnalysis(raw);
        const cached = readAnalysis(lesson.hash, translateTo);
        if (!cached) save(analysisKey(lesson.hash, translateTo), analysis);
        if (alive) put(lesson, cached ?? analysis, translateTo);
      })
      // the warm-up then asks about the mistakes alone
      .catch(() => {})
      .finally(() => {
        if (alive) setPreparing(false);
      });
    return () => {
      alive = false;
    };
  }, [lesson, ready, hasClaude, put, translateTo]);
  return preparing;
};

/** One lesson's own words, with their lesson and language, key words (★) marked, without those
    the student took out. The bank keeps a word under the newest lesson that has it, so this reads
    the lesson's analysis instead. */
export const lessonWords = (lesson: Lesson, bank: Bank, hasClaude: boolean): Word[] => {
  const prepared =
    readAnalysis(lesson.hash) ??
    (hasClaude ? null : localParse(lesson.body, languageOfLesson(lesson)));
  if (!prepared) return bank.words.filter((word) => word.lesson === lesson.key);
  const analysis = withoutRemoved(prepared, lesson.key, getRemoved());
  return markKeyWords(analysis.words, lesson.body).map((word) => ({
    ...word,
    lesson: lesson.key,
    language: analysis.language,
  }));
};
