import { useEffect, useRef, useState } from 'react';

import { pickWords, type QuizItem } from '@/entities/lesson';
import { getProgress, type Word } from '@/entities/word';
import { normalizeGaps } from '@/features/gap-fill';
import { WordQuiz } from '@/features/quiz';
import { api, ApiError } from '@/shared/api';
import { getSettings } from '@/shared/config';
import { common, exercises, translator, useTranslation } from '@/shared/i18n';
import { Button } from '@/shared/ui/controls';
import ExerciseHead from '@/shared/ui/ExerciseHead';
import WaitingFact from '@/shared/ui/WaitingFact';

import { BLITZ_SIZE, buildBlitz } from '../model/blitz';
import { normalizeDefinitions } from '../model/normalize';

/** The vocabulary blitz: a round of the picked words, half in gap sentences to fill from choices,
    half guessed from a definition in their own language and typed. Claude writes both at once;
    a new round remounts it (onRestart) and asks for new ones. */
export default function WordBlitz({
  words,
  onClose,
  onRestart,
}: {
  words: Word[];
  onClose: () => void;
  onRestart: () => void;
}) {
  const { t } = useTranslation(exercises);
  const commonText = useTranslation(common);
  // Asked for once, with the words the round started with: the list may change while it runs
  // (another lesson finishes preparing), and that must not pay for a second round.
  const startingWords = useRef(words).current;
  const language = startingWords[0]?.language ?? 'fr';
  const [round, setRound] = useState<QuizItem[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    const level = getSettings().levels[language];
    const chosen = pickWords(startingWords, getProgress(), BLITZ_SIZE);
    const half = Math.ceil(chosen.length / 2);
    const forGaps = chosen.slice(0, half);
    const forDefinitions = chosen.slice(half);
    const sent = (list: Word[]) => list.map((word) => ({ fr: word.fr, ru: word.ru }));
    Promise.all([
      api.gaps(sent(forGaps), language, level).then(normalizeGaps),
      forDefinitions.length
        ? api
            .definitions(sent(forDefinitions), language, level)
            .then((raw) => normalizeDefinitions(raw, forDefinitions))
        : [],
    ])
      .then(([gaps, definitions]) => {
        const items = buildBlitz(gaps, definitions, chosen);
        if (!items.length) throw new Error('empty');
        if (alive) setRound(items);
      })
      .catch((failure) => {
        // read at the moment of failure, so the effect doesn't depend on the language
        if (alive)
          setError(
            failure instanceof ApiError ? failure.message : translator(common).t('unreadable')
          );
      });
    return () => {
      alive = false;
    };
  }, [startingWords, language]);

  if (error)
    return (
      <div className="ex">
        <ExerciseHead title={t('blitz')} onClose={onClose} />
        <div className="note err" role="alert">
          <p>{error}</p>
          <Button onClick={onRestart}>{commonText.t('tryAgain')}</Button>
        </div>
      </div>
    );
  if (!round)
    return (
      <div className="ex">
        <ExerciseHead title={t('blitz')} onClose={onClose} />
        <WaitingFact language={language}>{t('writingBlitz')}</WaitingFact>
      </div>
    );
  return (
    <WordQuiz title={t('blitz')} make={() => round} onClose={onClose} onNextRound={onRestart} />
  );
}
