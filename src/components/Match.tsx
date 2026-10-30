import { useState } from "react";
import { recordWord } from "../lib/progress";
import { LANGUAGE_NAMES, type Word } from "../lib/types";
import { shuffle } from "../lib/util";
import ExHead from "./ExHead";

/** word is set for translation pairs, so results count towards progress. */
export interface MatchPair { id: string; a: string; b: string; kind?: "synonym" | "antonym"; word?: Word }
const ROUND = 5;

function makeRound(pool: MatchPair[]) {
  const round = pool.slice(0, ROUND);
  return { round, left: shuffle(round.map(pair => pair.id)), right: shuffle(round.map(pair => pair.id)) };
}

export default function Match({ pairs, mode, onClose, onRestart }: { pairs: MatchPair[]; mode: "words" | "syn"; onClose: () => void; onRestart: () => void }) {
  const [pool, setPool] = useState(() => shuffle(pairs));
  const [{ round, left, right }, setRound] = useState(() => makeRound(pool));
  const [done, setDone] = useState<Set<string>>(new Set());
  const [pick, setPick] = useState<{ L: string | null; R: string | null }>({ L: null, R: null });
  const [wrong, setWrong] = useState<[string, string] | null>(null);
  const [cleared, setCleared] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const language = pairs[0]?.word?.language ?? "fr";
  const byId = Object.fromEntries(round.map(pair => [pair.id, pair]));
  const roundDone = round.length > 0 && done.size === round.length;
  const rest = pool.slice(ROUND);
  const title = mode === "syn" ? "Synonyms & antonyms" : "Match translations";

  function choose(side: "L" | "R", id: string) {
    if (done.has(id)) return;
    const next = { ...pick, [side]: pick[side] === id ? null : id };
    setWrong(null);
    if (next.L && next.R) {
      const word = byId[next.L].word;
      if (next.L === next.R) { setDone(previous => new Set(previous).add(next.L!)); setCleared(previous => previous + 1); if (word) recordWord(word, true); }
      else { setWrong([next.L, next.R]); setMistakes(previous => previous + 1); if (word) recordWord(word, false); }
      setPick({ L: null, R: null });
    } else setPick(next);
  }
  function nextRound() {
    setPool(rest); setRound(makeRound(rest)); setDone(new Set()); setPick({ L: null, R: null }); setWrong(null);
  }

  const tile = (side: "L" | "R", id: string) => {
    const pair = byId[id];
    const isDone = done.has(id);
    const tileClass = ["tile", (side === "L" || mode === "syn") && "fr", isDone && "done", pick[side] === id && "picked",
      wrong && wrong[side === "L" ? 0 : 1] === id && "wrong"].filter(Boolean).join(" ");
    return (
      <button key={id} className={tileClass} disabled={isDone} onClick={() => choose(side, id)} lang={side === "L" || mode === "syn" ? language : "ru"}>
        {side === "L" ? pair.a : pair.b}
        {side === "R" && isDone && mode === "syn" && <span className="kind">{pair.kind === "synonym" ? "= synonym" : "≠ antonym"}</span>}
      </button>
    );
  };
  const grid = <div className="match"><div className="col">{left.map(id => tile("L", id))}</div><div className="col">{right.map(id => tile("R", id))}</div></div>;

  if (roundDone && !rest.length) return (
    <div className="ex">
      <ExHead title={title} onClose={onClose} />
      <p className="score">All {pairs.length} pairs matched with {mistakes} mistake{mistakes === 1 ? "" : "s"}.</p>
      {grid}
      <div className="row-actions"><button className="btn primary" onClick={onRestart}>Play again</button></div>
    </div>
  );

  return (
    <div className="ex">
      <ExHead title={title} onClose={onClose}><span className="progress">{cleared} / {pairs.length}</span></ExHead>
      <p className="ru-line">{mode === "syn" ? "Connect each word with its synonym or antonym." : `Tap a${language === "en" ? "n" : ""} ${LANGUAGE_NAMES[language]} word, then its translation.`}</p>
      {grid}
      {roundDone && <div className="row-actions"><button className="btn primary" onClick={nextRound}>Next pairs</button></div>}
    </div>
  );
}
