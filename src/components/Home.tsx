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
import { plural } from '../lib/util';
import PageHead, { BankNote } from './PageHead';
import WordQuiz from './WordQuiz';

const ROUND = 10;
const FORMS = 2;

/** The landing page: a round of random questions from every lesson, weighted towards what the student doesn't know yet. */
export default function Home({ bank }: { bank: Bank }) {
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
      <PageHead title="Today’s practice">
        {bank.words.length ? (
          <>
            {learned} of {plural(bank.words.length, 'word')} learned
            {hard > 0 && <>, {hard} on My words</>}. Each round mixes words from every lesson, with
            the ones you miss coming back more often.
          </>
        ) : null}
      </PageHead>
      {bank.words.length > 0 && (
        <div className="daily" role="status">
          <span className="streak">
            {streak > 0 ? `🔥 ${plural(streak, 'day')} in a row` : 'Start a streak today'}
          </span>
          <span className="goal">
            <span className="goal-bar" aria-hidden="true">
              <span style={{ width: `${Math.min(today / DAILY_GOAL, 1) * 100}%` }} />
            </span>
            {today >= DAILY_GOAL
              ? `Today’s goal done: ${today} answers`
              : `Today: ${today} of ${DAILY_GOAL} answers`}
          </span>
        </div>
      )}
      <BankNote bank={bank} />
      {bank.words.length ? (
        <WordQuiz title="Random exercises" make={make} />
      ) : (
        !bank.pending && (
          <p className="empty">
            No words yet. Once a lesson has vocabulary, exercises appear here.
          </p>
        )
      )}
    </>
  );
}
