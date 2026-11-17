import { useState } from 'react';

import { useTranslation } from '../i18n/core';
import { homeCards } from '../i18n/messages/homeCards';
import { type Bank, lessonWords } from '../lib/bank';
import { parseNextLesson } from '../lib/nextLesson';
import { getProgress } from '../lib/progress';
import { load, save } from '../lib/storage';
import type { Lesson } from '../lib/types';
import { prepareRound } from '../lib/warmUp';
import WordQuiz from './WordQuiz';

/** How long before a lesson the round is offered. */
const AHEAD = 24 * 60 * 60 * 1000;

/** The day before a lesson, on Home: a round on the newest lesson's words and the hard words,
    so they are fresh for it. Marked done once a round is finished. */
export default function PrepareCard({
  lesson,
  docText,
  bank,
  ai,
  docId,
}: {
  /** the newest lesson in the document: the one before the next */
  lesson: Lesson;
  docText: string;
  bank: Bank;
  ai: boolean;
  docId: string;
}) {
  const { t, locale } = useTranslation(homeCards);
  const [revising, setRevising] = useState(false);
  const next = parseNextLesson(docText);
  const upcoming = next && next !== 'unconfirmed' && next.state === 'upcoming' ? next : null;
  // one mark per lesson time, so the next lesson starts unmarked
  const doneKey = upcoming ? `prepared:${docId}:${upcoming.start.getTime()}` : '';
  const [done, setDone] = useState(() => !!doneKey && !!load<boolean>(doneKey));
  if (!upcoming || !upcoming.hasTime) return null;
  const until = upcoming.start.getTime() - Date.now();
  if (until <= 0 || until > AHEAD) return null;

  const words = lessonWords(lesson, bank, ai);
  if (revising)
    return (
      <section className="home-card exercise">
        <WordQuiz
          title={t('prepareTitle')}
          closeLabel={t('backHome')}
          onClose={() => setRevising(false)}
          onRoundEnd={() => {
            save(doneKey, true);
            setDone(true);
          }}
          make={() => prepareRound(words, bank, getProgress())}
        />
      </section>
    );

  const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(
    upcoming.start
  );
  const today = upcoming.start.toDateString() === new Date().toDateString();
  return (
    <section className="home-card prepare-card">
      <div className="home-card-head">
        <h2>{today ? t('prepareToday', { time }) : t('prepareTomorrow', { time })}</h2>
      </div>
      <p className="hint">{t('prepareHint', { n: lesson.n })}</p>
      {done && (
        <p className="feedback ok" role="status">
          {t('prepareDone')}
        </p>
      )}
      <div className="row-actions">
        <button
          type="button"
          className={done ? 'btn' : 'btn primary'}
          onClick={() => setRevising(true)}
        >
          {done ? t('prepareAgain') : t('prepareButton')}
        </button>
      </div>
    </section>
  );
}
