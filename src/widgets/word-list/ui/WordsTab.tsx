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
import { GapFill } from '@/features/gap-fill';
import {
  canMakeGroupExercise,
  GroupExercise,
  makeExerciseText,
  MIN_GROUP_WORDS,
} from '@/features/make-exercise';
import { WordQuiz } from '@/features/quiz';
import { Star } from '@/features/star-word';
import { useTranslationLanguage } from '@/shared/config';
import { common, exercises, useTranslation } from '@/shared/i18n';
import { canSpeak, unlockSpeech } from '@/shared/lib/speech';
import { downloadText } from '@/shared/lib/util';
import { Button, IconButton } from '@/shared/ui/controls';
import InlineConfirm from '@/shared/ui/InlineConfirm';
import Speak from '@/shared/ui/Speak';

import { groupWords, useWordGroups } from '../model/wordGroups';
import Flashcards from './Flashcards';
import Listen from './Listen';
import Match, { type MatchPair } from './Match';
import WordBlitz from './WordBlitz';

type Exercise =
  | null
  | 'quiz'
  | 'cards'
  | 'match'
  | 'syn'
  | 'gap'
  | 'blitz'
  | 'dictation'
  | 'group'
  | 'listen';

// The mark of a key word of the lesson (★ in the document).
export const KeyBadge = () => {
  const { t } = useTranslation(exercises);
  return <span className="key-word">{t('keyWord')}</span>;
};

// The button next to a group's name: a round by Claude on its ticked words, once there are enough.
const GroupButton = ({
  name,
  words,
  onStart,
}: {
  name: string;
  words: Word[];
  onStart: (round: { name: string; words: Word[] }) => void;
}) => {
  const { t } = useTranslation(makeExerciseText);
  // too few: one note over the list says why (groupNote), rather than one under every group
  if (!canMakeGroupExercise(words)) return null;
  return (
    <Button
      variant="ghost"
      className="word-group-exercise"
      aria-label={t('groupLabel', { name })}
      data-tooltip={t('groupTooltip')}
      onClick={() => onStart({ name, words })}
    >
      {t('groupButton')}
    </Button>
  );
};

// How close a word on Words to learn is to leaving it: ●●○ for 2 right answers in a row of the 3 needed.
const LearnProgress = ({ word }: { word: Word }) => {
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
};

// Tab-separated text Anki imports as cards: word, translation, transcription.
const ankiText = (words: Analysis['words']): string => {
  const clean = (text: string) => text.replace(/[\t\r\n]+/g, ' ').trim();
  return words.map((word) => [word.fr, word.ru, word.tr].map(clean).join('\t')).join('\n') + '\n';
};

