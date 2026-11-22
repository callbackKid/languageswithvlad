import { type ReactNode, useEffect, useRef, useState } from 'react';

import { translator, useTranslation } from '../i18n/core';
import { common } from '../i18n/messages/common';
import { exercises } from '../i18n/messages/exercises';
import { api, ApiError } from '../lib/api';
import { normalizeGaps } from '../lib/parse';
import { recordWord } from '../lib/progress';
import { keyWordsFirst } from '../lib/quiz';
import { getSettings } from '../lib/settings';
import type { GapItem, Language, Word } from '../lib/types';
import { shuffle } from '../lib/util';
import ExerciseHead from './ExerciseHead';
import WaitingFact from './WaitingFact';

// Fill the gap with the lesson's words: sentences Claude writes around them.
export default function GapFill({
  words,
  onClose,
  onRestart,
  onRoundEnd,
}: {
  words: Word[];
  onClose: () => void;
  onRestart: () => void;
  onRoundEnd?: () => void;
}) {
  const { t, rich } = useTranslation(exercises);
  const language = words[0]?.language ?? 'fr';
  // Asked for once, with the words the exercise started with: the parent may hand over a new
  // list while it runs (another lesson finishes preparing), and that must not restart it or
  // pay for a second set of sentences. A new round remounts the exercise.
  const startingWords = useRef(words).current;
  return (
    <GapRound
      title={t('fillGap')}
      language={language}
      waiting={t('writingSentences')}
      load={() => {
        // key words (★) are always among the words sent
        const sample = keyWordsFirst(shuffle(startingWords))
          .slice(0, 24)
          .map((word) => ({ fr: word.fr, ru: word.ru }));
        return api.gaps(sample, language, getSettings().levels[language]);
      }}
      onAnswer={(item, right) => {
        const word = startingWords.find((candidate) => candidate.fr === item.word);
        if (word) recordWord(word, right);
      }}
      explain={(item) =>
        item.word &&
        rich('fromWord', { i: (chunk) => <i lang={language}>{chunk}</i> }, { word: item.word })
      }
      onClose={onClose}
      onRestart={onRestart}
      onRoundEnd={onRoundEnd}
    />
  );
}

/** A round of gap sentences: pick the right answer for each, then see the score. The
    sentences are loaded once, when the round starts; a new round remounts it. */
export function GapRound({
  title,
  language,
  waiting,
  load,
  onAnswer,
  explain,
  onClose,
  onRestart,
  onRoundEnd,
}: {
  title: string;
  language: Language;
  // shown while the sentences are being written
  waiting: string;
  load: () => Promise<unknown>;
  onAnswer?: (item: GapItem, right: boolean) => void;
  // said after the answer, next to right or wrong
  explain?: (item: GapItem) => ReactNode;
  onClose: () => void;
  onRestart: () => void;
  // called once when the round is over
  onRoundEnd?: () => void;
}) {
  const { t } = useTranslation(exercises);
  const commonText = useTranslation(common);
  const [items, setItems] = useState<GapItem[] | null>(null);
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [showRu, setShowRu] = useState(false);
  const [score, setScore] = useState(0);
  const loadOnce = useRef(load).current;
  const over = !!items?.length && index >= items.length;
  const latestRoundEnd = useRef(onRoundEnd);
  useEffect(() => {
    latestRoundEnd.current = onRoundEnd;
  }, [onRoundEnd]);
  useEffect(() => {
    if (over) latestRoundEnd.current?.();
  }, [over]);

  useEffect(() => {
    let alive = true;
    loadOnce()
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
  }, [loadOnce]);

  if (error)
    return (
      <div className="ex">
        <ExerciseHead title={title} onClose={onClose} />
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
        <ExerciseHead title={title} onClose={onClose} />
        <WaitingFact language={language}>{waiting}</WaitingFact>
      </div>
    );
  const item = items[index];
  // past the last sentence: the round is over
  if (!item)
    return (
      <div className="ex">
        <ExerciseHead title={title} onClose={onClose} />
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
      <ExerciseHead title={title} onClose={onClose}>
        <span className="progress">
          {index + 1} / {items.length}
        </span>
      </ExerciseHead>
      <p className="sentence" lang={language}>
        {item.before}{' '}
        <span className={'gap' + (picked == null ? '' : right ? ' ok' : ' bad')}>
          {picked == null ? ' ' : item.answer}
        </span>{' '}
        {item.after}
      </p>
      {/* folded so it doesn't give the answer away; it opens by itself once the student answers */}
      <details
        className="translation-peek"
        open={showRu}
        onToggle={(event) => setShowRu(event.currentTarget.open)}
      >
        <summary>{commonText.t('translation')}</summary>
        <p lang="ru">{item.ru}</p>
      </details>
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
                setShowRu(true);
                if (choice === item.answer) setScore((previous) => previous + 1);
                onAnswer?.(item, choice === item.answer);
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
            {explain?.(item)}
          </p>
          {item.why && <p className="hint gap-why">{item.why}</p>}
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
