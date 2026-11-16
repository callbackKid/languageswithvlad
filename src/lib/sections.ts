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
  | 'settings'
  | 'call';

/** Every page of the app, in menu order. Their names are translated: app.ts, "section.<id>". */
export const SECTIONS: { id: Section; path: string; inMenu?: false }[] = [
  { id: 'home', path: '/' },
  { id: 'lessons', path: '/lessons' },
  { id: 'practice', path: '/all-lessons' },
  { id: 'mine', path: '/my-words' },
  { id: 'mistakes', path: '/mistakes' },
  { id: 'stats', path: '/stats' },
  { id: 'photo', path: '/photo' },
  { id: 'text', path: '/text' },
  { id: 'discuss', path: '/discuss' },
  { id: 'document', path: '/document' },
  { id: 'tutorial', path: '/tutorial' },
  // opened from ⚙️ on the right of the top bar
  { id: 'settings', path: '/settings', inMenu: false },
  // lesson mode opens from Enter the lesson, not from the menu
  { id: 'call', path: '/call', inMenu: false },
];

/** Sections that show the lessons' content, so they need at least one lesson in the document. */
export const NEEDS_LESSONS: Section[] = [
  'home',
  'lessons',
  'practice',
  'mine',
  'mistakes',
  'stats',
];

/** "/lessons/2026-11-12_7" → the Lessons section and that lesson; null for a path the app doesn't have. */
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

export const lessonPath = (key: string) => '/lessons/' + encodeURIComponent(key);
