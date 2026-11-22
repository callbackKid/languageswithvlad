import { type Section } from './routes';

/* The Tutorial's cards: one per section, and two for a lesson (its words, its verbs). The texts
   are in pages/tutorial/i18n/tutorial.ts under "<id>.title", "<id>.step1"…; each card is the anchor
   #guide-<id>, which the help icon on a page (PageHead's guide) opens. */

export interface Guide {
  section: Section | null;
  // the prefix of its texts, and of its anchor
  id: string;
  icon: string;
  steps: number;
  tips?: number;
  // a small drawing of the screen, with the app's own labels
  mock?: boolean;
  // tips about the teacher's tools, shown only to the teacher
  teacherTips?: readonly number[];
}

// written out "as const" only so the ids become a type; pages use GUIDES below
const GUIDE_LIST = [
  { section: null, id: 'header', icon: '🧭', steps: 6, tips: 1, mock: true },
  { section: 'home', id: 'home', icon: '🏠', steps: 3, tips: 5, mock: true },
  {
    section: 'lessons',
    id: 'lessons',
    icon: '📚',
    steps: 5,
    tips: 10,
    mock: true,
    teacherTips: [7],
  },
  { section: 'lessons', id: 'verbs', icon: '🔤', steps: 4, tips: 3, mock: true },
  { section: 'practice', id: 'all-lessons', icon: '🗂️', steps: 2, mock: true },
  // the Document section is hidden until it is redone; its guide (document.* in tutorial.ts) comes back with it
  { section: 'mine', id: 'my-words', icon: '⭐', steps: 3, tips: 1 },
  { section: 'mistakes', id: 'mistakes', icon: '🎯', steps: 1 },
  { section: 'discuss', id: 'discuss', icon: '💬', steps: 4, tips: 1 },
  { section: 'stats', id: 'stats', icon: '📊', steps: 1 },
  { section: 'text', id: 'text', icon: '📰', steps: 4, tips: 2 },
  { section: 'photo', id: 'photo', icon: '📷', steps: 4, tips: 2, mock: true },
  { section: 'call', id: 'call', icon: '🎥', steps: 7, tips: 8 },
  { section: 'settings', id: 'settings', icon: '⚙️', steps: 4, tips: 1 },
  { section: 'news', id: 'news', icon: '🗞️', steps: 2 },
] as const satisfies readonly Guide[];

export type GuideId = (typeof GUIDE_LIST)[number]['id'];
export const GUIDES: readonly (Guide & { id: GuideId })[] = GUIDE_LIST;

// The Tutorial, opened at one card.
export const guidePath = (id: GuideId) => `/tutorial#guide-${id}`;
