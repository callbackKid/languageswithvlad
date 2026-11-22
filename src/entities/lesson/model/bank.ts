import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { type Conjugation, normalizeConjugation, type VerbRef } from '@/entities/verb/@x/lesson';
import { type Pair, type Word, wordKey } from '@/entities/word/@x/lesson';
import { api } from '@/shared/api';
import { isVerbLanguage, type VerbLanguage } from '@/shared/config/languages';
import { useSettings } from '@/shared/config/settings';
import { loadChecked, save } from '@/shared/lib/storage';

import { languageOfLesson, localParse, markKeyWords } from '../lib/document';
import { normalizeAnalysis } from './normalize';
import { getRemoved, useRemoved, withoutRemoved } from './removed';
import { type Analysis, type Lesson } from './types';

// Only the newest lessons are prepared on their own; older ones wait until the student opens them.
export const AUTO_PREPARE = 1;

// v2: analyses know the lesson's language; v1 entries treated English lessons as French.
export const analysisKey = (hash: string) => 'an2:' + hash;
/** French tables keep the key they always had; another language gets its own, so verbs spelled
    alike in two languages never share a table. */
export const conjugationKey = (infinitive: string, language: VerbLanguage) =>
  (language === 'fr' ? 'conj:' : `conj:${language}:`) + infinitive.toLowerCase();

// The language of a verb's tables: its lesson's, French for a verb saved before others had any.
export const verbLanguageOf = (verb: VerbRef): VerbLanguage =>
  isVerbLanguage(verb.language) ? verb.language : 'fr';

// Cached analysis, with transcriptions moved out of older entries.
export function readAnalysis(hash: string): Analysis | null {
  // the same check as Claude's answer, which also moves old transcriptions out (withTranscription)
  return loadChecked(analysisKey(hash), normalizeAnalysis);
}

/** Cached conjugation. Older French entries get their language set and their reflexive pronouns
    moved out of the person. */
export function readConjugation(infinitive: string, language: VerbLanguage): Conjugation | null {
  // the same check as Claude's answer: it sets the language and moves reflexive pronouns
  return loadChecked(conjugationKey(infinitive, language), (raw) =>
    normalizeConjugation(raw, infinitive, language)
  );
}

/** A verb's tables: the saved ones, or (fresh, or none saved) Claude's, which are then saved.
    Throws when Claude's answer can't be used. */
export async function fetchConjugation(verb: VerbRef, fresh = false): Promise<Conjugation> {
  const language = verbLanguageOf(verb);
  const cached = fresh ? null : readConjugation(verb.inf, language);
  if (cached) return cached;
  const conjugation = normalizeConjugation(
    await api.conjugate(verb.inf, verb.ru, language, fresh),
    verb.inf,
    language
  );
  save(conjugationKey(verb.inf, language), conjugation);
  return conjugation;
}

export interface LessonInfo {
  key: string;
  n: number;
  word: Lesson['word'];
  topic: string;
  ready: boolean;
}
export type BankVerb = VerbRef & { lesson: string };
export type BankPair = Pair & { lesson: string };
export interface Bank {
  words: Word[];
  pairs: BankPair[];
  verbs: BankVerb[];
  lessons: LessonInfo[];
  // newest lessons still being prepared by Claude
  pending: number;
  failed: number;
  // older lessons not prepared yet, left until the student opens them
  waiting: number;
  // call when a lesson view prepares or re-prepares a lesson
  put: (lessonKey: string, analysis: Analysis) => void;
}

