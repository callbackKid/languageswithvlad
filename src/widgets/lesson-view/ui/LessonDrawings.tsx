import { lazy, Suspense, useMemo } from 'react';

import { asSavedBoard } from '@/entities/board';
import { isDark, useSettings } from '@/shared/config';
import { paper, useTranslation } from '@/shared/i18n';
import { dayKey } from '@/shared/lib/dates';
import { load, loadChecked } from '@/shared/lib/storage';

const BoardPicture = lazy(() => import('./BoardPicture'));

/** What was drawn on the board and written in lesson mode on the day of this lesson, as this
    device saved it (src/pages/call/ui/LessonMode.tsx keeps both per day). */
export default function LessonDrawings({ docId, date }: { docId: string; date: Date }) {
  const { t } = useTranslation(paper);
  const settings = useSettings();
  const day = dayKey(date);
  const board = useMemo(() => loadChecked(`board:${docId}:${day}`, asSavedBoard), [docId, day]);
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
