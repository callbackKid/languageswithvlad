import { useEffect, useState } from 'react';

import { getProgress, type Word } from '@/entities/word';
import { api, ApiError } from '@/shared/api';
import { getSettings, translationLanguage } from '@/shared/config';
import { common, translator, useTranslation } from '@/shared/i18n';
import ExerciseHead from '@/shared/ui/ExerciseHead';
import WaitingFact from '@/shared/ui/WaitingFact';

import { makeExerciseText } from '../i18n/makeExercise';
import { GROUP_QUESTIONS, MIN_GROUP_WORDS, wordsForGroupExercise } from '../model/groupWords';
import { normalizeExercise } from '../model/normalize';
import { type MadeExercise } from '../model/types';
import ExerciseRound from './ExerciseRound';

/** A round of GROUP_QUESTIONS mixed questions by Claude on one group of words, at the student's
    level; made when it opens and again with Create another, never saved. name is the group's
    name as shown. */
export default function GroupExercise({
  words,
  name,
  onClose,
}: {
  words: Word[];
  name: string;
  onClose: () => void;
}) {
  const { t } = useTranslation(makeExerciseText);
  const commonText = useTranslation(common);
  // counts the requests: each change asks Claude for a new round
  const [attempt, setAttempt] = useState(0);
  const [exercise, setExercise] = useState<MadeExercise | null>(null);
  const [error, setError] = useState('');
  const [practised] = useState(() => wordsForGroupExercise(words, getProgress()));

  useEffect(() => {
    if (!practised) return;
    let alive = true;
    const { language } = practised;
    api
      .exercise({
        language,
        level: getSettings().levels[language],
        grammar: '',
        words: practised.words,
        count: GROUP_QUESTIONS,
      })
      .then((raw) => {
        if (!alive) return;
        setExercise(normalizeExercise(raw, language, translationLanguage(language)));
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
  }, [practised, attempt]);

  function again() {
    setExercise(null);
    setError('');
    setAttempt((previous) => previous + 1);
  }

  if (exercise) return <ExerciseRound exercise={exercise} onClose={onClose} onAnother={again} />;

  return (
    <div className="ex made-exercise">
      <ExerciseHead
        title={t('groupTitle', { name })}
        onClose={onClose}
        closeLabel={commonText.t('close')}
      />
      {error || !practised ? (
        <div className="note err" role="alert">
          <p>{error || t('groupTooFew', { count: MIN_GROUP_WORDS })}</p>
          {practised && (
            <button type="button" className="btn" onClick={again}>
              {commonText.t('tryAgain')}
            </button>
          )}
        </div>
      ) : (
        <WaitingFact language={practised.language}>
          {t('making', { count: GROUP_QUESTIONS })}
        </WaitingFact>
      )}
    </div>
  );
}
