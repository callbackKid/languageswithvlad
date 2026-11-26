import { load, save } from '@/shared/lib/storage';

/* How Lesson history shows its list of lessons on a wide screen: a column beside the lesson or a
   row above it, open or folded. Both are kept on this device; a phone always shows a row. */

export const LESSON_LIST_VIEWS = ['column', 'row'] as const;
export type LessonListView = (typeof LESSON_LIST_VIEWS)[number];

const VIEW_KEY = 'lessons-view';
const OPEN_KEY = 'lessons-open';

// The view kept on this device; the column when there is none or it isn't one of ours.
export const readListView = (): LessonListView => {
  const stored = load<unknown>(VIEW_KEY);
  return LESSON_LIST_VIEWS.find((view) => view === stored) ?? 'column';
};

// Keeps the view chosen on this device.
export const saveListView = (view: LessonListView) => save(VIEW_KEY, view);

// Whether the list is open; open unless it was folded on this device.
export const readListOpen = (): boolean => load<unknown>(OPEN_KEY) !== false;

// Keeps on this device whether the list is open or folded.
export const saveListOpen = (open: boolean) => save(OPEN_KEY, open);
