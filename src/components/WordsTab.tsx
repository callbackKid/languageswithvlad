import { useState } from 'react';

import {
  type Analysis,
  buildDictation,
  buildQuiz,
  pickWords,
  removedCount,
  removeWord,
  restore,
  useRemoved,
} from '@/entities/lesson';
import {
  getProgress,
  LEARNED_STREAK,
  Transcription,
  useProgress,
  type Word,
  wordKey,
} from '@/entities/word';
import { useTranslation } from '@/shared/i18n/core';
import { common } from '@/shared/i18n/messages/common';
import { exercises } from '@/shared/i18n/messages/exercises';
import { canSpeak } from '@/shared/lib/speech';
import { downloadText } from '@/shared/lib/util';
import Speak from '@/shared/ui/Speak';

import { groupWords, useWordGroups } from '../lib/wordGroups';
import Flashcards from './Flashcards';
import GapFill from './GapFill';
import Match, { type MatchPair } from './Match';
import Star from './Star';
import WordQuiz from './WordQuiz';

type Exercise = null | 'quiz' | 'cards' | 'match' | 'syn' | 'gap' | 'dictation';

// The mark of a key word of the lesson (★ in the document).
export function KeyBadge() {
  const { t } = useTranslation(exercises);
  return <span className="key-word">{t('keyWord')}</span>;
}

// How close a word on Words to learn is to leaving it: ●●○ for 2 right answers in a row of the 3 needed.
function LearnProgress({ word }: { word: Word }) {
  const { t } = useTranslation(exercises);
  const streak = Math.min(useProgress().words[wordKey(word.fr)]?.streak ?? 0, LEARNED_STREAK);
  const label = t('learnProgress', { count: streak, total: LEARNED_STREAK });
  return (
    <span
      className="learn-progress"
      role="img"
      aria-label={label}
      data-tooltip={label}
      tabIndex={0}
    >
      {'●'.repeat(streak) + '○'.repeat(LEARNED_STREAK - streak)}
    </span>
  );
}

// Tab-separated text Anki imports as cards: word, translation, transcription.
function ankiText(words: Analysis['words']): string {
  const clean = (text: string) => text.replace(/[\t\r\n]+/g, ' ').trim();
  return words.map((word) => [word.fr, word.ru, word.tr].map(clean).join('\t')).join('\n') + '\n';
}

