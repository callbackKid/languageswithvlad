import { loadText, save } from '@/shared/lib/storage';

// The latest archive day also uses this date. Keep it available without loading the archive.
export const LATEST_NEWS_DATE = '2026-11-27';
const SEEN_KEY = 'news-seen';

export const hasUnseenNews = () => (loadText(SEEN_KEY) ?? '') < LATEST_NEWS_DATE;
export const markNewsSeen = () => save(SEEN_KEY, LATEST_NEWS_DATE);
