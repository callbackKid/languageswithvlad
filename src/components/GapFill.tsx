import { useEffect, useState } from "react";
import { api, ApiError } from "../lib/api";
import { normGaps } from "../lib/parse";
import { recordWord } from "../lib/progress";
import type { GapItem, Word } from "../lib/types";
import { shuffle } from "../lib/util";
import ExHead from "./ExHead";

export default function GapFill({ words, onClose, onRestart }: { words: Word[]; onClose: () => void; onRestart: () => void }) {
  const language = words[0]?.language ?? "fr";
  const [items, setItems] = useState<GapItem[] | null>(null);
  const [error, setError] = useState("");
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [showRu, setShowRu] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    let alive = true;
    const sample = shuffle(words).slice(0, 24).map(word => ({ fr: word.fr, ru: word.ru }));
    api.gaps(sample, language)
      .then(response => { if (alive) setItems(normGaps(response)); })
      .catch(failure => { if (alive) setError(failure instanceof ApiError ? failure.message : "The answer couldn’t be read. Try again."); });
    return () => { alive = false; };
  }, [words, language]);

  if (error) return <div className="ex"><ExHead title="Fill the gap" onClose={onClose} /><div className="note err"><p>{error}</p><button className="btn" onClick={onRestart}>Try again</button></div></div>;
  if (!items) return <div className="ex"><ExHead title="Fill the gap" onClose={onClose} /><p><span className="spinner" /> Writing sentences with your words…</p></div>;
  if (index >= items.length) return (
    <div className="ex">
      <ExHead title="Fill the gap" onClose={onClose} />
      <p className="score">{score} of {items.length} right.</p>
      <div className="row-actions"><button className="btn primary" onClick={onRestart}>New sentences</button></div>
    </div>
  );

  const item = items[index];
  const right = picked === item.answer;
  return (
    <div className="ex">
      <ExHead title="Fill the gap" onClose={onClose}><span className="progress">{index + 1} / {items.length}</span></ExHead>
      <p className="sentence" lang={language}>
        {item.before} <span className={"gap" + (picked == null ? "" : right ? " ok" : " bad")}>{picked == null ? "\u00a0" : item.answer}</span> {item.after}
      </p>
      {showRu || picked != null
        ? <p className="ru-line" lang="ru">{item.ru}</p>
        : <p className="ru-line"><button className="btn ghost flush" onClick={() => setShowRu(true)}>Show translation</button></p>}
      <div className="choices">
        {item.choices.map(choice => {
          const stateClass = picked == null ? "" : choice === item.answer ? " ok" : choice === picked ? " bad" : "";
          return <button key={choice} className={"choice" + stateClass} lang={language} disabled={picked != null}
            onClick={() => {
              setPicked(choice);
              if (choice === item.answer) setScore(previous => previous + 1);
              const word = words.find(candidate => candidate.fr === item.word);
              if (word) recordWord(word, choice === item.answer);
            }}>{choice}</button>;
        })}
      </div>
      {picked != null && <>
        <p className={"feedback " + (right ? "ok" : "bad")}>
          {right ? "Right." : <>The answer is “{item.answer}”.</>}{item.word && <> From <i lang={language}>{item.word}</i>.</>}
        </p>
        <div className="row-actions">
          <button className="btn primary" autoFocus onClick={() => { setIndex(previous => previous + 1); setPicked(null); setShowRu(false); }}>
            {index + 1 < items.length ? "Next sentence" : "See score"}
          </button>
        </div>
      </>}
    </div>
  );
}
