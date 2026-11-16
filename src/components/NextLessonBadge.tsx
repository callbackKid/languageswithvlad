import { useEffect, useState } from 'react';

import { useTranslation } from '../i18n/core';
import { app } from '../i18n/messages/app';
import { parseNextLesson } from '../lib/nextLesson';

/** The next lesson's date and time, read from the newest "le cours prochain:" / "next lesson:" line in
    the document: a small widget on the left, just under the menu. */
export default function NextLessonBadge({ text }: { text: string }) {
  const { t, rich, locale } = useTranslation(app);
  const [now, setNow] = useState(() => new Date());
  // keeps "today", "now" and "not confirmed" up to date while the page stays open
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const lesson = parseNextLesson(text, now);
  if (!lesson) return null;
  if (lesson === 'unconfirmed' || lesson.state === 'past') {
    return (
      <div className="next-lesson-widget muted" title={t('nextUnconfirmedHint')}>
        <span aria-hidden="true">📅</span>
        <span className="next-lesson">{t('nextUnconfirmed')}</span>
      </div>
    );
  }
  const timeFormat = (timeZone?: string) =>
    new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone });
  const localTime = timeFormat().format(lesson.start);
  // "today", "tomorrow" or "Sun 22 Nov", in the viewer's own calendar
  const startOfDay = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const days = Math.round((startOfDay(lesson.start) - startOfDay(now)) / 86400000);
  const day =
    days === 0
      ? t('today')
      : days === 1
        ? t('tomorrow')
        : new Intl.DateTimeFormat(locale, {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          }).format(lesson.start);
  // the time as written, in the city it was given in
  const writtenTime =
    lesson.zone && lesson.zoneLabel
      ? `${timeFormat(lesson.zone).format(lesson.start)} ${lesson.zoneLabel}`
      : null;
  if (lesson.state === 'now')
    return (
      <div className="next-lesson-widget now" role="status">
        <span className="live-dot" aria-hidden="true" />
        <span className="next-lesson">{t('lessonNow', { time: localTime })}</span>
      </div>
    );
  return (
    <div className="next-lesson-widget" title={lesson.start.toLocaleString(locale)}>
      <span aria-hidden="true">📅</span>
      <span className="next-lesson">
        {rich(
          'nextLesson',
          { b: (chunk) => <b>{chunk}</b> },
          { when: lesson.hasTime ? `${day}, ${localTime}` : day }
        )}
        {writtenTime && (
          <span className="zone"> {t('yourTime', { written: writtenTime, time: localTime })}</span>
        )}
      </span>
    </div>
  );
}
