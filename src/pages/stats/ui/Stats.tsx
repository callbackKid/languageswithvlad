import { useMemo } from 'react';

import { type Bank, BankNote, type Lesson } from '@/entities/lesson';
import { isLearned, MistakeList, topMistakes, useProgress, wordKey } from '@/entities/word';
import { SendToTeacher } from '@/features/send-to-teacher';
import { isStudied, isVerbLanguage, TENSES_BY_LANGUAGE, useSettings } from '@/shared/config';
import { pages, useTranslation } from '@/shared/i18n';
import { shownTopic } from '@/shared/lib/util';
import PageHead from '@/shared/ui/PageHead';

import styles from './Stats.module.css';

// Fewer answers than this say too little about a topic to call it weak.
const MIN_ANSWERS = 4;
const KINDS = ['noun', 'verb', 'adjective', 'adverb', 'expression', 'other'] as const;
type Kind = (typeof KINDS)[number];
const asKind = (kind: string): Kind => (KINDS.includes(kind as Kind) ? (kind as Kind) : 'other');

const percent = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);

const Meter = ({ value, max, label }: { value: number; max: number; label: string }) => {
  const { t } = useTranslation(pages);
  const share = percent(value, max);
  return (
    <div
      className={styles.meter}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
      data-tooltip={t('meterTitle', { label, value, max, percent: share })}
    >
      <div className={styles['meter-fill']} style={{ width: share + '%' }} />
    </div>
  );
};

interface Row {
  id: string;
  name: string;
  right: number;
  total: number;
}
const addTo = (
  rowsById: Map<string, Row>,
  id: string,
  name: string,
  right: number,
  wrong: number
) => {
  const row = rowsById.get(id) || { id, name, right: 0, total: 0 };
  row.right += right;
  row.total += right + wrong;
  rowsById.set(id, row);
};

// Lowest accuracy first, leaving out topics with too few answers to judge.
const weakest = (rowsById: Map<string, Row>) =>
  [...rowsById.values()]
    .filter((row) => row.total >= MIN_ANSWERS)
    .sort((first, second) => first.right / first.total - second.right / second.total);

const RankList = ({ title, rows }: { title: string; rows: Row[] }) => {
  const { t } = useTranslation(pages);
  if (!rows.length) return null;
  return (
    <div className={styles.rank}>
      <h3>{title}</h3>
      <ul>
        {rows.map((row) => (
          <li key={row.id}>
            <span className={styles['rank-name']}>{row.name}</span>
            <Meter
              value={row.right}
              max={row.total}
              label={t('rightAnswersOf', { name: row.name })}
            />
            <span className={styles['rank-val']}>
              {percent(row.right, row.total)}%
              <span className={styles['rank-n']}>{t('ofTotal', { count: row.total })}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// The Stats page: words learned, right answers, progress per lesson, weak topics and common mistakes.
const Stats = ({
  bank,
  lessons,
  docId,
  canWrite,
}: {
  bank: Bank;
  lessons: Lesson[];
  docId: string;
  canWrite: boolean;
}) => {
  const { t, language: uiLanguage } = useTranslation(pages);
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
          topic: shownTopic(lesson.topic, uiLanguage),
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
      bank.lessons.map((lesson) => {
        const topic = shownTopic(lesson.topic, uiLanguage);
        return [lesson.key, `${lesson.word} ${lesson.n}${topic ? `: ${topic}` : ''}`];
      })
    );
    for (const stat of stats) {
      const name = lessonName.get(stat.lesson);
      if (name) addTo(byLesson, stat.lesson, name, stat.right, stat.wrong);
      addTo(byKind, asKind(stat.kind), t(`kind.${asKind(stat.kind)}`), stat.right, stat.wrong);
    }
    // verb forms of the languages studied: each language names its tenses its own way, so a
    // form's tense tells its language (forms are kept without one)
    const studiedTenses = new Set<string>(
      settings.studying.filter(isVerbLanguage).flatMap((language) => TENSES_BY_LANGUAGE[language])
    );
    for (const formStat of Object.values(progress.forms))
      if (studiedTenses.has(formStat.t))
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
  }, [bank.words, bank.lessons, progress, t, settings, uiLanguage]);

  return (
    <>
      <PageHead guide="stats" title={t('statsTitle')}>
        {answers ? t('basedOn', { count: answers }) : null}
      </PageHead>
      <BankNote bank={bank} />

      <div className={styles.kpis}>
        <div className={styles.kpi}>
          <span className={styles['kpi-label']}>{t('wordsLearned')}</span>
          <span className={styles['kpi-value']}>{learned}</span>
        </div>
        <div className={styles.kpi}>
          <span className={styles['kpi-label']}>{t('leftToLearn')}</span>
          <span className={styles['kpi-value']}>{Math.max(total - learned, 0)}</span>
        </div>
        <div className={styles.kpi}>
          <span className={styles['kpi-label']}>{t('rightAnswers')}</span>
          <span className={styles['kpi-value']}>
            {answers ? percent(right, answers) + '%' : '—'}
          </span>
        </div>
        <div className={styles.kpi}>
          <span className={styles['kpi-label']}>{t('onMyWords')}</span>
          <span className={styles['kpi-value']}>{hard}</span>
        </div>
      </div>

      <section className={`panel solo ${styles['stats-block']}`}>
        <div className="body">
          <div className={styles['meter-head']}>
            <h2 className="sub-h">{t('vocabulary')}</h2>
            <span className="hint">
              {t('learnedOf', { learned, count: total, percent: percent(learned, total) })}
            </span>
          </div>
          <Meter value={learned} max={total} label={t('wordsLearned')} />
          <p className="legend">{t('learnedRule')}</p>
          {perLesson.length > 0 && (
            <ul className={styles['lesson-progress']}>
              {perLesson.map((lesson) => (
                <li key={lesson.key}>
                  <span className={styles['rank-name']}>
                    {lesson.word} {lesson.n}
                    {lesson.topic && (
                      <span className={styles['topic-small']}> · {lesson.topic}</span>
                    )}
                  </span>
                  <Meter
                    value={lesson.learned}
                    max={lesson.total}
                    label={t('lessonWordsLearned', { lesson: `${lesson.word} ${lesson.n}` })}
                  />
                  <span className={styles['rank-val']}>
                    {lesson.learned}
                    <span className={styles['rank-n']}> / {lesson.total}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className={`panel solo ${styles['stats-block']}`}>
        <div className="body">
          <h2 className="sub-h">{t('weakTopics')}</h2>
          {weakLessons.length || weakKinds.length || tenses.length ? (
            <div className={styles['rank-cols']}>
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

      <section className={`panel solo ${styles['stats-block']}`}>
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
};

export default Stats;