// A lesson's words, with the exercises on the ones ticked.
export default function WordsTab({
  analysis,
  hasClaude,
  onRefresh,
  hidePairs,
  showProgress = false,
  grouped = false,
  lessonKey,
}: {
  analysis: Analysis;
  hasClaude: boolean;
  onRefresh?: () => void;
  hidePairs?: boolean;
  // Words to learn: each word shows its right answers in a row towards leaving the list
  showProgress?: boolean;
  // the words under groups by meaning, which Claude makes, with a group to choose in the filters
  grouped?: boolean;
  // one lesson's own list: its words can be taken out of it (✕) and brought back
  lessonKey?: string;
}) {
  const { t, rich, language: uiLanguage } = useTranslation(exercises);
  const commonText = useTranslation(common);
  // Tracks the words left out, so words that arrive later (more lessons prepared) start picked.
  const [unpicked, setUnpicked] = useState<Set<string>>(() => new Set());
  const [filter, setFilter] = useState('');
  // the name of the group chosen in the filters; null for every group
  const [chosenGroup, setChosenGroup] = useState<string | null>(null);
  const [exercise, setExercise] = useState<Exercise>(null);
  const [run, setRun] = useState(0);
  const removedWords = removedCount(useRemoved(), 'words', lessonKey ? [lessonKey] : []);
  const grouping = useWordGroups(analysis.words, grouped && hasClaude, uiLanguage);
  const { groupOf } = grouping;

  const groups = grouped ? groupWords(analysis.words, groupOf) : [];
  // no group to show before the first answer, or without Claude
  const hasGroups = groups.some((group) => group.name);
  // a group that is gone (its words left the list) stops filtering
  const group =
    hasGroups && groups.some((listed) => listed.name === chosenGroup) ? chosenGroup : null;
  // the chosen group's words are the ones the exercises use
  const shown =
    group === null ? analysis.words : (groups.find((listed) => listed.name === group)?.words ?? []);
  const picked = shown.filter((word) => !unpicked.has(word.fr));
  const query = filter.toLowerCase();
  const list = shown.filter(
    (word) =>
      !query || word.fr.toLowerCase().includes(query) || word.ru.toLowerCase().includes(query)
  );
  const hasPairs = analysis.pairs.length >= 2;
  const start = (kind: Exercise) => {
    setExercise(kind);
    setRun((previous) => previous + 1);
  };
  const close = () => setExercise(null);

  if (exercise === 'quiz')
    return (
      <WordQuiz
        key={run}
        title={t('quiz')}
        onClose={close}
        make={() => buildQuiz(pickWords(picked, getProgress(), 10), analysis.words)}
      />
    );
  if (exercise === 'dictation')
    return (
      <WordQuiz
        key={run}
        title={t('dictation')}
        onClose={close}
        make={() => buildDictation(pickWords(picked, getProgress(), 10))}
      />
    );
  if (exercise === 'cards')
    return <Flashcards key={run} words={picked} onClose={close} onRestart={() => start('cards')} />;
  if (exercise === 'match' || exercise === 'syn') {
    const pairs: MatchPair[] =
      exercise === 'syn'
        ? analysis.pairs.map((pair, index) => ({
            id: 'p' + index,
            a: pair.a,
            b: pair.b,
            kind: pair.kind,
          }))
        : picked.map((word, index) => ({ id: 'w' + index, a: word.fr, b: word.ru, word }));
    return (
      <Match
        key={run}
        pairs={pairs}
        mode={exercise === 'syn' ? 'syn' : 'words'}
        onClose={close}
        onRestart={() => start(exercise)}
      />
    );
  }
  if (exercise === 'gap')
    return <GapFill key={run} words={picked} onClose={close} onRestart={() => start('gap')} />;

  const toggle = (fr: string) =>
    setUnpicked((previous) => {
      const updated = new Set(previous);
      if (updated.has(fr)) updated.delete(fr);
      else updated.add(fr);
      return updated;
    });

  return (
    <>
      <div className="ex-bar">
        <button
          type="button"
          className="btn primary"
          disabled={picked.length < 1}
          onClick={() => start('quiz')}
        >
          {t('quiz')}
        </button>
        <button
          type="button"
          className="btn"
          disabled={picked.length < 1}
          onClick={() => start('cards')}
        >
          {t('flashcards')}
        </button>
        <button
          type="button"
          className="btn"
          disabled={picked.length < 2}
          onClick={() => start('match')}
        >
          {t('matchTranslations')}
        </button>
        {!(hidePairs && !hasPairs) && (
          <button
            type="button"
            className="btn"
            disabled={!hasPairs}
            data-tooltip={hasPairs ? undefined : t('noPairs')}
            onClick={() => start('syn')}
          >
            {t('synonyms')}
          </button>
        )}
        <button
          type="button"
          className="btn"
          disabled={picked.length < 1 || !hasClaude}
          onClick={() => start('gap')}
        >
          {t('fillGap')}
        </button>
        {canSpeak && (
          <button
            type="button"
            className="btn"
            disabled={picked.length < 1}
            onClick={() => start('dictation')}
          >
            {t('dictation')}
          </button>
        )}
        <span className="hint">{t('picked', { picked: picked.length, total: shown.length })}</span>
      </div>
      <div className="sel-bar">
        <button type="button" className="btn ghost" onClick={() => setUnpicked(new Set())}>
          {t('pickAll')}
        </button>
        <button
          type="button"
          className="btn ghost"
          onClick={() => setUnpicked(new Set(analysis.words.map((word) => word.fr)))}
        >
          {t('clear')}
        </button>
        <input
          type="search"
          placeholder={t('filterWords')}
          aria-label={t('filterWords')}
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
        {hasGroups && (
          <select
            aria-label={t('groupFilter')}
            value={
              group === null ? '' : String(groups.findIndex((listed) => listed.name === group))
            }
            onChange={(event) => {
              const index = event.target.value;
              setChosenGroup(index === '' ? null : (groups[Number(index)]?.name ?? null));
            }}
          >
            <option value="">{t('allGroups')}</option>
            {groups.map((listed, index) => (
              <option key={listed.name} value={index}>
                {t('groupOption', {
                  name: listed.name || t('otherGroup'),
                  count: listed.words.length,
                })}
              </option>
            ))}
          </select>
        )}
      </div>
      {grouping.state === 'loading' && (
        <p className="hint grouping-status" role="status">
          <span className="spinner" aria-hidden="true" /> {t('grouping')}
        </p>
      )}
      {grouping.state === 'error' && (
        <div className="note err" role="alert">
          <p>{t('groupingFailed')}</p>
          <button type="button" className="btn" onClick={grouping.retry}>
            {commonText.t('tryAgain')}
          </button>
        </div>
      )}
      {list.length ? (
        (hasGroups ? groupWords(list, groupOf) : [{ name: '', words: list }]).map((listed) => (
          <section
            key={listed.name}
            className="word-group"
            aria-label={hasGroups ? listed.name || t('otherGroup') : undefined}
          >
            {hasGroups && (
              <h3 className="word-group-name">
                {listed.name || t('otherGroup')}
                <span className="count">{listed.words.length}</span>
              </h3>
            )}
            <ul className="words">
              {listed.words.map((word) => (
                <li key={word.fr} className="word-row">
                  <label className="word">
                    <input
                      type="checkbox"
                      checked={!unpicked.has(word.fr)}
                      onChange={() => toggle(word.fr)}
                    />
                    <span className="fr" lang={word.language ?? 'fr'}>
                      {word.fr}
                      {word.key && (
                        <>
                          {' '}
                          <KeyBadge />
                        </>
                      )}
                      {word.tr && (
                        <>
                          {' '}
                          <Transcription tr={word.tr} />
                        </>
                      )}
                    </span>
                    <span className="ru" lang="ru">
                      {word.ru || '—'}
                      {word.added && (
                        <span className="added" data-tooltip={t('addedByClaude')}>
                          {' '}
                          ✱
                        </span>
                      )}
                    </span>
                  </label>
                  {showProgress && <LearnProgress word={word} />}
                  <Speak text={word.fr} language={word.language ?? 'fr'} />
                  <Star word={word} />
                  {lessonKey && (
                    <button
                      type="button"
                      className="row-remove"
                      data-tooltip={t('removeWord')}
                      aria-label={t('removeWordLabel', { word: word.fr })}
                      onClick={() => removeWord(lessonKey, word.fr)}
                    >
                      ✕
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))
      ) : (
        <p className="empty">{analysis.words.length ? t('noMatch') : t('noVocabulary')}</p>
      )}
      {analysis.words.some((word) => word.added) && (
        <p className="legend">
          {rich('addedLegend', {}, { mark: <span className="added">✱</span> })}
        </p>
      )}
      {analysis.words.some((word) => word.key) && (
        <p className="legend">{rich('keyLegend', {}, { mark: <KeyBadge /> })}</p>
      )}
      {/* on Words to learn every word is starred already: the dots need explaining instead */}
      {analysis.words.length > 0 && (
        <p className="legend">
          {showProgress ? t('progressLegend', { total: LEARNED_STREAK }) : t('starLegend')}
        </p>
      )}
      <p className="legend legend-actions">
        {picked.length > 0 && (
          <button
            type="button"
            className="btn ghost flush"
            onClick={() => downloadText('words.txt', ankiText(picked))}
            data-tooltip={t('ankiTitle')}
          >
            {t('ankiExport', { count: picked.length })}
          </button>
        )}
        {lessonKey && removedWords > 0 && (
          <button
            type="button"
            className="btn ghost flush"
            onClick={() => restore('words', [lessonKey])}
          >
            {t('restoreWords', { count: removedWords })}
          </button>
        )}
        {onRefresh && (
          <button
            type="button"
            className="btn ghost flush"
            onClick={onRefresh}
            data-tooltip={t('refreshTitle')}
          >
            {t('refresh')}
          </button>
        )}
      </p>
    </>
  );
}
