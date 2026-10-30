import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "./api";
import { localParse, normAnalysis, withTr } from "./parse";
import { wordKey } from "./progress";
import { load, save } from "./storage";
import type { Analysis, Conjugation, Lesson, Pair, VerbRef, Word } from "./types";

/** Only the newest lessons are prepared on their own; older ones wait until the student opens them. */
export const AUTO_PREPARE = 2;

// v2: analyses know the lesson's language; v1 entries treated English lessons as French.
export const analysisKey = (hash: string) => "an2:" + hash;
export const conjKey = (infinitive: string) => "conj:" + infinitive.toLowerCase();

/** Cached analysis, with transcriptions moved out of older entries. */
export function readAnalysis(hash: string): Analysis | null {
  const analysis = load<Analysis>(analysisKey(hash));
  return analysis ? { ...analysis, words: analysis.words.map(withTr) } : null;
}

export function readConj(infinitive: string): Conjugation | null {
  return load<Conjugation>(conjKey(infinitive));
}

export interface LessonInfo { key: string; n: number; word: Lesson["word"]; topic: string; ready: boolean }
export type BankVerb = VerbRef & { lesson: string };
export type BankPair = Pair & { lesson: string };
export interface Bank {
  words: Word[]; pairs: BankPair[]; verbs: BankVerb[];
  lessons: LessonInfo[];
  /** newest lessons still being prepared by Claude */
  pending: number;
  failed: number;
  /** older lessons not prepared yet, left until the student opens them */
  waiting: number;
  /** call when a lesson view prepares or re-prepares a lesson */
  put: (lessonKey: string, analysis: Analysis) => void;
}

/** Every prepared lesson's words, verbs and pairs, newest lesson first. The newest lessons are prepared one at a time if missing. */
export function useBank(lessons: Lesson[], ai: boolean): Bank {
  const [analyses, setAnalyses] = useState<Record<string, Analysis>>({});
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const [tick, setTick] = useState(0);
  const busy = useRef(false);
  // Bumped when the document changes, so answers for the old one are dropped.
  const generation = useRef(0);

  // Pick up cached lessons whenever the document changes.
  useEffect(() => {
    generation.current++;
    const out: Record<string, Analysis> = {};
    for (const lesson of lessons) {
      const analysis = readAnalysis(lesson.hash) || (ai ? null : localParse(lesson.body));
      if (analysis) out[lesson.key] = analysis;
    }
    setAnalyses(out);
    setFailed(new Set());
  }, [lessons, ai]);

  useEffect(() => {
    if (!ai || busy.current) return;
    // Check the cache too: on load this runs before the cached lessons reach state.
    const next = lessons.slice(-AUTO_PREPARE).reverse().find(lesson => !analyses[lesson.key] && !failed.has(lesson.key) && !readAnalysis(lesson.hash));
    if (!next) return;
    busy.current = true;
    const requestGeneration = generation.current;
    api.analyze(next.body)
      .then(raw => {
        const analysis = normAnalysis(raw);
        save(analysisKey(next.hash), analysis);
        if (requestGeneration === generation.current) setAnalyses(previous => (previous[next.key] ? previous : { ...previous, [next.key]: analysis }));
      })
      .catch(() => { if (requestGeneration === generation.current) setFailed(previous => new Set(previous).add(next.key)); })
      .finally(() => { busy.current = false; setTick(previous => previous + 1); });
  }, [lessons, ai, analyses, failed, tick]);

  const put = useCallback((key: string, analysis: Analysis) => setAnalyses(previous => ({ ...previous, [key]: analysis })), []);

  return useMemo(() => {
    const words: Word[] = [], pairs: BankPair[] = [], verbs: BankVerb[] = [], lessonInfos: LessonInfo[] = [];
    const seenWords = new Set<string>(), seenVerbs = new Set<string>();
    for (const lesson of [...lessons].reverse()) {
      const analysis = analyses[lesson.key];
      lessonInfos.push({ key: lesson.key, n: lesson.n, word: lesson.word, topic: analysis?.topic || "", ready: !!analysis });
      if (!analysis) continue;
      for (const word of analysis.words) {
        const identity = wordKey(word.fr);
        if (!seenWords.has(identity)) { seenWords.add(identity); words.push({ ...word, lesson: lesson.key, language: analysis.language }); }
      }
      pairs.push(...analysis.pairs.map(pair => ({ ...pair, lesson: lesson.key })));
      for (const verb of analysis.verbs) {
        const identity = verb.inf.toLowerCase();
        if (!seenVerbs.has(identity)) { seenVerbs.add(identity); verbs.push({ ...verb, lesson: lesson.key }); }
      }
    }
    const auto = new Set(lessons.slice(-AUTO_PREPARE).map(lesson => lesson.key));
    const missing = lessons.filter(lesson => !analyses[lesson.key] && !failed.has(lesson.key));
    const pending = ai ? missing.filter(lesson => auto.has(lesson.key)).length : 0;
    const waiting = ai ? missing.length - pending : 0;
    return { words, pairs, verbs, lessons: lessonInfos, pending, failed: failed.size, waiting, put };
  }, [lessons, analyses, failed, ai, put]);
}
