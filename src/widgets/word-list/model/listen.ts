import { load, save } from '@/shared/lib/storage';

// The pause after each word and each translation in Listen, in seconds: time to say it back.
export const LISTEN_PAUSES = [1, 2, 3, 5] as const;
export type ListenPause = (typeof LISTEN_PAUSES)[number];

const PAUSE_KEY = 'listen-pause';

// The pause kept on this device; 2 seconds when there is none or it isn't one of ours.
export const readListenPause = (): ListenPause => {
  const stored = load<unknown>(PAUSE_KEY);
  return LISTEN_PAUSES.find((pause) => pause === stored) ?? 2;
};

// Keeps the pause chosen on this device.
export const saveListenPause = (pause: ListenPause) => save(PAUSE_KEY, pause);