// A lesson's words, with the exercises on the ones ticked.
const WordsTab = ({
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
}) => {
  const { t, rich, language: uiLanguage } = useTranslation(exercises);
  const commonText = useTranslation(common);
  const exerciseText = useTranslation(makeExerciseText);
  const translationOf = useTranslationLanguage();
  // Tracks the words left out, so words that arrive later (more lessons prepared) start picked.
  const [unpicked, setUnpicked] = useState<Set<string>>(() => new Set());
  const [filter, setFilter] = useState('');
  // the name of the group chosen in the filters; null for every group
  const [chosenGroup, setChosenGroup] = useState<string | null>(null);
  const [exercise, setExercise] = useState<Exercise>(null);
  const [run, setRun] = useState(0);
  // the group a round by Claude is on: its words as they were ticked when the button was pressed
  // the word whose ✕ was pressed: its row asks before taking it out
  const [removing, setRemoving] = useState<string | null>(null);
  const [groupRound, setGroupRound] = useState<{ name: string; words: Word[] } | null>(null);
  const removedWords = removedCount(useRemoved(), 'words', lessonKey ? [lessonKey] : []);
  const grouping = useWordGroups(analysis.words, grouped && hasClaude, uiLanguage);
  const { groupOf } = grouping;

  const groups = grouped ? groupWords(analysis.words, groupOf) : [];
  // no group to show before the first answer, or without Claude
  const hasGroups = groups.some((group) => group.name);
  // a group's ticked words: the whole group, not only those Filter words shows
  const tickedOf = (name: string) =>
    (groups.find((candidate) => candidate.name === name)?.words ?? []).filter(
      (word) => !unpicked.has(word.fr)
    );
  // some group has too few ticked words for its Exercise: one note over the list says why
  const hasSmallGroup =
    hasClaude && hasGroups && groups.some((listed) => !canMakeGroupExercise(tickedOf(listed.name)));
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
  if (exercise === 'group' && groupRound)
    return (
      <GroupExercise key={run} words={groupRound.words} name={groupRound.name} onClose={close} />
    );
  if (exercise === 'listen') return <Listen key={run} words={picked} onClose={close} />;
  if (exercise === 'blitz')
    return <WordBlitz key={run} words={picked} onClose={close} onRestart={() => start('blitz')} />;

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
        <Button variant="primary" disabled={picked.length < 1} onClick={() => start('quiz')}>
          {t('quiz')}
        </Button>
        <Button disabled={picked.length < 1} onClick={() => start('cards')}>
          {t('flashcards')}
        </Button>
        <Button disabled={picked.length < 2} onClick={() => start('match')}>
          {t('matchTranslations')}
        </Button>
        {!(hidePairs && !hasPairs) && (
          <Button
            disabled={!hasPairs}
            data-tooltip={hasPairs ? undefined : t('noPairs')}
            onClick={() => start('syn')}
          >
            {t('synonyms')}
          </Button>
        )}
        <Button disabled={picked.length < 1 || !hasClaude} onClick={() => start('gap')}>
          {t('fillGap')}
        </Button>
        <Button disabled={picked.length < 1 || !hasClaude} onClick={() => start('blitz')}>
          {t('blitz')}
        </Button>
        {canSpeak && (
          <Button disabled={picked.length < 1} onClick={() => start('dictation')}>
            {t('dictation')}
          </Button>
        )}
        {canSpeak && (
          <Button
            disabled={picked.length < 1}
            onClick={() => {
              // on the tap itself, so an iPhone lets the read-through speak
              unlockSpeech();
              start('listen');
            }}
          >
            {t('listen')}
          </Button>
        )}
        <span className="hint">{t('picked', { picked: picked.length, total: shown.length })}</span>
      </div>
      <div className="sel-bar">
        <Button variant="ghost" onClick={() => setUnpicked(new Set())}>
          {t('pickAll')}
        </Button>
        <Button
          variant="ghost"
          onClick={() => setUnpicked(new Set(analysis.words.map((word) => word.fr)))}
        >
          {t('clear')}
        </Button>
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
      {hasSmallGroup && (
        <p className="hint word-group-note">
          {exerciseText.t('groupNote', { count: MIN_GROUP_WORDS })}
        </p>
      )}
      {grouping.state === 'loading' && (
        <p className="hint grouping-status" role="status">
          <span className="spinner" aria-hidden="true" /> {t('grouping')}
        </p>
      )}
      {grouping.state === 'error' && (
        <div className="note err" role="alert">
          <p>{t('groupingFailed')}</p>
          <Button onClick={grouping.retry}>{commonText.t('tryAgain')}</Button>
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
              <div className="word-group-head">
                <h2 className="word-group-name">
                  {listed.name || t('otherGroup')}
                  <span className="count">{listed.words.length}</span>
                </h2>
                {hasClaude && (
                  <GroupButton
                    name={listed.name || t('otherGroup')}
                    // the whole group's ticked words, not only those Filter words shows
                    words={tickedOf(listed.name)}
                    onStart={(round) => {
                      setGroupRound(round);
                      start('group');
                    }}
                  />
                )}
              </div>
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
                    <span className="ru" data-no-word-actions lang={translationOf(word.language)}>
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
                    <IconButton
                      className="row-remove"
                      tooltip={t('removeWord')}
                      label={t('removeWordLabel', { word: word.fr })}
                      aria-expanded={removing === word.fr}
                      onClick={() => setRemoving(removing === word.fr ? null : word.fr)}
                    >
                      ✕
                    </IconButton>
                  )}
                  {lessonKey && removing === word.fr && (
                    <InlineConfirm
                      question={t('removeWordConfirm', { word: word.fr })}
                      yesLabel={t('removeWord')}
                      onYes={() => {
                        removeWord(lessonKey, word.fr);
                        setRemoving(null);
                      }}
                      onNo={() => setRemoving(null)}
                    />
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
          <Button
            variant="ghost"
            onClick={() => downloadText('words.txt', ankiText(picked))}
            data-tooltip={t('ankiTitle')}
          >
            {t('ankiExport', { count: picked.length })}
          </Button>
        )}
        {lessonKey && removedWords > 0 && (
          <Button variant="ghost" onClick={() => restore('words', [lessonKey])}>
            {t('restoreWords', { count: removedWords })}
          </Button>
        )}
        {onRefresh && (
          <Button variant="ghost" onClick={onRefresh} data-tooltip={t('refreshTitle')}>
            {t('refresh')}
          </Button>
        )}
      </p>
    </>
  );
};

export default WordsTab;
