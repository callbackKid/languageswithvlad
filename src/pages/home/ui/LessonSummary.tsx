import { useState } from 'react';

import {
  type Bank,
  buildQuiz,
  getRemoved,
  keyWordsFirst,
  type Lesson,
  lessonWords,
  normalizeExtras,
  pickWords,
  readAnalysis,
  withoutRemoved,
} from '@/entities/lesson';
import { getProgress } from '@/entities/word';
import { WordQuiz } from '@/features/quiz';
import { lessonPath } from '@/shared/config';
import { useTranslation } from '@/shared/i18n';
import { daysBetween } from '@/shared/lib/dates';
import { followLink, hrefFor } from '@/shared/lib/router';
import { load, loadChecked, save } from '@/shared/lib/storage';
import { shownTopic } from '@/shared/lib/util';
import { Button, IconButton } from '@/shared/ui/controls';

import { homeCards } from '../i18n/homeCards';

const ROUND = 10;
const SHOWN_WORDS = 8;
// Days from the lesson's date to today: 0 on the day of the lesson.
export const daysSince = (lesson: Lesson, now = new Date()) => daysBetween(lesson.date, now);

/** After a lesson, on Home: what it brought ("Today, lesson 6: 12 new words, 2 verbs"), its
    words and grammar, and a round to start revising them. Shown on the lesson's day and the
    next, until the student hides it. */
const LessonSummary = ({
  lesson,
  bank,
  hasClaude,
  docId,
}: {
  lesson: Lesson;
  bank: Bank;
  hasClaude: boolean;
  docId: string;
}) => {
  const { t, language: uiLanguage } = useTranslation(homeCards);
  const hiddenKey = `summary-hidden:${docId}:${lesson.key}`;
  const [hidden, setHidden] = useState(() => !!load<boolean>(hiddenKey));
  const [revising, setRevising] = useState(false);
  const days = daysSince(lesson);
  const analysis = readAnalysis(lesson.hash);
  if (hidden || days < 0 || days > 1 || !analysis) return null;

  const words = keyWordsFirst(lessonWords(lesson, bank, hasClaude));
  // without the verbs the student took out of the lesson, as lessonWords does for words
  const verbCount = withoutRemoved(analysis, lesson.key, getRemoved()).verbs.length;
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
    ...(verbCount ? [t('verbs', { count: verbCount })] : []),
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
        <IconButton
          className="btn ghost dismiss"
          label={t('hide')}
          onClick={() => {
            save(hiddenKey, true);
            setHidden(true);
          }}
        >
          ✕
        </IconButton>
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
          <Button variant="primary" onClick={() => setRevising(true)}>
            {t('startRevising')}
          </Button>
        )}
        <a className="btn" href={hrefFor(path)} onClick={(event) => followLink(event, path)}>
          {t('openLesson')}
        </a>
      </div>
    </section>
  );
};

export default LessonSummary;
