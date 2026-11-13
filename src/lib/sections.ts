export type Section =
  | 'home'
  | 'lessons'
  | 'practice'
  | 'mine'
  | 'mistakes'
  | 'stats'
  | 'photo'
  | 'document'
  | 'tutorial';

export const SECTIONS: { id: Section; label: string; path: string }[] = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'lessons', label: 'Lessons', path: '/lessons' },
  { id: 'practice', label: 'All lessons', path: '/all-lessons' },
  { id: 'mine', label: 'My words', path: '/my-words' },
  { id: 'mistakes', label: 'Mistakes', path: '/mistakes' },
  { id: 'stats', label: 'Stats', path: '/stats' },
  { id: 'photo', label: 'Photo', path: '/photo' },
  { id: 'document', label: 'Document', path: '/document' },
  { id: 'tutorial', label: 'Tutorial', path: '/tutorial' },
];

// /lessons/2026-11-12_7 → the Lessons section and that lesson
// null for a path the app doesn't have.

export function parsePath(path: string): { section: Section; lessonKey: string | null } | null {
  const [first = '', second] = path.split('/').filter(Boolean);

  const entry = SECTIONS.find((candidate) => candidate.path === '/' + first);

  if (!entry || (second && entry.id !== 'lessons')) return null;
  return { section: entry.id, lessonKey: second ? decodeURIComponent(second) : null };
}

export const lessonPath = (key: string) => '/lessons/' + encodeURIComponent(key);
