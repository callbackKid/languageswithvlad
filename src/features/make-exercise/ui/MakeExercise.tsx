import { type FormEvent, useState } from 'react';

import { api, ApiError } from '@/shared/api';
import {
  asLanguage,
  getSettings,
  type Language,
  type Level,
  LEVELS,
  translationLanguage,
} from '@/shared/config';
import { common, translator, useTranslation } from '@/shared/i18n';
import { loadChecked, save } from '@/shared/lib/storage';
import WaitingFact from '@/shared/ui/WaitingFact';

import { makeExerciseText } from '../i18n/makeExercise';
import { normalizeExercise } from '../model/normalize';
import { type MadeExercise } from '../model/types';
import ExerciseRound from './ExerciseRound';

// the last exercise made, kept on this device so a reload during the lesson doesn't lose it
const LAST_KEY = 'exercise:last';
// keep in step with MIN_ / MAX_ / DEFAULT_EXERCISE_QUESTIONS in api/analyze.ts
const QUESTION_COUNTS = [5, 8, 10, 15] as const;
const DEFAULT_COUNT = 8;
// the longest grammar point; keep in step with MAX_GRAMMAR_LENGTH in api/analyze.ts
const MAX_GRAMMAR_LENGTH = 200;

// The saved exercise, checked; null when there is none or it can't be used.
const readLast = (): MadeExercise | null =>
  loadChecked(LAST_KEY, (raw) => {
    try {
      return normalizeExercise(
        raw,
        asLanguage((raw as { language?: unknown } | null)?.language),
        'ru'
      );
    } catch {
      return null;
    }
  });

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
        language,
        translationLanguage(language)
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
              maxLength={MAX_GRAMMAR_LENGTH}
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
