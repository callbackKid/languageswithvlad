import { useEffect, useRef, useState } from 'react';

import { parseNextLesson } from './nextLesson';

/** How often the document is read again while a lesson is on. */
export const LIVE_SYNC_INTERVAL = 60_000;

/** Whether the document's next lesson is happening now (the header shows "Lesson now"); checked
    every minute, so it switches on and off by itself. */
export function useLessonOn(text: string): boolean {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const lesson = parseNextLesson(text, now);
  return lesson !== null && lesson !== 'unconfirmed' && lesson.state === 'now';
}

/** While the lesson is on, reads the document every minute, so what the teacher writes reaches the
    student without pressing Sync. Only while the page is in view, and once more on coming back
    to it. */
export function useLiveSync(on: boolean, sync: () => void) {
  // the newest sync function, so a new one doesn't restart the timer
  const latestSync = useRef(sync);
  useEffect(() => {
    latestSync.current = sync;
  }, [sync]);
  useEffect(() => {
    if (!on) return;
    const syncIfShown = () => {
      if (document.visibilityState === 'visible') latestSync.current();
    };
    const timer = window.setInterval(syncIfShown, LIVE_SYNC_INTERVAL);
    document.addEventListener('visibilitychange', syncIfShown);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', syncIfShown);
    };
  }, [on]);
}
