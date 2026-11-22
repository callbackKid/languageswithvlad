import { useEffect, useRef, useState } from 'react';

import { ApiError } from '@/shared/api';
import { type Language } from '@/shared/config';
import { common, translator, useTranslation } from '@/shared/i18n';
import ExerciseHead from '@/shared/ui/ExerciseHead';
import WaitingFact from '@/shared/ui/WaitingFact';

import { makeExerciseText } from '../i18n/makeExercise';
import { type MadeExercise } from '../model/types';
import ExerciseRound from './ExerciseRound';

/** A round by Claude made when it opens and again with Create another, never saved: the waiting
    fact while Claude writes, an error with Try again, then the round. load asks for it. */
export default function RoundLoader({
  title,
  language,
  waiting,
  load,
  onClose,
}: {
  // the heading while it loads; the round then shows its own title
  title: string;
  language: Language;
  // what the waiting fact says
  waiting: string;
  load: () => Promise<MadeExercise>;
  onClose: () => void;
}) {
  const commonText = useTranslation(common);
  // counts the requests: each change asks Claude for a new round
  const [attempt, setAttempt] = useState(0);
  const [exercise, setExercise] = useState<MadeExercise | null>(null);
  const [error, setError] = useState('');
  // read when a request starts, so a new function from the parent doesn't start another
  const latestLoad = useRef(load);
  useEffect(() => {
    latestLoad.current = load;
  });

  // the current attempt's request: StrictMode runs the effect twice, and the second run waits for
  // it rather than paying Claude for another round
  const request = useRef<{ attempt: number; made: Promise<MadeExercise> } | null>(null);

  useEffect(() => {
    let alive = true;
    if (request.current?.attempt !== attempt)
      request.current = { attempt, made: latestLoad.current() };
    request.current.made
      .then((made) => {
        if (alive) setExercise(made);
      })
      .catch((failure: unknown) => {
        if (!alive) return;
        // read at the moment of failure, so a new interface language is used
        setError(
          failure instanceof ApiError ? failure.message : translator(makeExerciseText).t('failed')
        );
      });
    return () => {
      alive = false;
    };
  }, [attempt]);

  function again() {
    setExercise(null);
    setError('');
    setAttempt((previous) => previous + 1);
  }

  if (exercise) return <ExerciseRound exercise={exercise} onClose={onClose} onAnother={again} />;
  return (
    <div className="ex made-exercise">
      <ExerciseHead title={title} onClose={onClose} closeLabel={commonText.t('close')} />
      {error ? (
        <div className="note err" role="alert">
          <p>{error}</p>
          <button type="button" className="btn" onClick={again}>
            {commonText.t('tryAgain')}
          </button>
        </div>
      ) : (
        <WaitingFact language={language}>{waiting}</WaitingFact>
      )}
    </div>
  );
}
