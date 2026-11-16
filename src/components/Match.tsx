import { useState } from 'react';

import { useTranslation } from '../i18n/core';
import { learning } from '../i18n/messages/common';
import { exercises } from '../i18n/messages/exercises';
import { recordWord } from '../lib/progress';
import type { Word } from '../lib/types';
import { shuffle } from '../lib/util';
import ExerciseHead from './ExerciseHead';

/** word is set for translation pairs, so results count towards progress. */
export interface MatchPair {
  id: string;
  a: string;
  b: string;
  kind?: 'synonym' | 'antonym';
  word?: Word;
}
const ROUND = 5;

type Side = 'left' | 'right';

/** The next few pairs, and the ones left for later rounds. No text appears twice in a round:
    two tiles reading the same (two words with one translation) can't be told apart. */
function makeRound(pool: MatchPair[]) {
  const round: MatchPair[] = [];
  const rest: MatchPair[] = [];
  const seenLeft = new Set<string>();
  const seenRight = new Set<string>();
  for (const pair of pool) {
    const leftText = pair.a.toLowerCase();
    const rightText = pair.b.toLowerCase();
    if (round.length < ROUND && !seenLeft.has(leftText) && !seenRight.has(rightText)) {
      seenLeft.add(leftText);
      seenRight.add(rightText);
      round.push(pair);
    } else rest.push(pair);
  }
  return {
    round,
    rest,
    leftIds: shuffle(round.map((pair) => pair.id)),
    rightIds: shuffle(round.map((pair) => pair.id)),
  };
}

export default function Match({
  pairs,
  mode,
  onClose,
  onRestart,
}: {
  pairs: MatchPair[];
  mode: 'words' | 'syn';
  onClose: () => void;
  onRestart: () => void;
}) {
  const { t } = useTranslation(exercises);
  const names = useTranslation(learning);
  const [{ round, rest, leftIds, rightIds }, setRound] = useState(() => makeRound(shuffle(pairs)));
  const [done, setDone] = useState<Set<string>>(new Set());
  const [pick, setPick] = useState<Record<Side, string | null>>({ left: null, right: null });
  const [wrong, setWrong] = useState<[string, string] | null>(null);
  const [cleared, setCleared] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const language = pairs[0]?.word?.language ?? 'fr';
  const byId = Object.fromEntries(round.map((pair) => [pair.id, pair]));
  const roundDone = round.length > 0 && done.size === round.length;
  const title = mode === 'syn' ? t('synonyms') : t('matchTranslations');

  function choose(side: Side, id: string) {
    if (done.has(id)) return;
    const next = { ...pick, [side]: pick[side] === id ? null : id };
    setWrong(null);
    const { left: leftId, right: rightId } = next;
    if (!leftId || !rightId) {
      setPick(next);
      return;
    }
    // one tile picked on each side: a pair when both belong to the same entry
    const word = byId[leftId]?.word;
    if (leftId === rightId) {
      setDone((previous) => new Set(previous).add(leftId));
      setCleared((previous) => previous + 1);
      if (word) recordWord(word, true);
    } else {
      setWrong([leftId, rightId]);
      setMistakes((previous) => previous + 1);
      if (word) recordWord(word, false);
    }
    setPick({ left: null, right: null });
  }
  function nextRound() {
    setRound(makeRound(rest));
    setDone(new Set());
    setPick({ left: null, right: null });
    setWrong(null);
  }

  const tile = (side: Side, id: string) => {
    const pair = byId[id];
    if (!pair) return null;
    const isDone = done.has(id);
    const tileClass = [
      'tile',
      (side === 'left' || mode === 'syn') && 'fr',
      isDone && 'done',
      pick[side] === id && 'picked',
      wrong && wrong[side === 'left' ? 0 : 1] === id && 'wrong',
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <button
        type="button"
        key={id}
        className={tileClass}
        disabled={isDone}
        onClick={() => choose(side, id)}
        lang={side === 'left' || mode === 'syn' ? language : 'ru'}
      >
        {side === 'left' ? pair.a : pair.b}
        {side === 'right' && isDone && mode === 'syn' && (
          <span className="kind">
            {pair.kind === 'synonym' ? t('synonymTag') : t('antonymTag')}
          </span>
        )}
      </button>
    );
  };
  const grid = (
    <div className="match">
      <div className="col">{leftIds.map((id) => tile('left', id))}</div>
      <div className="col">{rightIds.map((id) => tile('right', id))}</div>
    </div>
  );

  if (roundDone && !rest.length)
    return (
      <div className="ex">
        <ExerciseHead title={title} onClose={onClose} />
        <p className="score">{t('pairsDone', { count: pairs.length, mistakes })}</p>
        {grid}
        <div className="row-actions">
          <button type="button" className="btn primary" onClick={onRestart}>
            {t('playAgain')}
          </button>
        </div>
      </div>
    );

  return (
    <div className="ex">
      <ExerciseHead title={title} onClose={onClose}>
        <span className="progress">
          {cleared} / {pairs.length}
        </span>
      </ExerciseHead>
      <p className="ru-line">
        {mode === 'syn' ? t('connectPairs') : names.t(`tapWord.${language}`)}
      </p>
      {grid}
      {roundDone && (
        <div className="row-actions">
          <button type="button" className="btn primary" onClick={nextRound}>
            {t('nextPairs')}
          </button>
        </div>
      )}
    </div>
  );
}
