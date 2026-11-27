import { useEffect, useState } from 'react';

import { type Word } from '@/entities/word';
import { useTranslationLanguage } from '@/shared/config';
import { common, exercises, useTranslation } from '@/shared/i18n';
import { speakAndWait, stopSpeaking, unlockSpeech } from '@/shared/lib/speech';
import { shuffle } from '@/shared/lib/util';
import { Button, Input } from '@/shared/ui/controls';
import ExerciseHead from '@/shared/ui/ExerciseHead';

import { LISTEN_PAUSES, type ListenPause, readListenPause, saveListenPause } from '../model/listen';
import styles from './Listen.module.css';

/** The ticked words read aloud one by one: the word in the language learned, a pause to say it
    back, its translation, another pause, then the next word. Nothing is graded. */
const Listen = ({ words, onClose }: { words: Word[]; onClose: () => void }) => {
  const { t } = useTranslation(exercises);
  const commonText = useTranslation(common);
  const translationOf = useTranslationLanguage();
  const [order, setOrder] = useState(words);
  const [isShuffled, setShuffled] = useState(false);
  const [index, setIndex] = useState(0);
  // what is being read: the word, then its translation
  const [phase, setPhase] = useState<'word' | 'translation'>('word');
  const [isPaused, setPaused] = useState(false);
  const [pause, setPause] = useState<ListenPause>(readListenPause);

  const word = order[index];
  const language = word?.language ?? 'fr';
  const translation = translationOf(language);

  // reads what is due, waits the pause, then moves on; stopped by Pause, Next, ✕ or a new pause
  useEffect(() => {
    if (!word || isPaused) return;
    let alive = true;
    let timer = 0;
    const read =
      phase === 'word' ? speakAndWait(word.fr, language) : speakAndWait(word.ru, translation);
    void read
      .then(
        () =>
          new Promise<void>((resolve) => {
            timer = window.setTimeout(resolve, pause * 1000);
          })
      )
      .then(() => {
        if (!alive) return;
        if (phase === 'word' && word.ru) setPhase('translation');
        else {
          setPhase('word');
          setIndex((previous) => previous + 1);
        }
      });
    return () => {
      alive = false;
      window.clearTimeout(timer);
      stopSpeaking();
    };
  }, [word, phase, isPaused, pause, language, translation]);

  const goTo = (position: number) => {
    setIndex(position);
    setPhase('word');
  };
  const toggleShuffle = () => {
    const shuffled = !isShuffled;
    setShuffled(shuffled);
    setOrder(shuffled ? shuffle(words) : words);
    goTo(0);
  };
  const choosePause = (chosen: ListenPause) => {
    setPause(chosen);
    saveListenPause(chosen);
  };
  const listenAgain = () => {
    unlockSpeech();
    setPaused(false);
    goTo(0);
  };

  const settings = (
    <div className={styles['listen-settings']}>
      <span className="hint" id="listen-pause-label">
        {t('listenPause')}
      </span>
      <span className="seg" role="group" aria-labelledby="listen-pause-label">
        {LISTEN_PAUSES.map((option) => (
          <Button
            variant="unstyled"
            key={option}
            aria-pressed={pause === option}
            onClick={() => choosePause(option)}
          >
            {t('seconds', { count: option })}
          </Button>
        ))}
      </span>
      <label className="check">
        <Input type="checkbox" checked={isShuffled} onChange={toggleShuffle} />
        {t('shuffle')}
      </label>
    </div>
  );

  const head = <ExerciseHead title={t('listen')} onClose={onClose} />;
  if (!word)
    return (
      <div className="ex listen">
        {head}
        <p className="score">{t('listenDone', { count: order.length })}</p>
        {settings}
        <div className="row-actions">
          <Button variant="primary" onClick={listenAgain}>
            {t('listenRestart')}
          </Button>
        </div>
      </div>
    );

  return (
    <div className="ex listen">
      {head}
      <p className="hint">{t('listenProgress', { current: index + 1, total: order.length })}</p>
      <div className={styles['listen-card']} aria-live="polite">
        <p className={styles['listen-word']} lang={language}>
          {word.fr}
        </p>
        <p className={styles['listen-translation']} lang={translation}>
          {phase === 'translation' ? word.ru : ' '}
        </p>
      </div>
      <div className="row-actions">
        <Button
          variant="primary"
          onClick={() => {
            if (isPaused) unlockSpeech();
            setPaused((previous) => !previous);
          }}
        >
          {isPaused ? t('listenContinue') : t('listenStop')}
        </Button>
        <Button onClick={() => goTo(index + 1)}>{commonText.t('next')}</Button>
      </div>
      {settings}
    </div>
  );
};

export default Listen;
