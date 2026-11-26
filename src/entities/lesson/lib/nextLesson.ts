/* "le cours prochain: 22.11.2026 18:00 de Paris" (or "le prochain cours", and a year of two digits:
   22.11.26), "next lesson: 22/11/2026 18h00 (Moscow)",
   "nächste Stunde: 22.11.2026 18:00 Berlin", "próxima clase: …", "próxima aula: …" or "prossima lezione: …":
   the last such line in the document says when the next lesson is. */

const LINE =
  /(?:l[ae]\s+)?(?:cours|leçon)\s+prochain(?:e)?|(?:l[ae]\s+)?prochain(?:e)?\s+(?:cours|leçon)|next\s+lesson|n(?:ä|ae)chste\s+(?:stunde|lektion|unterricht)|n(?:ä|ae)chster\s+unterricht|pr[óo]xim[ao]\s+(?:clase|lecci[óo]n|aula|li[çc][ãa]o)|prossim[ao]\s+lezione/i;
const DATE_TIME =
  /(\d{1,2})[./-](\d{1,2})[./-](\d{4}|\d{2})(?!\d)(?:[\s,à@at]+(\d{1,2})\s*[:hH.]\s*(\d{2})?)?(.*)$/;

// cities a time may be given in, in the spellings of the app's languages
const ZONES: [RegExp, string][] = [
  [/paris|france/i, 'Europe/Paris'],
  [/moscou|moscow|moskau|москв|msk/i, 'Europe/Moscow'],
  [/londres|london/i, 'Europe/London'],
  [/wien|vienne|vienna/i, 'Europe/Vienna'],
  [/z[uü]rich/i, 'Europe/Zurich'],
  [
    /berlin|m[uü]nchen|munich|hamburg|k[öo]ln|frankfurt|deutschland|germany|allemagne/i,
    'Europe/Berlin',
  ],
  [/madrid|barcelona|espa[ñn]a|spain|espagne|spanien/i, 'Europe/Madrid'],
  [/lisboa|lisbon|lisbonne|lissabon|portugal/i, 'Europe/Lisbon'],
  [/\b(?:roma|rome|rom|milano|milan|mailand)\b|itali[ae]|italy|italien/i, 'Europe/Rome'],
  [/s[ãa]o\s*paulo|rio\s+de\s+janeiro|bra[sz]il|br[ée]sil|brasilien/i, 'America/Sao_Paulo'],
  [/buenos\s*aires|argentin/i, 'America/Argentina/Buenos_Aires'],
  [/m[ée]xico|mexiko|cdmx/i, 'America/Mexico_City'],
  [/kyiv|kiev|kiew/i, 'Europe/Kyiv'],
  [/minsk/i, 'Europe/Minsk'],
  [/tbilissi|tbilisi/i, 'Asia/Tbilisi'],
  [/erevan|yerevan/i, 'Asia/Yerevan'],
  [/istanbul/i, 'Europe/Istanbul'],
  [/duba[iï]/i, 'Asia/Dubai'],
  [/new[\s-]?york/i, 'America/New_York'],
];

// How long a lesson is shown as happening now after it starts.
const LESSON_LENGTH = 90 * 60 * 1000;

export interface NextLesson {
  // the moment it starts; for a date without a time, midnight local time
  start: Date;
  hasTime: boolean;
  // the city the time was given in, e.g. "Paris", when it isn't the viewer's own time zone
  zoneLabel: string | null;
  zone: string | null;
  // finished: it ended earlier today; past: it was on an earlier day, so the date is out of date
  state: 'upcoming' | 'now' | 'finished' | 'past';
}

// Minutes the zone is ahead of UTC at that moment.
const zoneOffsetMinutes = (moment: number, zone: string): number => {
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
  const part = (name: string) => Number(parts[name] ?? 0);
  const asUtc = Date.UTC(
    part('year'),
    part('month') - 1,
    part('day'),
    part('hour'),
    part('minute')
  );
  return Math.round((asUtc - moment) / 60000);
};

// A wall-clock time in a zone ("18:00 in Paris") as a real moment.
const zonedTime = (
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  zone: string
): Date => {
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  // twice, so a time near a daylight-saving switch settles on the right offset
  let moment = wall - zoneOffsetMinutes(wall, zone) * 60000;
  moment = wall - zoneOffsetMinutes(moment, zone) * 60000;
  return new Date(moment);
};

/** A line that says when the next lesson is: the label followed by ":" or a dash
    ("le cours prochain: à confirmer" counts too), or by a date. "Devoirs: lire le texte pour le
    cours prochain" only mentions it, and must not hide the date written above. */
const isNextLessonLine = (line: string): boolean => {
  const match = line.match(LINE);
  if (!match || match.index === undefined) return false;
  const afterLabel = line.slice(match.index + match[0].length);
  return /^\s*[:–—-]/.test(afterLabel) || DATE_TIME.test(afterLabel);
};

// null when the document never mentions the next lesson; "unconfirmed" when its newest mention has no usable date.
export const parseNextLesson = (
  text: string,
  now = new Date()
): NextLesson | 'unconfirmed' | null => {
  const lines = text.split('\n').filter(isNextLessonLine);
  // only the newest mention counts: "le cours prochain: à confirmer" cancels an older date
  const line = lines[lines.length - 1];
  if (line === undefined) return null;

  const afterLabel = line.slice(line.match(LINE)?.index ?? 0).replace(LINE, '');
  const match = afterLabel.match(DATE_TIME);
  if (!match) return 'unconfirmed';
  const [, dayText, monthText, yearText, hourText, minuteText, rest] = match;
  const month = Number(monthText),
    // "22.11.26" is 2026
    year = (yearText ?? '').length === 2 ? 2000 + Number(yearText) : Number(yearText);
  if (month < 1 || month > 12 || Number(dayText) < 1 || Number(dayText) > 31) return 'unconfirmed';
  // "31.02" is a typo for the end of February, not 3 March, as with a lesson's heading
  const day = Math.min(Number(dayText), new Date(year, month, 0).getDate());
  const hasTime = hourText !== undefined;
  const hour = hasTime ? Number(hourText) : 0,
    minute = hasTime ? +(minuteText || 0) : 0;
  if (hour > 23 || minute > 59) return 'unconfirmed';

  const zoneEntry = ZONES.find(([pattern]) => pattern.test(rest ?? ''));
  const viewerZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const zone = hasTime && zoneEntry ? zoneEntry[1] : null;
  const start = zone
    ? zonedTime(year, month, day, hour, minute, zone)
    : new Date(year, month - 1, day, hour, minute);
  // a date without a time stays current for the whole day
  const end = start.getTime() + (hasTime ? LESSON_LENGTH : 24 * 60 * 60 * 1000);
  // after it ends, the lesson reads as finished until that day is over
  const endOfDay = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1).getTime();
  const moment = now.getTime();
  const state =
    moment >= end
      ? hasTime && moment < endOfDay
        ? 'finished'
        : 'past'
      : hasTime && moment >= start.getTime()
        ? 'now'
        : 'upcoming';
  const sameZone =
    !zone ||
    zoneOffsetMinutes(start.getTime(), zone) === zoneOffsetMinutes(start.getTime(), viewerZone);
  return {
    start,
    hasTime,
    zone,
    zoneLabel: zone && !sameZone ? (zone.split('/')[1] ?? zone).replace(/_/g, ' ') : null,
    state,
  };
};
