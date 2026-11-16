import { useMemo, useState } from 'react';

import { useTranslation } from '../i18n/core';
import { exercises } from '../i18n/messages/exercises';
import { getProgress } from '../lib/progress';
import { buildDictation, buildQuiz, pickWords } from '../lib/quiz';
import { canSpeak } from '../lib/speech';
import type { Analysis } from '../lib/types';
import { downloadText } from '../lib/util';
import Flashcards from './Flashcards';
import GapFill from './GapFill';
import Match, { type MatchPair } from './Match';
import Speak from './Speak';
import Star from './Star';
import Transcription from './Transcription';
import WordQuiz from './WordQuiz';

type Exercise = null | 'quiz' | 'cards' | 'match' | 'syn' | 'gap' | 'dictation';

/** The mark of a key word of the lesson (★ in the document). */
export function KeyBadge() {
  const { t } = useTranslation(exercises);
  return <span className="key-word">{t('keyWord')}</span>;
}

/** Tab-separated text Anki imports as cards: word, translation, transcription. */
function ankiText(words: Analysis['words']): string {
  const clean = (text: string) => text.replace(/[\t\r\n]+/g, ' ').trim();
  return words.map((word) => [word.fr, word.ru, word.tr].map(clean).join('\t')).join('\n') + '\n';
}

export default function WordsTab({
  analysis,
  ai,
  onRefresh,
  hidePairs,
}: {
  analysis: Analysis;
  ai: boolean;
  onRefresh?: () => void;
  hidePairs?: boolean;
}) {
  const { t, rich } = useTranslation(exercises);
  // Tracks the words left out, so words that arrive later (more lessons prepared) start picked.
  const [unpicked, setUnpicked] = useState<Set<string>>(() => new Set());
  const [filter, setFilter] = useState('');
  const [exercise, setExercise] = useState<Exercise>(null);
  const [run, setRun] = useState(0);

  const picked = useMemo(
    () => analysis.words.filter((word) => !unpicked.has(word.fr)),
    [analysis.words, unpicked]
  );
  const query = filter.toLowerCase();
  const list = analysis.words.filter(
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
            title={hasPairs ? undefined : t('noPairs')}
            onClick={() => start('syn')}
          >
            {t('synonyms')}
          </button>
        )}
        <button
          type="button"
          className="btn"
          disabled={picked.length < 1 || !ai}
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
        <span className="hint">
          {t('picked', { picked: picked.length, total: analysis.words.length })}
        </span>
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
      </div>
      {list.length ? (
        <ul className="words">
          {list.map((word) => (
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
                    <span className="added" title={t('addedByClaude')}>
                      {' '}
                      ✱
                    </span>
                  )}
                </span>
              </label>
              <Speak text={word.fr} language={word.language ?? 'fr'} />
              <Star word={word} />
            </li>
          ))}
        </ul>
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
      {analysis.words.length > 0 && <p className="legend">{t('starLegend')}</p>}
      <p className="legend legend-actions">
        {picked.length > 0 && (
          <button
            type="button"
            className="btn ghost flush"
            onClick={() => downloadText('words.txt', ankiText(picked))}
            title={t('ankiTitle')}
          >
            {t('ankiExport', { count: picked.length })}
          </button>
        )}
        {onRefresh && (
          <button
            type="button"
            className="btn ghost flush"
            onClick={onRefresh}
            title={t('refreshTitle')}
          >
            {t('refresh')}
          </button>
        )}
      </p>
    </>
  );
}
