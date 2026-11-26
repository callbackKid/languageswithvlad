import { isLearned, type Progress, statWord, type Word } from '@/entities/word/@x/lesson';
import { getSettings, isStudied, languageOfTense, type Tense } from '@/shared/config';
import { startOfDay } from '@/shared/lib/dates';

import { type Bank } from './bank';
import { buildQuiz, type FormQuestion, pickWords, type QuizItem } from './quiz';
import { type Lesson } from './types';

// About five minutes of questions.
export const WARM_UP_QUESTIONS = 12;
// The round before a lesson, and at most this many of its questions on the hard words.
export const PREPARE_QUESTIONS = 10;
const PREPARE_HARD = 4;
// at most this many questions from the mistakes, so the lesson's own words get asked too
const MISSED_WORDS = 6;
const MISSED_FORMS = 2;
// with no earlier lesson in the document, the mistakes of the past week
const FALLBACK_DAYS = 7;

/** The lesson the warm-up goes over: the newest one before today, since today's may already be
    written in the document. */
export const previousLesson = (lessons: Lesson[], now = new Date()): Lesson | null => {
  const today = startOfDay(now);
  return [...lessons].reverse().find((lesson) => lesson.date.getTime() < today) ?? null;
};

/** Questions on the previous lesson's words and on what the student got wrong since that lesson:
    the mistakes first, then the lesson's words, the ones not known yet more often. */
export const warmUpRound = (
  bank: Bank,
  lesson: Lesson | null,
  progress: Progress,
  now = new Date()
): QuizItem[] => {
  const since = lesson
    ? startOfDay(lesson.date)
    : startOfDay(now) - FALLBACK_DAYS * 24 * 60 * 60 * 1000;
  const settings = getSettings();
  const byMisses = <T extends { wrong: number; right: number }>(first: T, second: T) =>
    second.wrong - first.wrong || first.right - second.right;

  // missed since then and not learned again afterwards
  const missedWords = Object.values(progress.words)
    .filter(
      (stat) =>
        stat.wrong > 0 &&
        stat.last >= since &&
        !isLearned(stat) &&
        isStudied(stat.language, settings)
    )
    .sort(byMisses)
    .slice(0, MISSED_WORDS)
    .map(statWord);
  // a verb form's tense names its language, which the student must still learn
  const missedForms: FormQuestion[] = Object.values(progress.forms)
    .filter(
      (stat) =>
        stat.wrong > 0 &&
        stat.last >= since &&
        stat.wrong >= stat.right &&
        isStudied(languageOfTense(stat.t), settings)
    )
    .sort(byMisses)
    .slice(0, MISSED_FORMS)
    .map((stat) => ({
      inf: stat.inf,
      t: stat.t as Tense,
      p: stat.p,
      f: stat.f,
      negative: stat.negative,
    }));

  const asked = new Set(missedWords.map((word) => word.fr.toLowerCase()));
  const lessonWords = lesson
    ? bank.words.filter((word) => word.lesson === lesson.key && !asked.has(word.fr.toLowerCase()))
    : [];
  const fromLesson = pickWords(
    lessonWords,
    progress,
    WARM_UP_QUESTIONS - missedWords.length - missedForms.length
  );
  const targets = [...missedWords, ...fromLesson];
  // wrong answers come from every lesson, so a short lesson still gets four choices
  const pool = bank.words.length >= 4 ? bank.words : targets;
  return buildQuiz(targets, pool, missedForms);
};

/** The round the day before a lesson: the newest lesson's words and the words still hard, so
    they are fresh for it. */
export const prepareRound = (words: Word[], bank: Bank, progress: Progress): QuizItem[] => {
  const settings = getSettings();
  const hard = Object.values(progress.words)
    .filter((stat) => stat.hard && isStudied(stat.language, settings))
    .sort((first, second) => second.wrong - first.wrong)
    .slice(0, PREPARE_HARD)
    .map(statWord);
  const asked = new Set(hard.map((word) => word.fr.toLowerCase()));
  const fromLesson = pickWords(
    words.filter((word) => !asked.has(word.fr.toLowerCase())),
    progress,
    PREPARE_QUESTIONS - hard.length
  );
  const targets = [...fromLesson, ...hard];
  return buildQuiz(targets, bank.words.length >= 4 ? bank.words : targets);
};
