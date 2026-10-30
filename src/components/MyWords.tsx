import { statWord, useProgress } from "../lib/progress";
import type { Analysis } from "../lib/types";
import { plural } from "../lib/util";
import PageHead from "./PageHead";
import WordsTab from "./WordsTab";

/** The student's list of unfamiliar words: starred by hand or missed in an exercise. */
export default function MyWords({ ai }: { ai: boolean }) {
  const progress = useProgress();
  const words = Object.values(progress.words).filter(stat => stat.hard).sort((first, second) => second.last - first.last).map(statWord);
  const analysis: Analysis = { language: words[0]?.language ?? "fr", topic: "", words, pairs: [], verbs: [], local: false };

  return (
    <>
      <PageHead title="My words">
        {words.length ? <>{plural(words.length, "word")} to work on. A word leaves the list after 3 right answers in a row, or when you take its ★ off.</> : null}
      </PageHead>
      {words.length
        ? <section className="panel solo"><div className="body"><WordsTab analysis={analysis} ai={ai} hidePairs /></div></section>
        : <p className="empty">Your list is empty. Press ☆ next to a word in any lesson to add it here. Words you get wrong in exercises are added automatically.</p>}
    </>
  );
}
