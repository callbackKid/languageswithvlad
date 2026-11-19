/* Days in the viewer's own calendar: when a lesson was, how many days are left until the next
   one, and the keys that keep answers, notes and drawings per day. */

const DAY = 24 * 60 * 60 * 1000;
const pad = (value: number) => String(value).padStart(2, '0');

// The moment a local day starts, as a timestamp.
export const startOfDay = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

/** Calendar days from one date to another: 0 on the same day, 1 for the next, negative before.
    Rounded, so a daylight-saving change (a 23- or 25-hour day) still counts as one day. */
export const daysBetween = (from: Date, to: Date): number =>
  Math.round((startOfDay(to) - startOfDay(from)) / DAY);

// A local day as "2026-11-19": the key of answers per day and of each day's notes and board.
export const dayKey = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// A date as a lesson heading in the document writes it: "19.11.2026".
export const documentDate = (date: Date): string =>
  `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;

// The time as "18:05", for the stamps in lesson notes: the same in every language.
export const clockTime = (date: Date): string =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}`;
