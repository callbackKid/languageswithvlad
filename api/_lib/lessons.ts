/* Finding one lesson in a document, so text can be written under it rather than at the end.
   A lesson starts with a line like "12.11.2026 7 Leçon"; the app names it "2026-11-12_7", and a
   second lesson with the same date and number "2026-11-12_7-2".
   Keep the heading words in step with splitLessons in src/lib/parse.ts. */

const HEADING =
  /^\s*(\d{1,2})\.(\d{1,2})\.(\d{4})[ \t]+(\d+)[ \t]*(?:le[çc]on|lesson|lektion|lecci[óo]n|clase|li[çc][ãa]o|aula|lezione)(?![\p{L}])/iu;
const KEY = /^(\d{4})-(\d{2})-(\d{2})_(\d+)(?:-(\d+))?$/;

export interface LessonTarget {
  // "2026-11-12_7" without the repeat number
  base: string;
  // 1 for the first lesson with that date and number, 2 for the second…
  occurrence: number;
}

// The lesson a key names, or null when it isn't a lesson key.
export function lessonTarget(key: unknown): LessonTarget | null {
  const match = typeof key === 'string' ? key.match(KEY) : null;
  if (!match) return null;
  const [, year, month, day, number, repeat] = match;
  return { base: `${year}-${month}-${day}_${Number(number)}`, occurrence: Number(repeat ?? 1) };
}

// The key part of a heading line ("2026-11-12_7"), or null when the line doesn't start a lesson.
export function headingKey(line: string): string | null {
  const match = line.match(HEADING);
  if (!match) return null;
  const [, day, month, year, number] = match;
  const pad = (value: string | undefined) => String(Number(value)).padStart(2, '0');
  return `${year}-${pad(month)}-${pad(day)}_${Number(number)}`;
}

// Which of these lines is the lesson's heading, and which is the next lesson's (null: none).
export function findLesson(
  lines: string[],
  target: LessonTarget
): { start: number; next: number | null } | null {
  let seen = 0;
  for (const [index, line] of lines.entries()) {
    if (headingKey(line) !== target.base || ++seen !== target.occurrence) continue;
    const next = lines.findIndex((other, position) => position > index && headingKey(other));
    return { start: index, next: next === -1 ? null : next };
  }
  return null;
}
