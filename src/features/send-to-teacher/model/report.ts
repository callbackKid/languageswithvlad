import {
  type Homework,
  homeworkKey,
  isTaskDone,
  loadDone,
  normalizeWriting,
  writingKey,
} from '@/entities/homework';
import { type Lesson } from '@/entities/lesson';
import { isLearned, type Progress } from '@/entities/word';
import { getSettings, isStudied } from '@/shared/config';
import { homework as homeworkText, translator } from '@/shared/i18n';
import { dayKey, startOfDay } from '@/shared/lib/dates';
import { loadChecked } from '@/shared/lib/storage';

/* The student's report to the teacher, added to the document under the lesson it is about.
   Every line starts with an emoji, or with spaces for the lines of a written answer, and the
   first one with 📝: the lesson's analysis skips such a block (analysisPrompt, localParse), so
   the student's sentences don't become new vocabulary. */

export const REPORT_MARK = '📝';
const MAX_WORDS = 12;
const MAX_FORMS = 8;
const INDENT = '   ';

// The report on everything since the lesson: homework, answers, mistakes, written answers.
export const buildReport = ({
  lesson,
  homework,
  docId,
  progress,
  now = new Date(),
}: {
  lesson: Lesson;
  // the homework written in that lesson, if any
  homework: Homework | null;
  docId: string;
  progress: Progress;
  now?: Date;
}): string => {
  const { t, locale } = translator(homeworkText);
  const settings = getSettings();
  const since = startOfDay(lesson.date);
  const lines: string[] = [];
  const date = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(now);
  lines.push(
    settings.name.trim()
      ? t('reportHeadingNamed', { name: settings.name.trim(), date })
      : t('reportHeading', { date })
  );

  if (homework) {
    const done = loadDone(homeworkKey(docId, lesson.key));
    const doneCount = homework.items.filter((item) => isTaskDone(done, item.text)).length;
    lines.push(t('reportHomework', { done: doneCount, total: homework.items.length }));
    for (const item of homework.items)
      lines.push(`${isTaskDone(done, item.text) ? '✅' : '⬜'} ${item.text}`);
  }

  // answers given since the lesson's day, and the words learned meanwhile
  const answers = Object.entries(progress.days ?? {})
    .filter(([day]) => day >= dayKey(lesson.date))
    .reduce((sum, [, count]) => sum + count, 0);
  const studied = Object.values(progress.words).filter((stat) =>
    isStudied(stat.language, settings)
  );
  const learned = studied.filter((stat) => isLearned(stat) && stat.last >= since).length;
  lines.push(t('reportAnswers', { n: lesson.n, answers, learned }));

  // what is still wrong: missed since the lesson and not learned again after
  const missedWords = studied
    .filter((stat) => stat.wrong > 0 && stat.last >= since && !isLearned(stat))
    .sort((first, second) => second.wrong - first.wrong)
    .slice(0, MAX_WORDS)
    .map((stat) => (stat.ru ? `${stat.fr} (${stat.ru})` : stat.fr));
  const missedForms = Object.values(progress.forms).filter(
    (stat) => stat.wrong > 0 && stat.last >= since && stat.wrong >= stat.right
  );
  const byTense = new Map<string, string[]>();
  for (const form of missedForms.slice(0, MAX_FORMS)) {
    const forms = byTense.get(form.t) ?? [];
    forms.push(`${form.inf} (${form.p}${form.negative ? ', ne … pas' : ''})`);
    byTense.set(form.t, forms);
  }
  if (missedWords.length) lines.push(t('reportWordMistakes', { words: missedWords.join(', ') }));
  for (const [tense, forms] of byTense)
    lines.push(t('reportFormMistakes', { tense, forms: forms.join(', ') }));
  if (!missedWords.length && !byTense.size) lines.push(t('reportNoMistakes'));

  // the written answers, as Claude corrected them
  for (const item of homework?.items.filter((candidate) => candidate.kind === 'writing') ?? []) {
    const writing = loadChecked(writingKey(docId, lesson.key, item.text), normalizeWriting);
    if (!writing?.text.trim()) continue;
    const verdict = writing.check
      ? t('mistakesTitle', { count: writing.check.mistakes.length })
      : t('notChecked');
    lines.push(t('reportWriting', { task: item.text, verdict }));
    const text = writing.check?.corrected ?? writing.text;
    for (const line of text.split('\n').filter((part) => part.trim()))
      lines.push(INDENT + line.trim());
    for (const mistake of writing.check?.mistakes ?? [])
      lines.push(`${INDENT}✗ ${mistake.wrong} → ${mistake.right}`);
  }
  return lines.join('\n');
};
