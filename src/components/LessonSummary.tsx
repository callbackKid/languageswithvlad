import { useState } from 'react';

import { useTranslation } from '../i18n/core';
import { homeCards } from '../i18n/messages/homeCards';
import { type Bank, lessonWords, readAnalysis } from '../lib/bank';
import { daysBetween } from '../lib/dates';
import { normalizeExtras } from '../lib/parse';
import { getProgress } from '../lib/progress';
import { buildQuiz, keyWordsFirst, pickWords } from '../lib/quiz';
import { followLink, hrefFor } from '../lib/router';
import { lessonPath } from '../lib/sections';
import { load, loadChecked, save } from '../lib/storage';
import type { Lesson } from '../lib/types';
import { shownTopic } from '../lib/util';
import WordQuiz from './WordQuiz';

const ROUND = 10;
const SHOWN_WORDS = 8;
// Days from the lesson's date to today: 0 on the day of the lesson.
export const daysSince = (lesson: Lesson, now = new Date()) => daysBetween(lesson.date, now);

/** After a lesson, on Home: what it brought ("Today, lesson 6: 12 new words, 2 verbs"), its
    words and grammar, and a round to start revising them. Shown on the lesson's day and the
    next, until the student hides it. */
export default function LessonSummary({
  lesson,
  bank,
  hasClaude,
  docId,
}: {
  lesson: Lesson;
  bank: Bank;
  hasClaude: boolean;
  docId: string;
}) {
  const { t, language: uiLanguage } = useTranslation(homeCards);
  const hiddenKey = `summary-hidden:${docId}:${lesson.key}`;
  const [hidden, setHidden] = useState(() => !!load<boolean>(hiddenKey));
  const [revising, setRevising] = useState(false);
  const days = daysSince(lesson);
  const analysis = readAnalysis(lesson.hash);
  if (hidden || days < 0 || days > 1 || !analysis) return null;

  const words = keyWordsFirst(lessonWords(lesson, bank, hasClaude));
  if (revising)
    return (
      <section className="home-card exercise">
        <WordQuiz
          title={t('revisingTitle', { n: lesson.n })}
          closeLabel={t('backHome')}
          onClose={() => setRevising(false)}
          make={() =>
            buildQuiz(
              pickWords(words, getProgress(), ROUND),
              bank.words.length >= 4 ? bank.words : words
            )
          }
        />
      </section>
    );

  const counts = [
    t('newWords', { count: words.length }),
    ...(analysis.verbs.length ? [t('verbs', { count: analysis.verbs.length })] : []),
  ].join(', ');
  // grammar is known once the lesson's Grammar tab has been read, in this interface language
  const grammar =
    loadChecked(`extras:${lesson.hash}:${uiLanguage}`, normalizeExtras)?.grammar ?? [];
  const path = lessonPath(lesson.key);
  return (
    <section className="home-card lesson-summary">
      <div className="home-card-head">
        <h2>
          {days === 0
            ? t('summaryToday', { n: lesson.n, counts })
            : t('summaryYesterday', { n: lesson.n, counts })}
        </h2>
        <button
          type="button"
          className="btn ghost"
          data-tooltip={t('hide')}
          aria-label={t('hide')}
          onClick={() => {
            save(hiddenKey, true);
            setHidden(true);
          }}
        >
          ✕
        </button>
      </div>
      {shownTopic(analysis.topic, uiLanguage) && (
        <p className="hint">{t('topic', { topic: analysis.topic })}</p>
      )}
      {grammar.length > 0 && (
        <p className="hint" lang={analysis.language}>
          {t('grammar', { points: grammar.map((rule) => rule.title).join(' · ') })}
        </p>
      )}
      {words.length > 0 && (
        <ul className="summary-words" lang={analysis.language}>
          {words.slice(0, SHOWN_WORDS).map((word) => (
            <li key={word.fr} className={word.key ? 'key-chip' : undefined}>
              {word.fr}
            </li>
          ))}
          {words.length > SHOWN_WORDS && <li className="more">+{words.length - SHOWN_WORDS}</li>}
        </ul>
      )}
      <div className="row-actions">
        {words.length > 0 && (
          <button type="button" className="btn primary" onClick={() => setRevising(true)}>
            {t('startRevising')}
          </button>
        )}
        <a className="btn" href={hrefFor(path)} onClick={(event) => followLink(event, path)}>
          {t('openLesson')}
        </a>
      </div>
    </section>
  );
}
