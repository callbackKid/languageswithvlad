import type { Bank } from '../lib/bank';
import {
  DAILY_GOAL,
  dailyStats,
  getProgress,
  isLearned,
  useProgress,
  wordKey,
} from '../lib/progress';
import { buildQuiz, pickForms, pickWords } from '../lib/quiz';
import { useTranslation } from '../i18n/core';
import { pages } from '../i18n/messages/pages';
import PageHead, { BankNote } from './PageHead';
import WordQuiz from './WordQuiz';

const ROUND = 10;
const FORMS = 2;

/** The landing page: a round of random questions from every lesson, weighted towards what the student doesn't know yet. */
export default function Home({ bank }: { bank: Bank }) {
  const { t } = useTranslation(pages);
  const progress = useProgress();
  const learned = bank.words.filter((word) => isLearned(progress.words[wordKey(word.fr)])).length;
  const hard = Object.values(progress.words).filter((stat) => stat.hard).length;
  const { today, streak } = dailyStats(progress);

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
              <span style={{ width: `${Math.min(today / DAILY_GOAL, 1) * 100}%` }} />
            </span>
            {today >= DAILY_GOAL
              ? t('goalDone', { count: today })
              : t('goalProgress', { count: today, goal: DAILY_GOAL })}
          </span>
        </div>
      )}
      <BankNote bank={bank} />
      {bank.words.length ? (
        <WordQuiz title={t('randomExercises')} make={make} />
      ) : (
        !bank.pending && (
          <p className="empty">{t('noWordsYet')}</p>
        )
      )}
    </>
  );
}
