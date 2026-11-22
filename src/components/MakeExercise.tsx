import { type FormEvent, useState } from 'react';

import { translator, useTranslation } from '../i18n/core';
import { common } from '../i18n/messages/common';
import { makeExerciseText } from '../i18n/messages/makeExercise';
import { api, ApiError } from '../lib/api';
import { type Grade, grade } from '../lib/grade';
import { normalizeExercise } from '../lib/parse';
import { getSettings, type Level, LEVELS } from '../lib/settings';
import { loadChecked, save } from '../lib/storage';
import { asLanguage, type ExerciseQuestion, type Language, type MadeExercise } from '../lib/types';
import { shuffle } from '../lib/util';
import ExerciseHead from './ExerciseHead';
import WaitingFact from './WaitingFact';

// the last exercise made, kept on this device so a reload during the lesson doesn't lose it
const LAST_KEY = 'exercise:last';
// keep in step with MIN_ / MAX_ / DEFAULT_EXERCISE_QUESTIONS in api/analyze.ts
const QUESTION_COUNTS = [5, 8, 10, 15] as const;
const DEFAULT_COUNT = 8;

// The saved exercise, checked; null when there is none or it can't be used.
const readLast = (): MadeExercise | null =>
  loadChecked(LAST_KEY, (raw) => {
    try {
      return normalizeExercise(raw, asLanguage((raw as { language?: unknown } | null)?.language));
    } catch {
      return null;
    }
  });

// How an answer compares with the right one and the others just as right: the best of them.
function gradeAnswer(input: string, question: ExerciseQuestion): Grade {
  const grades = [question.answer, ...question.accept].map((answer) => grade(input, answer));
  if (grades.includes('ok')) return 'ok';
  if (grades.includes('accent')) return 'accent';
  return grades[0] ?? 'bad';
}

/** The exercise maker in lesson mode, for the teacher and the student alike: grammar and/or the lesson's words, a level and a
    number of questions; Claude writes a mixed round (choose, fill the gap, translate) that the
    student then does right here, each answer checked and explained. */
