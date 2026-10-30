import { useMemo, useState } from "react";
import { getProgress } from "../lib/progress";
import { buildQuiz, pickWords } from "../lib/quiz";
import type { Analysis } from "../lib/types";
import Flashcards from "./Flashcards";
import Match, { type MatchPair } from "./Match";
import GapFill from "./GapFill";
import Star from "./Star";
import Transcription from "./Transcription";
import WordQuiz from "./WordQuiz";

type Ex = null | "quiz" | "cards" | "match" | "syn" | "gap";

export default function WordsTab({ analysis, ai, onRefresh, hidePairs }: { analysis: Analysis; ai: boolean; onRefresh?: () => void; hidePairs?: boolean }) {
  // Tracks the words left out, so words that arrive later (more lessons prepared) start picked.
  const [unpicked, setUnpicked] = useState<Set<string>>(() => new Set());
  const [filter, setFilter] = useState("");
  const [exercise, setExercise] = useState<Ex>(null);
  const [run, setRun] = useState(0);

  const picked = useMemo(() => analysis.words.filter(word => !unpicked.has(word.fr)), [analysis.words, unpicked]);
  const query = filter.toLowerCase();
  const list = analysis.words.filter(word => !query || word.fr.toLowerCase().includes(query) || word.ru.toLowerCase().includes(query));
  const synOk = analysis.pairs.length >= 2;
  const start = (kind: Ex) => { setExercise(kind); setRun(previous => previous + 1); };
  const close = () => setExercise(null);

  if (exercise === "quiz") return <WordQuiz key={run} title="Quiz" onClose={close}
    make={() => buildQuiz(pickWords(picked, getProgress(), 10), analysis.words)} />;
  if (exercise === "cards") return <Flashcards key={run} words={picked} onClose={close} onRestart={() => start("cards")} />;
  if (exercise === "match" || exercise === "syn") {
    const pairs: MatchPair[] = exercise === "syn"
      ? analysis.pairs.map((pair, index) => ({ id: "p" + index, a: pair.a, b: pair.b, kind: pair.kind }))
      : picked.map((word, index) => ({ id: "w" + index, a: word.fr, b: word.ru, word: word }));
    return <Match key={run} pairs={pairs} mode={exercise === "syn" ? "syn" : "words"} onClose={close} onRestart={() => start(exercise)} />;
  }
  if (exercise === "gap") return <GapFill key={run} words={picked} onClose={close} onRestart={() => start("gap")} />;

  const toggle = (fr: string) => setUnpicked(previous => { const updated = new Set(previous); if (updated.has(fr)) updated.delete(fr); else updated.add(fr); return updated; });

  return (
    <>
      <div className="ex-bar">
        <button className="btn primary" disabled={picked.length < 1} onClick={() => start("quiz")}>Quiz</button>
        <button className="btn" disabled={picked.length < 1} onClick={() => start("cards")}>Flashcards</button>
        <button className="btn" disabled={picked.length < 2} onClick={() => start("match")}>Match translations</button>
        {!(hidePairs && !synOk) && <button className="btn" disabled={!synOk} title={synOk ? undefined : "No synonym or antonym pairs in this lesson"} onClick={() => start("syn")}>Synonyms &amp; antonyms</button>}
        <button className="btn" disabled={picked.length < 1 || !ai} onClick={() => start("gap")}>Fill the gap</button>
        <span className="hint">{picked.length} of {analysis.words.length} words picked</span>
      </div>
      <div className="sel-bar">
        <button className="btn ghost" onClick={() => setUnpicked(new Set())}>Pick all</button>
        <button className="btn ghost" onClick={() => setUnpicked(new Set(analysis.words.map(word => word.fr)))}>Clear</button>
        <input type="search" placeholder="Filter words" aria-label="Filter words" value={filter} onChange={event => setFilter(event.target.value)} />
      </div>
      {list.length ? (
        <ul className="words">
          {list.map(word => (
            <li key={word.fr} className="word-row">
              <label className="word">
                <input type="checkbox" checked={!unpicked.has(word.fr)} onChange={() => toggle(word.fr)} />
                <span className="fr" lang={word.language ?? "fr"}>{word.fr}{word.tr && <> <Transcription tr={word.tr} /></>}</span>
                <span className="ru" lang="ru">{word.ru || "—"}{word.added && <span className="added" title="Translation added by Claude"> ✱</span>}</span>
              </label>
              <Star word={word} />
            </li>
          ))}
        </ul>
      ) : <p className="empty">{analysis.words.length ? "No words match that filter." : "No vocabulary found in this lesson."}</p>}
      {analysis.words.some(word => word.added) && <p className="legend"><span className="added">✱</span> translation added by Claude, not in the teacher’s notes</p>}
      {analysis.words.length > 0 && <p className="legend">☆ adds a word to My words. Words you miss in exercises are added too, and leave the list after 3 right answers in a row.</p>}
      {onRefresh && <p className="legend"><button className="btn ghost flush" onClick={onRefresh}>Prepare this lesson again</button></p>}
    </>
  );
}
