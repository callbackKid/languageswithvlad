import { useEffect, useState } from 'react';
import { parseNextLesson } from '../lib/nextLesson';

const dayFormat = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});
const timeFormat = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });

/** "today", "tomorrow" or "Sun 22 Nov", in the viewer's own calendar. */
function dayLabel(date: Date, now: Date): string {
  const startOfDay = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const days = Math.round((startOfDay(date) - startOfDay(now)) / 86400000);
  return days === 0 ? 'today' : days === 1 ? 'tomorrow' : dayFormat.format(date);
}

/** The next lesson's date and time, read from the newest "le cours prochain:" / "next lesson:" line in the document. */
export default function NextLessonBadge({ text }: { text: string }) {
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
      <span
        className="next-lesson muted"
        title="Write “le cours prochain: 22.11.2026 18:00 de Paris” in the document"
      >
        Next lesson: date not confirmed yet
      </span>
    );
  }
  const localTime = timeFormat.format(lesson.start);
  // the time as written, in the city it was given in
  const writtenTime =
    lesson.zone && lesson.zoneLabel
      ? `${new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: lesson.zone }).format(lesson.start)} ${lesson.zoneLabel}`
      : null;
  if (lesson.state === 'now')
    return <span className="next-lesson now">Lesson now · started {localTime}</span>;
  return (
    <span className="next-lesson" title={lesson.start.toString()}>
      Next lesson:{' '}
      <b>
        {dayLabel(lesson.start, now)}
        {lesson.hasTime && <>, {localTime}</>}
      </b>
      {writtenTime && (
        <span className="zone">
          {' '}
          ({writtenTime}, {localTime} your time)
        </span>
      )}
    </span>
  );
}
