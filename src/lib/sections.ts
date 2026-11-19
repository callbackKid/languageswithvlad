export type Section =
  | 'home'
  | 'lessons'
  | 'practice'
  | 'mine'
  | 'mistakes'
  | 'stats'
  | 'photo'
  | 'text'
  | 'discuss'
  | 'document'
  | 'tutorial'
  | 'news'
  | 'settings'
  | 'call';

// The menu's groups, drawn with a line between them.
export type SectionGroup = 'start' | 'lessons' | 'words' | 'tools' | 'help';

// Every page of the app, in menu order. Their names are translated: app.ts, "section.<id>".
export const SECTIONS: { id: Section; path: string; group: SectionGroup; inMenu?: false }[] = [
  { id: 'home', path: '/', group: 'start' },
  { id: 'lessons', path: '/lessons', group: 'lessons' },
  { id: 'practice', path: '/all-lessons', group: 'lessons' },
  { id: 'discuss', path: '/discuss', group: 'lessons' },
  // hidden from everyone until it is redone; /document still opens it
  { id: 'document', path: '/document', group: 'lessons', inMenu: false },
  { id: 'mine', path: '/my-words', group: 'words' },
  { id: 'mistakes', path: '/mistakes', group: 'words' },
  { id: 'stats', path: '/stats', group: 'words' },
  { id: 'text', path: '/text', group: 'tools' },
  { id: 'photo', path: '/photo', group: 'tools' },
  { id: 'tutorial', path: '/tutorial', group: 'help' },
  { id: 'news', path: '/news', group: 'help' },
  // opened from ⚙️ on the right of the top bar
  { id: 'settings', path: '/settings', group: 'help', inMenu: false },
  // lesson mode opens from Enter the lesson, not from the menu
  { id: 'call', path: '/call', group: 'lessons', inMenu: false },
];

// Sections that show the lessons' content, so they need at least one lesson in the document.
export const NEEDS_LESSONS: Section[] = [
  'home',
  'lessons',
  'practice',
  'mine',
  'mistakes',
  'stats',
];

// "/lessons/2026-11-12_7" → the Lessons section and that lesson; null for a path the app doesn't have.
export function parsePath(path: string): { section: Section; lessonKey: string | null } | null {
  const [first = '', second] = path.split('/').filter(Boolean);
  const entry = SECTIONS.find((candidate) => candidate.path === '/' + first);
  if (!entry || (second && entry.id !== 'lessons')) return null;
  if (!second) return { section: entry.id, lessonKey: null };
  try {
    return { section: entry.id, lessonKey: decodeURIComponent(second) };
  } catch {
    // a broken %-escape typed into the address: not a lesson
    return null;
  }
}

// The address of one lesson's page.
export const lessonPath = (key: string) => '/lessons/' + encodeURIComponent(key);
