import { useState } from "react";
import type { Bank } from "../lib/bank";
import { statWord, topMistakes, useProgress } from "../lib/progress";
import { buildQuiz, type FormQ } from "../lib/quiz";
import type { Tense } from "../lib/types";
import { shuffle } from "../lib/util";
import MistakeList from "./MistakeList";
import PageHead from "./PageHead";
import WordQuiz from "./WordQuiz";

/** The words and verb forms missed most often, and a quiz on just those. */
export default function Mistakes({ bank }: { bank: Bank }) {
  const progress = useProgress();
  const [practise, setPractise] = useState(false);
  const { words, forms } = topMistakes(progress);

  if (practise) return <WordQuiz title="Practise mistakes" closeLabel="Back to mistakes" onClose={() => setPractise(false)} make={() => {
    const mistakes = topMistakes();
    const pickedWords = shuffle(mistakes.words).slice(0, 7).map(statWord);
    const pickedForms: FormQ[] = shuffle(mistakes.forms).slice(0, 10 - pickedWords.length).map(form => ({ inf: form.inf, t: form.t as Tense, p: form.p, f: form.f }));
    return buildQuiz(pickedWords, bank.words.length >= 4 ? bank.words : pickedWords, pickedForms);
  }} />;

  return (
    <>
      <PageHead title="Mistakes">
        {words.length || forms.length ? "What you get wrong most often. Practise these until they stop showing up." : null}
      </PageHead>
      {!words.length && !forms.length
        ? <p className="empty">No mistakes yet. Do a few exercises and the words and verb forms you miss will gather here.</p>
        : <>
            <div className="row-actions lead"><button className="btn primary" onClick={() => setPractise(true)}>Practise my mistakes</button></div>
            <div className="mistake-cols">
              {words.length > 0 && <section className="panel solo">
                <div className="body">
                  <h2 className="sub-h">Words</h2>
                  <MistakeList words={words} />
                </div>
              </section>}
              {forms.length > 0 && <section className="panel solo">
                <div className="body">
                  <h2 className="sub-h">Verb forms</h2>
                  <MistakeList forms={forms} />
                </div>
              </section>}
            </div>
          </>}
    </>
  );
}