// Every prepared lesson's words, verbs and pairs, newest lesson first. The newest lessons are prepared one at a time if missing.
export function useBank(lessons: Lesson[], hasClaude: boolean): Bank {
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

  // Pick up cached lessons whenever the document changes.
  useEffect(() => {
    generation.current++;
    const out: Record<string, Analysis> = {};
    const kept: Record<string, Analysis> = {};
    const auto = new Set(lessons.slice(-AUTO_PREPARE).map((lesson) => lesson.key));
    for (const lesson of lessons) {
      const analysis =
        readAnalysis(lesson.hash) ||
        (hasClaude ? null : localParse(lesson.body, languageOfLesson(lesson)));
      const before = latestShown.current[lesson.key];
      if (analysis) out[lesson.key] = analysis;
      // only lessons that are prepared again right away
      else if (hasClaude && auto.has(lesson.key) && before) kept[lesson.key] = before;
    }
    setAnalyses(out);
    setStale(kept);
    setFailed(new Set());
  }, [lessons, hasClaude]);

  useEffect(() => {
    if (!hasClaude || busy.current) return;
    // Check the cache too: on load this runs before the cached lessons reach state.
    const next = lessons
      .slice(-AUTO_PREPARE)
      .reverse()
      .find(
        (lesson) => !analyses[lesson.key] && !failed.has(lesson.key) && !readAnalysis(lesson.hash)
      );
    if (!next) return;
    busy.current = true;
    const requestGeneration = generation.current;
    api
      .analyze(next.body)
      .then((raw) => {
        const analysis = normalizeAnalysis(raw);
        save(analysisKey(next.hash), analysis);
        if (requestGeneration === generation.current)
          setAnalyses((previous) =>
            previous[next.key] ? previous : { ...previous, [next.key]: analysis }
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
  }, [lessons, hasClaude, analyses, failed, tick]);

  const put = useCallback(
    (key: string, analysis: Analysis) =>
      setAnalyses((previous) => ({ ...previous, [key]: analysis })),
    []
  );

  const { studying } = useSettings();
  const removed = useRemoved();
  return useMemo(() => {
    const words: Word[] = [],
      pairs: BankPair[] = [],
      verbs: BankVerb[] = [],
      lessonInfos: LessonInfo[] = [];
    const seenWords = new Set<string>(),
      seenVerbs = new Set<string>();
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
      // the language is part of a word's identity: "la casa" is Spanish and Italian
      for (const word of markKeyWords(analysis.words, lesson.body)) {
        const identity = `${analysis.language}:${wordKey(word.fr)}`;
        if (!seenWords.has(identity)) {
          seenWords.add(identity);
          words.push({ ...word, lesson: lesson.key, language: analysis.language });
        }
      }
      pairs.push(...analysis.pairs.map((pair) => ({ ...pair, lesson: lesson.key })));
      // "ser", "ir" and "partir" are verbs in several languages, each with its own tables
      for (const verb of analysis.verbs) {
        const identity = `${analysis.language}:${verb.inf.toLowerCase()}`;
        if (!seenVerbs.has(identity)) {
          seenVerbs.add(identity);
          verbs.push({ ...verb, language: analysis.language, lesson: lesson.key });
        }
      }
    }
    const auto = new Set(lessons.slice(-AUTO_PREPARE).map((lesson) => lesson.key));
    const missing = lessons.filter((lesson) => !analyses[lesson.key] && !failed.has(lesson.key));
    const pending = hasClaude ? missing.filter((lesson) => auto.has(lesson.key)).length : 0;
    const waiting = hasClaude ? missing.length - pending : 0;
    return {
      words,
      pairs,
      verbs,
      lessons: lessonInfos,
      pending,
      failed: failed.size,
      waiting,
      put,
    };
  }, [lessons, analyses, shown, failed, hasClaude, put, studying, removed]);
}

/** Only the newest lesson is prepared by itself (AUTO_PREPARE). An older one a page needs (the
    warm-up's previous lesson, "mots de la leçon 5" in the homework) is prepared here if this
    device doesn't have it yet. True while Claude is reading it. */
export function usePreparedLesson(lesson: Lesson | null, bank: Bank, hasClaude: boolean): boolean {
  const ready =
    !lesson ||
    bank.lessons.some((info) => info.key === lesson.key && info.ready) ||
    !!readAnalysis(lesson.hash);
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
        save(analysisKey(lesson.hash), analysis);
        put(lesson.key, analysis);
      })
      // the warm-up then asks about the mistakes alone
      .catch(() => {})
      .finally(() => {
        if (alive) setPreparing(false);
      });
    return () => {
      alive = false;
    };
  }, [lesson, ready, hasClaude, put]);
  return preparing;
}

/** One lesson's own words, with their lesson and language, key words (★) marked, without those
    the student took out. The bank keeps a word under the newest lesson that has it, so this reads
    the lesson's analysis instead. */
export function lessonWords(lesson: Lesson, bank: Bank, hasClaude: boolean): Word[] {
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
}
