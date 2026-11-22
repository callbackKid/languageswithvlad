import { useEffect, useRef } from 'react';

import { type Bank, type Lesson } from '@/entities/lesson';
import { lessonPath } from '@/shared/config';
import { app, useTranslation } from '@/shared/i18n';
import { followLink, hrefFor } from '@/shared/lib/router';
import { LessonView } from '@/widgets/lesson-view';
import { WordsTab } from '@/widgets/word-list';

import Practice from './Practice';

/** Lesson history: one tab with the lessons, oldest to newest, and the open one beside them; the
    other with every downloaded lesson's words and verbs together (Practice). */
export default function Lessons({
  tab,
  lessons,
  lesson,
  bank,
  docId,
  hasClaude,
  canWrite,
}: {
  tab: 'lessons' | 'practice';
  lessons: Lesson[];
  // the lesson in the address, or the newest one
  lesson: Lesson | null;
  bank: Bank;
  docId: string;
  hasClaude: boolean;
  // whether the server can write to the lesson document
  canWrite: boolean;
}) {
  const { t, locale } = useTranslation(app);
  const shortDateFormat = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
  const currentLessonKey = lesson?.key ?? null;
  // The lesson list runs oldest to newest; the open lesson (usually the newest) is scrolled into
  // view, along the row on a phone and down the column on a computer, without moving the page.
  const lessonList = useRef<HTMLElement>(null);
  useEffect(() => {
    const list = lessonList.current;
    const link = list?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!list || !link) return;
    const box = list.getBoundingClientRect();
    const own = link.getBoundingClientRect();
    list.scrollLeft += own.left - box.left - (box.width - own.width) / 2;
    list.scrollTop += own.top - box.top - (box.height - own.height) / 2;
  }, [currentLessonKey, tab, lessons.length]);

  return (
    <div className="history">
      <nav className="tabs history-tabs" aria-label={t('section.lessons')}>
        {(['lessons', 'practice'] as const).map((tabSection) => {
          const tabPath = tabSection === 'lessons' ? '/lessons' : '/all-lessons';
          return (
            <a
              key={tabSection}
              className="tab"
              href={hrefFor(tabPath)}
              aria-current={tab === tabSection ? 'page' : undefined}
              onClick={(event) => followLink(event, tabPath)}
            >
              {tabSection === 'lessons' ? t('lessonsLabel') : t('section.practice')}
            </a>
          );
        })}
      </nav>
      {tab === 'practice' ? (
        <main className="history-practice">
          <Practice bank={bank} hasClaude={hasClaude} />
        </main>
      ) : (
        <div className="layout">
          <nav className="lessons" aria-label={t('lessonsLabel')} ref={lessonList}>
            {lessons.map((listedLesson) => (
              <a
                key={listedLesson.key}
                className="lesson-link"
                href={hrefFor(lessonPath(listedLesson.key))}
                aria-current={listedLesson.key === currentLessonKey ? 'page' : undefined}
                onClick={(event) => followLink(event, lessonPath(listedLesson.key))}
              >
                <span className="n">{listedLesson.n}</span>
                <span className="d">{shortDateFormat.format(listedLesson.date)}</span>
              </a>
            ))}
          </nav>
          <main>
            {lesson && (
              <LessonView
                key={lesson.key}
                lesson={lesson}
                docId={docId}
                hasClaude={hasClaude}
                docWriter={canWrite}
                onAnalysis={bank.put}
                isNewest={lesson.key === lessons[lessons.length - 1]?.key}
                renderWords={(props) => <WordsTab grouped {...props} />}
              />
            )}
          </main>
        </div>
      )}
    </div>
  );
}