export default function MakeExercise({
  language,
  words,
  lessonNumber,
}: {
  language: Language;
  // the newest lesson's words, the ones the exercise can practise
  words: string[];
  lessonNumber: number | null;
}) {
  const { t } = useTranslation(makeExerciseText);
  const commonText = useTranslation(common);
  const [grammar, setGrammar] = useState('');
  const [useWords, setUseWords] = useState(words.length > 0);
  const [level, setLevel] = useState<Level>(() => getSettings().levels[language]);
  const [count, setCount] = useState(DEFAULT_COUNT);
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');
  const [exercise, setExercise] = useState<MadeExercise | null>(readLast);
  const [isRunning, setRunning] = useState(false);

  const practised = useWords ? words : [];
  const canMake = !!grammar.trim() || practised.length > 0;

  async function make(event?: FormEvent) {
    event?.preventDefault();
    if (!canMake) return;
    setState('loading');
    setError('');
    try {
      const made = normalizeExercise(
        await api.exercise({ language, level, grammar: grammar.trim(), words: practised, count }),
        language
      );
      save(LAST_KEY, made);
      setExercise(made);
      setState('idle');
      setRunning(true);
    } catch (failure) {
      setState('error');
      // read at the moment of failure, so a new interface language is used
      setError(
        failure instanceof ApiError ? failure.message : translator(makeExerciseText).t('failed')
      );
    }
  }

  if (exercise && isRunning)
    return <ExerciseRound exercise={exercise} onClose={() => setRunning(false)} />;

  return (
    <>
      <p className="hint">{t('hint')}</p>
      <form className="make-exercise" onSubmit={(event) => void make(event)}>
        <fieldset className="make-exercise-what">
          <legend>{t('practise')}</legend>
          <label className="form-field">
            <span>{t('grammar')}</span>
            <input
              type="text"
              lang={language}
              value={grammar}
              maxLength={200}
              placeholder={t('grammarPlaceholder')}
              onChange={(event) => setGrammar(event.target.value)}
            />
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={useWords}
              disabled={!words.length}
              onChange={(event) => setUseWords(event.target.checked)}
            />
            {words.length && lessonNumber !== null
              ? t('words', { n: lessonNumber, count: words.length })
              : t('noWords')}
          </label>
        </fieldset>
        <div className="make-exercise-row">
          <div className="seg" role="group" aria-label={t('level')}>
            {LEVELS.map((candidate) => (
              <button
                key={candidate}
                type="button"
                aria-pressed={level === candidate}
                onClick={() => setLevel(candidate)}
              >
                {candidate}
              </button>
            ))}
          </div>
          <label className="make-exercise-count">
            <span>{t('count')}</span>
            <select value={count} onChange={(event) => setCount(Number(event.target.value))}>
              {QUESTION_COUNTS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
        {!canMake && <p className="hint">{t('pickSomething')}</p>}
        <div className="row-actions">
          <button type="submit" className="btn primary" disabled={!canMake || state === 'loading'}>
            {t('make')}
          </button>
          {exercise && state !== 'loading' && (
            <button type="button" className="btn" onClick={() => setRunning(true)}>
              {t('openLast', { title: exercise.title || '…' })}
            </button>
          )}
        </div>
      </form>
      {state === 'loading' && (
        <WaitingFact language={language}>{t('making', { count })}</WaitingFact>
      )}
      {state === 'error' && (
        <div className="note err" role="alert">
          <p>{error}</p>
          <button type="button" className="btn" onClick={() => void make()}>
            {commonText.t('tryAgain')}
          </button>
        </div>
      )}
    </>
  );
}

// One round of a made exercise: a question at a time, checked, explained, and a score at the end.
function ExerciseRound({ exercise, onClose }: { exercise: MadeExercise; onClose: () => void }) {
  const { t } = useTranslation(makeExerciseText);
  const commonText = useTranslation(common);
  const [questions, setQuestions] = useState(() => shuffle(exercise.questions));
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [result, setResult] = useState<Grade | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  // the translation would give the answer away: folded until the student opens it or answers
  const [showRu, setShowRu] = useState(false);
  const [score, setScore] = useState(0);
  const { language } = exercise;
  const question = questions[index];

  function answer(given: string) {
    if (!question) return;
    const graded = gradeAnswer(given, question);
    if (graded === 'empty') return;
    setResult(graded);
    setShowRu(true);
    if (graded !== 'bad') setScore((previous) => previous + 1);
  }
  // to the next question, or, from the start, a new order of the same questions
  function goTo(position: number) {
    setIndex(position);
    setTyped('');
    setPicked(null);
    setResult(null);
    setShowRu(false);
  }
  const next = () => goTo(index + 1);
  function again() {
    setQuestions(shuffle(exercise.questions));
    setScore(0);
    goTo(0);
  }

  const head = (
    <ExerciseHead
      title={exercise.title || t('title')}
      onClose={onClose}
      closeLabel={commonText.t('close')}
    />
  );
  if (!question)
    return (
      <div className="ex made-exercise">
        {head}
        <p className="score">{commonText.t('scoreLine', { score, total: questions.length })}</p>
        <div className="row-actions">
          <button type="button" className="btn primary" onClick={again}>
            {t('again')}
          </button>
          <button type="button" className="btn" onClick={onClose}>
            {t('makeAnother')}
          </button>
        </div>
      </div>
    );

  const isTranslate = question.type === 'translate';
  return (
    <div className="ex made-exercise">
      {head}
      <p className="hint">{t('progress', { current: index + 1, total: questions.length })}</p>
      {isTranslate && <p className="hint">{t('translate')}</p>}
      <p className="made-exercise-prompt" lang={isTranslate ? 'ru' : language}>
        {question.prompt}
      </p>
      {question.ru && (
        <details
          className="translation-peek"
          open={showRu}
          onToggle={(event) => setShowRu(event.currentTarget.open)}
        >
          <summary>{commonText.t('translation')}</summary>
          <p lang="ru">{question.ru}</p>
        </details>
      )}

      {question.type === 'choice' ? (
        <div className="choices">
          {question.options.map((option) => {
            const stateClass =
              picked === null
                ? ''
                : option === question.answer
                  ? ' ok'
                  : option === picked
                    ? ' bad'
                    : '';
            return (
              <button
                type="button"
                key={option}
                className={'choice' + stateClass}
                lang={language}
                disabled={picked !== null}
                onClick={() => {
                  setPicked(option);
                  answer(option);
                }}
              >
                {option}
              </button>
            );
          })}
        </div>
      ) : (
        <form
          className="quiz-input"
          onSubmit={(event) => {
            event.preventDefault();
            if (result) next();
            else answer(typed);
          }}
        >
          <input
            lang={language}
            value={typed}
            readOnly={!!result}
            onChange={(event) => setTyped(event.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label={commonText.t('yourAnswer')}
          />
          {!result && (
            <button type="submit" className="btn primary">
              {commonText.t('check')}
            </button>
          )}
        </form>
      )}

      {result && (
        <div className={'feedback ' + (result === 'bad' ? 'bad' : 'ok')} role="status">
          <p>
            {result === 'ok'
              ? commonText.t('right')
              : commonText.rich(
                  result === 'accent' ? 'almostAccents' : 'answerIs',
                  { b: (chunk) => <b lang={language}>{chunk}</b> },
                  { answer: question.answer }
                )}
          </p>
          {question.explanation && <p lang="ru">{question.explanation}</p>}
          <button type="button" className="btn primary" onClick={next}>
            {index + 1 < questions.length ? commonText.t('next') : commonText.t('seeScore')}
          </button>
        </div>
      )}
    </div>
  );
}
