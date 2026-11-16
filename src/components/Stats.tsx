import { useMemo } from 'react';

import { useTranslation } from '../i18n/core';
import { pages } from '../i18n/messages/pages';
import type { Bank } from '../lib/bank';
import { isLearned, topMistakes, useProgress, wordKey } from '../lib/progress';
import { isStudied, useSettings } from '../lib/settings';
import type { Lesson } from '../lib/types';
import MistakeList from './MistakeList';
import PageHead, { BankNote } from './PageHead';
import SendToTeacher from './SendToTeacher';

/** Fewer answers than this say too little about a topic to call it weak. */
const MIN_ANSWERS = 4;
const KINDS = ['noun', 'verb', 'adjective', 'adverb', 'expression', 'other'] as const;
type Kind = (typeof KINDS)[number];
const asKind = (kind: string): Kind => (KINDS.includes(kind as Kind) ? (kind as Kind) : 'other');

const percent = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);

function Meter({ value, max, label }: { value: number; max: number; label: string }) {
  const { t } = useTranslation(pages);
  const share = percent(value, max);
  return (
    <div
      className="meter"
      role="meter"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
      title={t('meterTitle', { label, value, max, percent: share })}
    >
      <div className="meter-fill" style={{ width: share + '%' }} />
    </div>
  );
}

interface Row {
  id: string;
  name: string;
  right: number;
  total: number;
}
function addTo(rowsById: Map<string, Row>, id: string, name: string, right: number, wrong: number) {
  const row = rowsById.get(id) || { id, name, right: 0, total: 0 };
  row.right += right;
  row.total += right + wrong;
  rowsById.set(id, row);
}

/** Lowest accuracy first, leaving out topics with too few answers to judge. */
const weakest = (rowsById: Map<string, Row>) =>
  [...rowsById.values()]
    .filter((row) => row.total >= MIN_ANSWERS)
    .sort((first, second) => first.right / first.total - second.right / second.total);

