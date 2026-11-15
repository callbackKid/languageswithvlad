import { useEffect, useState } from 'react';
import { useTranslation } from '../i18n/core';
import { app } from '../i18n/messages/app';
import { parseNextLesson } from '../lib/nextLesson';

/** The next lesson's date and time, read from the newest "le cours prochain:" / "next lesson:" line in the document. */
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
      <span className="next-lesson muted" title={t('nextUnconfirmedHint')}>
        {t('nextUnconfirmed')}
      </span>
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
    return <span className="next-lesson now">{t('lessonNow', { time: localTime })}</span>;
  return (
    <span className="next-lesson" title={lesson.start.toLocaleString(locale)}>
      {rich(
        'nextLesson',
        { b: (chunk) => <b>{chunk}</b> },
        { when: lesson.hasTime ? `${day}, ${localTime}` : day }
      )}
      {writtenTime && (
        <span className="zone"> {t('yourTime', { written: writtenTime, time: localTime })}</span>
      )}
    </span>
  );
}
