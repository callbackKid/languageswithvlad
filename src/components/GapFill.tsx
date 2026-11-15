import { useEffect, useState } from 'react';
import { api, ApiError } from '../lib/api';
import { normGaps } from '../lib/parse';
import { recordWord } from '../lib/progress';
import type { GapItem, Word } from '../lib/types';
import { shuffle } from '../lib/util';
import { useTranslation } from '../i18n/core';
import { common } from '../i18n/messages/common';
import { exercises } from '../i18n/messages/exercises';
import ExHead from './ExHead';
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

  useEffect(() => {
    let alive = true;
    const sample = shuffle(words)
      .slice(0, 24)
      .map((word) => ({ fr: word.fr, ru: word.ru }));
    api
      .gaps(sample, language)
      .then((response) => {
        if (alive) setItems(normGaps(response));
      })
      .catch((failure) => {
        if (alive)
          setError(failure instanceof ApiError ? failure.message : commonText.t('unreadable'));
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the message is read when it fails
  }, [words, language]);

  if (error)
    return (
      <div className="ex">
        <ExHead title={t('fillGap')} onClose={onClose} />
        <div className="note err">
          <p>{error}</p>
          <button className="btn" onClick={onRestart}>
            {commonText.t('tryAgain')}
          </button>
        </div>
      </div>
    );
  if (!items)
    return (
      <div className="ex">
        <ExHead title={t('fillGap')} onClose={onClose} />
        <WaitingFact language={language}>{t('writingSentences')}</WaitingFact>
      </div>
    );
  const item = items[index];
  // past the last sentence: the round is over
  if (!item)
    return (
      <div className="ex">
        <ExHead title={t('fillGap')} onClose={onClose} />
        <p className="score">{commonText.t('scoreLine', { score, total: items.length })}</p>
        <div className="row-actions">
          <button className="btn primary" onClick={onRestart}>
            {t('newSentences')}
          </button>
        </div>
      </div>
    );

  const right = picked === item.answer;
  return (
    <div className="ex">
      <ExHead title={t('fillGap')} onClose={onClose}>
        <span className="progress">
          {index + 1} / {items.length}
        </span>
      </ExHead>
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
          <button className="btn ghost flush" onClick={() => setShowRu(true)}>
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