function RankList({ title, rows }: { title: string; rows: Row[] }) {
  const { t } = useTranslation(pages);
  if (!rows.length) return null;
  return (
    <div className="rank">
      <h3>{title}</h3>
      <ul>
        {rows.map((row) => (
          <li key={row.id}>
            <span className="rank-name">{row.name}</span>
            <Meter
              value={row.right}
              max={row.total}
              label={t('rightAnswersOf', { name: row.name })}
            />
            <span className="rank-val">
              {percent(row.right, row.total)}%
              <span className="rank-n">{t('ofTotal', { count: row.total })}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Stats({
  bank,
  lessons,
  docId,
  canWrite,
}: {
  bank: Bank;
  lessons: Lesson[];
  docId: string;
  canWrite: boolean;
}) {
  const { t } = useTranslation(pages);
  const progress = useProgress();
  const settings = useSettings();
  const {
    total,
    learned,
    right,
    answers,
    hard,
    perLesson,
    tenses,
    weakLessons,
    weakKinds,
    topWords,
    topForms,
  } = useMemo(() => {
    const total = bank.words.length;
    const learned = bank.words.filter((word) => isLearned(progress.words[wordKey(word.fr)])).length;
    // only the languages the student learns (Settings)
    const stats = Object.values(progress.words).filter((stat) =>
      isStudied(stat.language, settings)
    );
    const right =
      stats.reduce((sum, wordStat) => sum + wordStat.right, 0) +
      Object.values(progress.forms).reduce((sum, formStat) => sum + formStat.right, 0);
    const answers =
      right +
      stats.reduce((sum, wordStat) => sum + wordStat.wrong, 0) +
      Object.values(progress.forms).reduce((sum, formStat) => sum + formStat.wrong, 0);
    const hard = stats.filter((stat) => stat.hard).length;

    // Per-lesson progress: words learned out of the lesson's words.
    const perLesson = bank.lessons
      .filter((lesson) => lesson.ready)
      .map((lesson) => {
        const lessonWords = bank.words.filter((word) => word.lesson === lesson.key);
        return {
          ...lesson,
          total: lessonWords.length,
          learned: lessonWords.filter((word) => isLearned(progress.words[wordKey(word.fr)])).length,
        };
      })
      .filter((lesson) => lesson.total > 0);

    // Weak topics: accuracy by lesson, by kind of word and by tense.
    const byLesson = new Map<string, Row>(),
      byKind = new Map<string, Row>(),
      byTense = new Map<string, Row>();
    const lessonName = new Map(
      bank.lessons.map((lesson) => [
        lesson.key,
        `${lesson.word} ${lesson.n}${lesson.topic ? `: ${lesson.topic}` : ''}`,
      ])
    );
    for (const stat of stats) {
      const name = lessonName.get(stat.lesson);
      if (name) addTo(byLesson, stat.lesson, name, stat.right, stat.wrong);
      addTo(byKind, asKind(stat.kind), t(`kind.${asKind(stat.kind)}`), stat.right, stat.wrong);
    }
    for (const formStat of settings.studying.includes('fr') ? Object.values(progress.forms) : [])
      addTo(byTense, formStat.t, formStat.t, formStat.right, formStat.wrong);
    const tenses = weakest(byTense);
    const weakLessons = weakest(byLesson).slice(0, 5),
      weakKinds = weakest(byKind);
    const { words: topWords, forms: topForms } = topMistakes(progress);
    return {
      total,
      learned,
      right,
      answers,
      hard,
      perLesson,
      tenses,
      weakLessons,
      weakKinds,
      topWords,
      topForms,
    };
  }, [bank.words, bank.lessons, progress, t, settings]);

  return (
    <>
      <PageHead title={t('statsTitle')}>
        {answers ? t('basedOn', { count: answers }) : null}
      </PageHead>
      <BankNote bank={bank} />

      <div className="kpis">
        <div className="kpi">
          <span className="kpi-label">{t('wordsLearned')}</span>
          <span className="kpi-value">{learned}</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">{t('leftToLearn')}</span>
          <span className="kpi-value">{Math.max(total - learned, 0)}</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">{t('rightAnswers')}</span>
          <span className="kpi-value">{answers ? percent(right, answers) + '%' : '—'}</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">{t('onMyWords')}</span>
          <span className="kpi-value">{hard}</span>
        </div>
      </div>

      <section className="panel solo stats-block">
        <div className="body">
          <div className="meter-head">
            <h2 className="sub-h">{t('vocabulary')}</h2>
            <span className="hint">
              {t('learnedOf', { learned, count: total, percent: percent(learned, total) })}
            </span>
          </div>
          <Meter value={learned} max={total} label={t('wordsLearned')} />
          <p className="legend">{t('learnedRule')}</p>
          {perLesson.length > 0 && (
            <ul className="lesson-progress">
              {perLesson.map((lesson) => (
                <li key={lesson.key}>
                  <span className="rank-name">
                    {lesson.word} {lesson.n}
                    {lesson.topic && <span className="topic-small"> · {lesson.topic}</span>}
                  </span>
                  <Meter
                    value={lesson.learned}
                    max={lesson.total}
                    label={t('lessonWordsLearned', { lesson: `${lesson.word} ${lesson.n}` })}
                  />
                  <span className="rank-val">
                    {lesson.learned}
                    <span className="rank-n"> / {lesson.total}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="panel solo stats-block">
        <div className="body">
          <h2 className="sub-h">{t('weakTopics')}</h2>
          {weakLessons.length || weakKinds.length || tenses.length ? (
            <div className="rank-cols">
              <RankList title={t('lessons')} rows={weakLessons} />
              <RankList title={t('kindsOfWords')} rows={weakKinds} />
              <RankList title={t('tenses')} rows={tenses} />
            </div>
          ) : (
            <p className="empty">{t('notEnough', { count: MIN_ANSWERS })}</p>
          )}
          {(weakLessons.length > 0 || weakKinds.length > 0 || tenses.length > 0) && (
            <p className="legend">{t('weakestFirst')}</p>
          )}
        </div>
      </section>

      <section className="panel solo stats-block">
        <div className="body">
          <h2 className="sub-h">{t('commonMistakes')}</h2>
          {topWords.length || topForms.length ? (
            <MistakeList words={topWords.slice(0, 6)} forms={topForms.slice(0, 4)} />
          ) : (
            <p className="empty">{t('noMistakesRecorded')}</p>
          )}
        </div>
      </section>
      <section className="panel solo">
        <div className="body">
          <SendToTeacher lessons={lessons} docId={docId} canWrite={canWrite} />
        </div>
      </section>
    </>
  );
}
