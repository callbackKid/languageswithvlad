import { findHomework } from '@/entities/homework';
import {
  type Bank,
  BankNote,
  buildQuiz,
  type Lesson,
  pickForms,
  pickWords,
} from '@/entities/lesson';
import { dailyStats, getProgress, isLearned, useProgress, wordKey } from '@/entities/word';
import { isStudied, useSettings } from '@/shared/config/settings';
import { useTranslation } from '@/shared/i18n/core';
import { pages } from '@/shared/i18n/messages/pages';
import PageHead from '@/shared/ui/PageHead';

import HomeworkCard from './HomeworkCard';
import LessonSummary from './LessonSummary';
import PrepareCard from './PrepareCard';
import WordQuiz from './WordQuiz';

const ROUND = 10;
const FORMS = 2;

// The landing page: a round of random questions from every lesson, weighted towards what the student doesn't know yet.
export default function Home({
  bank,
  lessons,
  hasClaude,
  docId,
  docText,
  canWrite,
}: {
  bank: Bank;
  lessons: Lesson[];
  hasClaude: boolean;
  docId: string;
  docText: string;
  canWrite: boolean;
}) {
  const { t } = useTranslation(pages);
  const progress = useProgress();
  const { dailyGoal } = useSettings();
  const learned = bank.words.filter((word) => isLearned(progress.words[wordKey(word.fr)])).length;
  const hard = Object.values(progress.words).filter(
    (stat) => stat.hard && isStudied(stat.language)
  ).length;
  const { today, streak } = dailyStats(progress);
  const homework = findHomework(lessons);
  const newest = lessons[lessons.length - 1];

  const make = () => {
    const currentProgress = getProgress();
    const forms = pickForms(bank.verbs, currentProgress, FORMS);
    return buildQuiz(
      pickWords(bank.words, currentProgress, ROUND - forms.length),
      bank.words,
      forms
    );
  };

  return (
    <>
      <PageHead guide="home" title={t('homeTitle')}>
        {bank.words.length ? (
          <>
            {t('homeLearned', { learned, count: bank.words.length })}
            {hard > 0 && t('homeOnMyWords', { hard })}
            {t('homeIntro')}
          </>
        ) : null}
      </PageHead>
      {bank.words.length > 0 && (
        <div className="daily" role="status">
          <span className="streak">
            {streak > 0 ? t('streak', { count: streak }) : t('startStreak')}
          </span>
          <span className="goal">
            <span className="goal-bar" aria-hidden="true">
              <span style={{ width: `${Math.min(today / dailyGoal, 1) * 100}%` }} />
            </span>
            {today >= dailyGoal
              ? t('goalDone', { count: today })
              : t('goalProgress', { count: today, goal: dailyGoal })}
          </span>
        </div>
      )}
      {newest && (
        <PrepareCard
          key={'prepare' + newest.key}
          lesson={newest}
          docText={docText}
          bank={bank}
          hasClaude={hasClaude}
          docId={docId}
        />
      )}
      {newest && (
        <LessonSummary
          key={'summary' + newest.key}
          lesson={newest}
          bank={bank}
          hasClaude={hasClaude}
          docId={docId}
        />
      )}
      {homework && (
        // the summary and the homework are often of the same lesson: their keys must differ
        <HomeworkCard
          key={'homework' + homework.lesson.key}
          homework={homework}
          lessons={lessons}
          bank={bank}
          hasClaude={hasClaude}
          docId={docId}
          docText={docText}
          canWrite={canWrite}
        />
      )}
      <BankNote bank={bank} />
      {bank.words.length ? (
        <WordQuiz title={t('randomExercises')} make={make} speakAtOnce={false} />
      ) : (
        !bank.pending && <p className="empty">{t('noWordsYet')}</p>
      )}
    </>
  );
}
