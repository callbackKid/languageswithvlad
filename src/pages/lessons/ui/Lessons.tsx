import { useEffect, useRef, useState } from 'react';

import { type Bank, type Lesson } from '@/entities/lesson';
import { lessonPath } from '@/shared/config';
import { app, useTranslation } from '@/shared/i18n';
import { followLink, hrefFor } from '@/shared/lib/router';
import { LessonView } from '@/widgets/lesson-view';
import { WordsTab } from '@/widgets/word-list';

import { lessonsText } from '../i18n/lessons';
import {
  type LessonListView,
  readListOpen,
  readListView,
  saveListOpen,
  saveListView,
} from '../model/listLayout';
import Practice from './Practice';

// the buttons' icons on a 16×16 grid, like the app shell's: three boxes in a row, and arrows
// pointing where the list goes (« folds the column, » brings it back; ˄ and ˅ for the row)
const ROW_ICON = 'M2 6h3.2v4H2zM6.4 6h3.2v4H6.4zM10.8 6H14v4h-3.2z';
const FOLD_ICONS = {
  column: { open: 'M7.5 4 3.5 8l4 4M12.5 4l-4 4 4 4', folded: 'M8.5 4l4 4-4 4M3.5 4l4 4-4 4' },
  row: { open: 'M4 10l4-4 4 4', folded: 'M4 6l4 4 4-4' },
} as const;

// An icon for the list's round buttons, in the text colour.
function ListIcon({ path }: { path: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16">
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
  const listText = useTranslation(lessonsText);
  const downloadedLabel = listText.t('downloaded');
  // on a wide screen: the list as a column or a row, open or folded (a phone always shows a row)
  const [listView, setListView] = useState<LessonListView>(readListView);
  const [isListOpen, setListOpen] = useState(readListOpen);
  const currentLessonKey = lesson?.key ?? null;
  // lessons whose words are prepared and kept on this device (the Downloaded lessons tab)
  const downloaded = new Set(bank.lessons.filter((info) => info.ready).map((info) => info.key));
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
  }, [currentLessonKey, tab, lessons.length, listView, isListOpen]);

  function toggleView() {
    const view = listView === 'row' ? 'column' : 'row';
    setListView(view);
    saveListView(view);
  }
  function toggleList() {
    const open = !isListOpen;
    setListOpen(open);
    saveListOpen(open);
  }
  const isRow = listView === 'row';
  const foldLabel = listText.t(isListOpen ? 'hideList' : 'showList');

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
        <div
          className={
            'layout' + (isRow ? ' lessons-as-row' : '') + (isListOpen ? '' : ' lessons-folded')
          }
        >
          <div className="lessons-panel">
            <div className="lessons-controls">
              <button
                type="button"
                className="icon-button"
                aria-pressed={isRow}
                aria-label={listText.t('listAsRow')}
                data-tooltip={listText.t('listAsRow')}
                onClick={toggleView}
              >
                <ListIcon path={ROW_ICON} />
              </button>
              <button
                type="button"
                className="icon-button"
                aria-expanded={isListOpen}
                aria-controls="lesson-list"
                aria-label={foldLabel}
                data-tooltip={foldLabel}
                onClick={toggleList}
              >
                <ListIcon path={FOLD_ICONS[listView][isListOpen ? 'open' : 'folded']} />
              </button>
            </div>
            <nav
              id="lesson-list"
              className="lessons"
              aria-label={t('lessonsLabel')}
              ref={lessonList}
            >
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
                  {downloaded.has(listedLesson.key) && (
                    <span
                      className="lesson-downloaded"
                      role="img"
                      aria-label={downloadedLabel}
                      data-tooltip={downloadedLabel}
                    >
                      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                        <path
                          d="M8 2v8M4.5 6.5 8 10l3.5-3.5M3 13.5h10"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                </a>
              ))}
            </nav>
          </div>
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
