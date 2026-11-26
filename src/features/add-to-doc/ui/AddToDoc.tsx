import { useState } from 'react';

import { type Lesson } from '@/entities/lesson';
import { api, ApiError } from '@/shared/api';
import { common, useTranslation } from '@/shared/i18n';
import { documentDate } from '@/shared/lib/dates';
import { Button } from '@/shared/ui/controls';

// Where new lessons go: the connected document, the lesson number to use next, and whether the server can write.
export interface DocTarget {
  docId: string;
  nextLessonNumber: number;
  docWriter: string | null;
}

// "13.11.2026 8 Leçon" and the lines under it, in the format the app reads lessons from.
export const lessonText = (lessonNumber: number, lines: string[]): string => {
  const heading = `${documentDate(new Date())} ${lessonNumber} Leçon`;
  return `\n\n${heading}\n${lines
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')}\n`;
};

/** Appends the lines to the document as a new lesson, or, when lessons are given and one is
    picked, under that lesson; then asks the app to sync. */
const AddToDoc = ({
  target,
  lines,
  lessons = [],
  defaultLesson = '',
}: {
  target: DocTarget;
  lines: string[];
  // the document's lessons, oldest first, offered as places for the lines besides a new lesson
  lessons?: Lesson[];
  // the key of the lesson picked at first, instead of a new lesson
  defaultLesson?: string;
}) => {
  const { t, locale } = useTranslation(common);
  const [state, setState] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  // "" for a new lesson, otherwise the key of the lesson the lines go under
  const [place, setPlace] = useState(() =>
    lessons.some((lesson) => lesson.key === defaultLesson) ? defaultLesson : ''
  );
  const chosen = lessons.find((lesson) => lesson.key === place) ?? null;
  const dateFormat = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
  const lessonName = (lesson: Lesson) => lesson.title ?? `${lesson.word} ${lesson.n}`;

  if (!target.docWriter) return <p className="hint">{t('docWriterMissing')}</p>;

  const add = async () => {
    setState('saving');
    try {
      if (chosen) {
        await api.append(target.docId, lines.join('\n'), chosen.key);
        setMessage(t('addedUnder', { lesson: lessonName(chosen) }));
      } else {
        await api.append(target.docId, lessonText(target.nextLessonNumber, lines));
        setMessage(t('addedAs', { number: target.nextLessonNumber }));
      }
      setState('done');
      window.dispatchEvent(new Event('cahier:doc-changed'));
    } catch (error) {
      setState('error');
      setMessage(error instanceof ApiError ? error.message : t('addFailed'));
    }
  };

  return (
    <div className="row-actions add-to-doc">
      {lessons.length > 0 && (
        <label className="add-to-doc-place">
          <span>{t('addWhere')}</span>
          <select
            value={place}
            disabled={state === 'saving' || state === 'done'}
            onChange={(event) => setPlace(event.target.value)}
          >
            <option value="">{t('asNewLesson', { number: target.nextLessonNumber })}</option>
            {[...lessons].reverse().map((lesson) => (
              <option key={lesson.key} value={lesson.key}>
                {t('underLesson', {
                  lesson: lessonName(lesson),
                  date: dateFormat.format(lesson.date),
                })}
              </option>
            ))}
          </select>
        </label>
      )}
      <Button disabled={state === 'saving' || state === 'done' || !lines.length} onClick={add}>
        {state === 'saving'
          ? t('adding')
          : state === 'done'
            ? t('added')
            : chosen
              ? t('addUnder', { lesson: lessonName(chosen) })
              : t('addAsLesson', { number: target.nextLessonNumber })}
      </Button>
      {message && (
        <span className={'hint' + (state === 'error' ? ' err' : '')} role="status">
          {message}
        </span>
      )}
    </div>
  );
};

export default AddToDoc;
