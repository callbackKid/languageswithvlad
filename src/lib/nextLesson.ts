/* "le cours prochain: 22.11.2026 18:00 de Paris" or "next lesson: 22/11/2026 18h00 (Moscow)":
   the last such line in the document says when the next lesson is. */

const LINE = /(?:le\s+)?(?:cours|leçon)\s+prochain(?:e)?|next\s+lesson/i;
const DATE_TIME =
  /(\d{1,2})[./-](\d{1,2})[./-](\d{4})(?:[\s,à@at]+(\d{1,2})\s*[:hH.]\s*(\d{2})?)?(.*)$/;

// cities a time may be given in, French and English spellings
const ZONES: [RegExp, string][] = [
  [/paris|france/i, 'Europe/Paris'],
  [/moscou|moscow|москв|msk/i, 'Europe/Moscow'],
  [/londres|london/i, 'Europe/London'],
  [/berlin/i, 'Europe/Berlin'],
  [/kyiv|kiev|kiew/i, 'Europe/Kyiv'],
  [/minsk/i, 'Europe/Minsk'],
  [/tbilissi|tbilisi/i, 'Asia/Tbilisi'],
  [/erevan|yerevan/i, 'Asia/Yerevan'],
  [/istanbul/i, 'Europe/Istanbul'],
  [/duba[iï]/i, 'Asia/Dubai'],
  [/new[\s-]?york/i, 'America/New_York'],
];

/** How long a lesson is shown as happening now after it starts. */
const LESSON_LENGTH = 90 * 60 * 1000;

export interface NextLesson {
  /** the moment it starts; for a date without a time, midnight local time */
  start: Date;
  hasTime: boolean;
  /** the city the time was given in, e.g. "Paris", when it isn't the viewer's own time zone */
  zoneLabel: string | null;
  zone: string | null;
  state: 'upcoming' | 'now' | 'past';
}

/** Minutes the zone is ahead of UTC at that moment. */
function zoneOffsetMinutes(moment: number, zone: string): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    })
      .formatToParts(new Date(moment))
      .map((part) => [part.type, part.value])
  );
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
  return Math.round((asUtc - moment) / 60000);
}

/** A wall-clock time in a zone ("18:00 in Paris") as a real moment. */
function zonedTime(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  zone: string
): Date {
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  // twice, so a time near a daylight-saving switch settles on the right offset
  let moment = wall - zoneOffsetMinutes(wall, zone) * 60000;
  moment = wall - zoneOffsetMinutes(moment, zone) * 60000;
  return new Date(moment);
}

/** null when the document never mentions the next lesson; "unconfirmed" when its newest mention has no usable date. */
export function parseNextLesson(text: string, now = new Date()): NextLesson | 'unconfirmed' | null {
  const lines = text.split('\n').filter((line) => LINE.test(line));
  // only the newest mention counts: "le cours prochain: à confirmer" cancels an older date
  const line = lines[lines.length - 1];
  if (line === undefined) return null;

  const afterLabel = line.slice(line.match(LINE)?.index ?? 0).replace(LINE, '');
  const match = afterLabel.match(DATE_TIME);
  if (!match) return 'unconfirmed';
  const [, dayText, monthText, yearText, hourText, minuteText, rest] = match;
  const day = +dayText,
    month = +monthText,
    year = +yearText;
  if (month < 1 || month > 12 || day < 1 || day > 31) return 'unconfirmed';
  const hasTime = hourText !== undefined;
  const hour = hasTime ? +hourText : 0,
    minute = hasTime ? +(minuteText || 0) : 0;
  if (hour > 23 || minute > 59) return 'unconfirmed';

  const zoneEntry = ZONES.find(([pattern]) => pattern.test(rest));
  const viewerZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const zone = hasTime && zoneEntry ? zoneEntry[1] : null;
  const start = zone
    ? zonedTime(year, month, day, hour, minute, zone)
    : new Date(year, month - 1, day, hour, minute);
  // a date without a time stays current for the whole day
  const end = start.getTime() + (hasTime ? LESSON_LENGTH : 24 * 60 * 60 * 1000);
  const state = now.getTime() >= end ? 'past' : hasTime && now >= start ? 'now' : 'upcoming';
  const sameZone =
    !zone ||
    zoneOffsetMinutes(start.getTime(), zone) === zoneOffsetMinutes(start.getTime(), viewerZone);
  return {
    start,
    hasTime,
    zone,
    zoneLabel: zone && !sameZone ? zone.split('/')[1].replace(/_/g, ' ') : null,
    state,
  };
}
