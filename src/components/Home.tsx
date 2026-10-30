import type { Bank } from "../lib/bank";
import { getProgress, isLearned, useProgress, wordKey } from "../lib/progress";
import { buildQuiz, pickForms, pickWords } from "../lib/quiz";
import { plural } from "../lib/util";
import PageHead, { BankNote } from "./PageHead";
import WordQuiz from "./WordQuiz";

const ROUND = 10;
const FORMS = 2;

/** The landing page: a round of random questions from every lesson, weighted towards what the student doesn't know yet. */
export default function Home({ bank }: { bank: Bank }) {
  const progress = useProgress();
  const learned = bank.words.filter(word => isLearned(progress.words[wordKey(word.fr)])).length;
  const hard = Object.values(progress.words).filter(stat => stat.hard).length;

  const make = () => {
    const currentProgress = getProgress();
    const forms = pickForms(bank.verbs, currentProgress, FORMS);
    return buildQuiz(pickWords(bank.words, currentProgress, ROUND - forms.length), bank.words, forms);
  };

  return (
    <>
      <PageHead title="Today’s practice">
        {bank.words.length
          ? <>{learned} of {plural(bank.words.length, "word")} learned{hard > 0 && <>, {hard} on My words</>}. Each round mixes words from every lesson, with the ones you miss coming back more often.</>
          : null}
      </PageHead>
      <BankNote bank={bank} />
      {bank.words.length
        ? <WordQuiz title="Random exercises" make={make} />
        : !bank.pending && <p className="empty">No words yet. Once a lesson has vocabulary, exercises appear here.</p>}
    </>
  );
}
