import { useMemo, useState } from "react";
import type { Bank } from "../lib/bank";
import type { Analysis } from "../lib/types";
import PageHead, { BankNote } from "./PageHead";
import VerbsTab from "./VerbsTab";
import WordsTab from "./WordsTab";

/** Every exercise, run on the words and verbs of all lessons or the ones picked. */
export default function Practice({ bank, ai }: { bank: Bank; ai: boolean }) {
  // null means every lesson, including ones still being prepared
  const [selectedLessons, setSelectedLessons] = useState<Set<string> | null>(null);
  const [tab, setTab] = useState<"words" | "verbs">("words");

  const analysis = useMemo((): Analysis => {
    const isIncluded = (key: string | undefined) => !selectedLessons || (!!key && selectedLessons.has(key));
    const words = bank.words.filter(word => isIncluded(word.lesson));
    const frenchWords = new Set(words.map(word => word.fr));
    return {
      // lessons can mix languages; each word also carries its own
      language: words[0]?.language ?? "fr", topic: "", words, local: !ai,
      pairs: bank.pairs.filter(pair => isIncluded(pair.lesson) && frenchWords.has(pair.a) && frenchWords.has(pair.b)),
      verbs: bank.verbs.filter(verb => isIncluded(verb.lesson)),
    };
  }, [bank.words, bank.pairs, bank.verbs, selectedLessons, ai]);
  const { words } = analysis;
  const ready = bank.lessons.filter(lesson => lesson.ready);
  const toggle = (key: string) => setSelectedLessons(previous => {
    const updated = new Set(previous ?? ready.map(lesson => lesson.key));
    if (updated.has(key)) updated.delete(key); else updated.add(key);
    return updated.size === ready.length ? null : updated;
  });
  // a new selection starts the word list and verb list afresh
  const selKey = selectedLessons ? [...selectedLessons].sort().join(",") : "all";

  return (
    <>
      <PageHead title="All lessons">Exercises on words and verbs from every lesson. Pick lessons to narrow it down.</PageHead>
      <BankNote bank={bank} />
      <div className="chips" role="group" aria-label="Lessons">
        <button className="chip" aria-pressed={!selectedLessons} onClick={() => setSelectedLessons(null)}>All</button>
        {ready.map(lesson => (
          <button key={lesson.key} className="chip" aria-pressed={!!selectedLessons && selectedLessons.has(lesson.key)} onClick={() => toggle(lesson.key)} title={lesson.topic || undefined}>
            {lesson.word} {lesson.n}
          </button>
        ))}
      </div>
      <section className="panel solo">
        <div className="tabs" role="tablist">
          <button className="tab" role="tab" aria-selected={tab === "words"} onClick={() => setTab("words")}>Words<span className="count">{words.length}</span></button>
          <button className="tab" role="tab" aria-selected={tab === "verbs"} onClick={() => setTab("verbs")}>Verbs<span className="count">{analysis.verbs.length}</span></button>
        </div>
        <div className="body">
          {tab === "words" && <WordsTab key={selKey} analysis={analysis} ai={ai} />}
          {tab === "verbs" && <VerbsTab key={selKey} verbs={analysis.verbs} ai={ai} waiting={bank.pending > 0} />}
        </div>
      </section>
    </>
  );
}
