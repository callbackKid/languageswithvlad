/* One request at a time for the same thing: a screen that asks Claude and is left and opened
   again while the answer is on its way (or run twice by StrictMode) waits for that answer instead
   of paying for another. A request that has ended, answered or failed, is forgotten. */

const pending = new Map<string, Promise<unknown>>();

// The request on its way for this key, or a new one asked with ask.
export const requestOnce = (key: string, ask: () => Promise<unknown>): Promise<unknown> => {
  const asked = pending.get(key) ?? ask().finally(() => pending.delete(key));
  pending.set(key, asked);
  return asked;
};
