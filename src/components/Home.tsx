import { useTranslation } from '../i18n/core';
import { pages } from '../i18n/messages/pages';
import type { Bank } from '../lib/bank';
import { findHomework } from '../lib/homework';
import { dailyStats, getProgress, isLearned, useProgress, wordKey } from '../lib/progress';
import { buildQuiz, pickForms, pickWords } from '../lib/quiz';
import { isStudied, useSettings } from '../lib/settings';
import type { Lesson } from '../lib/types';
import HomeworkCard from './HomeworkCard';
import PageHead, { BankNote } from './PageHead';
import WordQuiz from './WordQuiz';

const ROUND = 10;
const FORMS = 2;

/** The landing page: a round of random questions from every lesson, weighted towards what the student doesn't know yet. */
export default function Home({
  bank,
  lessons,
  ai,
  docId,
  docText,
}: {
  bank: Bank;
  lessons: Lesson[];
  ai: boolean;
  docId: string;
  docText: string;
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
      <PageHead title={t('homeTitle')}>
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
      {homework && (
        <HomeworkCard
          key={homework.lesson.key}
          homework={homework}
          lessons={lessons}
          bank={bank}
          ai={ai}
          docId={docId}
          docText={docText}
        />
      )}
      <BankNote bank={bank} />
      {bank.words.length ? (
        <WordQuiz title={t('randomExercises')} make={make} />
      ) : (
        !bank.pending && <p className="empty">{t('noWordsYet')}</p>
      )}
    </>
  );
}
