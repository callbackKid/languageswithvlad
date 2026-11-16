import { useEffect, useRef, useState } from 'react';

import { translator, useTranslation } from '../i18n/core';
import { common } from '../i18n/messages/common';
import { exercises } from '../i18n/messages/exercises';
import { api, ApiError } from '../lib/api';
import { normalizeGaps } from '../lib/parse';
import { recordWord } from '../lib/progress';
import { getSettings } from '../lib/settings';
import type { GapItem, Word } from '../lib/types';
import { shuffle } from '../lib/util';
import ExerciseHead from './ExerciseHead';
import WaitingFact from './WaitingFact';

export default function GapFill({
  words,
  onClose,
  onRestart,
}: {
  words: Word[];
  onClose: () => void;
  onRestart: () => void;
}) {
  const { t, rich } = useTranslation(exercises);
  const commonText = useTranslation(common);
  const language = words[0]?.language ?? 'fr';
  const [items, setItems] = useState<GapItem[] | null>(null);
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [showRu, setShowRu] = useState(false);
  const [score, setScore] = useState(0);

  // Asked for once, with the words the exercise started with: the parent may hand over a new
  // list while it runs (another lesson finishes preparing), and that must not restart it or
  // pay for a second set of sentences. A new round remounts the exercise.
  const startingWords = useRef(words).current;
  useEffect(() => {
    let alive = true;
    const sample = shuffle(startingWords)
      .slice(0, 24)
      .map((word) => ({ fr: word.fr, ru: word.ru }));
    api
      .gaps(sample, language, getSettings().levels[language])
      .then((response) => {
        if (alive) setItems(normalizeGaps(response));
      })
      .catch((failure) => {
        if (alive)
          // read at the moment of failure, so the effect doesn't depend on the language
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
        <ExerciseHead title={t('fillGap')} onClose={onClose} />
        <div className="note err">
          <p>{error}</p>
          <button type="button" className="btn" onClick={onRestart}>
            {commonText.t('tryAgain')}
          </button>
        </div>
      </div>
    );
  if (!items)
    return (
      <div className="ex">
        <ExerciseHead title={t('fillGap')} onClose={onClose} />
        <WaitingFact language={language}>{t('writingSentences')}</WaitingFact>
      </div>
    );
  const item = items[index];
  // past the last sentence: the round is over
  if (!item)
    return (
      <div className="ex">
        <ExerciseHead title={t('fillGap')} onClose={onClose} />
        <p className="score">{commonText.t('scoreLine', { score, total: items.length })}</p>
        <div className="row-actions">
          <button type="button" className="btn primary" onClick={onRestart}>
            {t('newSentences')}
          </button>
        </div>
      </div>
    );

  const right = picked === item.answer;
  return (
    <div className="ex">
      <ExerciseHead title={t('fillGap')} onClose={onClose}>
        <span className="progress">
          {index + 1} / {items.length}
        </span>
      </ExerciseHead>
      <p className="sentence" lang={language}>
        {item.before}{' '}
        <span className={'gap' + (picked == null ? '' : right ? ' ok' : ' bad')}>
          {picked == null ? '\u00a0' : item.answer}
        </span>{' '}
        {item.after}
      </p>
      {showRu || picked != null ? (
        <p className="ru-line" lang="ru">
          {item.ru}
        </p>
      ) : (
        <p className="ru-line">
          <button type="button" className="btn ghost flush" onClick={() => setShowRu(true)}>
            {commonText.t('showTranslation')}
          </button>
        </p>
      )}
      <div className="choices">
        {item.choices.map((choice) => {
          const stateClass =
            picked == null ? '' : choice === item.answer ? ' ok' : choice === picked ? ' bad' : '';
          return (
            <button
              type="button"
              key={choice}
              className={'choice' + stateClass}
              lang={language}
              disabled={picked != null}
              onClick={() => {
                setPicked(choice);
                if (choice === item.answer) setScore((previous) => previous + 1);
                const word = words.find((candidate) => candidate.fr === item.word);
                if (word) recordWord(word, choice === item.answer);
              }}
            >
              {choice}
            </button>
          );
        })}
      </div>
      {picked != null && (
        <>
          <p className={'feedback ' + (right ? 'ok' : 'bad')}>
            {right ? commonText.t('right') : t('gapAnswer', { answer: item.answer })}
            {item.word &&
              rich(
                'fromWord',
                { i: (chunk) => <i lang={language}>{chunk}</i> },
                { word: item.word }
              )}
          </p>
          <div className="row-actions">
            <button
              type="button"
              className="btn primary"
              autoFocus
              onClick={() => {
                setIndex((previous) => previous + 1);
                setPicked(null);
                setShowRu(false);
              }}
            >
              {index + 1 < items.length ? t('nextSentence') : commonText.t('seeScore')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
