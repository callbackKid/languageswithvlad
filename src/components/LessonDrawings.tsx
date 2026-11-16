import { lazy, Suspense, useMemo } from 'react';

import { useTranslation } from '../i18n/core';
import { paper } from '../i18n/messages/paper';
import { isDark, useSettings } from '../lib/settings';
import { load } from '../lib/storage';

const BoardPicture = lazy(() => import('./BoardPicture'));

const pad = (value: number) => String(value).padStart(2, '0');

/** What was drawn on the board and written in lesson mode on the day of this lesson, as this
    device saved it (src/components/LessonMode.tsx keeps both per day). */
export default function LessonDrawings({ docId, date }: { docId: string; date: Date }) {
  const { t } = useTranslation(paper);
  const settings = useSettings();
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const board = useMemo(
    () => load<{ elements?: unknown[]; files?: Record<string, unknown> }>(`board:${docId}:${day}`),
    [docId, day]
  );
  const callNotes = useMemo(() => load<string>(`call-notes:${docId}:${day}`) ?? '', [docId, day]);
  const elements = board?.elements ?? [];
  if (!elements.length && !callNotes.trim()) return null;
  return (
    <section className="lesson-drawings">
      <p className="hint">{t('drawingsHint')}</p>
      {elements.length > 0 && (
        <>
          <h3>{t('boardOfLesson')}</h3>
          <Suspense fallback={<p className="hint">{t('loadingPicture')}</p>}>
            <BoardPicture
              elements={elements}
              files={board?.files ?? {}}
              dark={isDark(settings)}
              label={t('boardOfLesson')}
            />
          </Suspense>
        </>
      )}
      {callNotes.trim() && (
        <>
          <h3>{t('callNotesOfLesson')}</h3>
          <pre className="source">{callNotes}</pre>
        </>
      )}
    </section>
  );
}
