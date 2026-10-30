import { useCallback, useEffect, useState } from "react";
import { recordWord } from "../lib/progress";
import type { Word } from "../lib/types";
import { shuffle } from "../lib/util";
import ExHead from "./ExHead";
import Transcription from "./Transcription";

export default function Flashcards({ words, onClose, onRestart }: { words: Word[]; onClose: () => void; onRestart: () => void }) {
  const [deck, setDeck] = useState(() => shuffle(words));
  // "fr" direction means from the language being learned into Russian, whichever language that is
  const language = words[0]?.language ?? "fr";
  const code = language.toUpperCase();
  const [done, setDone] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState<"fr" | "ru">("fr");

  const currentCard = deck[0];
  const know = useCallback(() => {
    if (currentCard) recordWord(currentCard, true);
    setDeck(previous => previous.slice(1)); setDone(previous => previous + 1); setFlipped(false);
  }, [currentCard]);
  const again = useCallback(() => {
    if (currentCard) recordWord(currentCard, false);
    setDeck(previous => [...previous.slice(1), previous[0]]); setFlipped(false);
  }, [currentCard]);

  useEffect(() => {
    if (!deck.length) return;
    const onKey = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).matches("input, textarea")) return;
      if (event.key === " ") { event.preventDefault(); setFlipped(previous => !previous); }
      else if (event.key === "ArrowRight") know();
      else if (event.key === "ArrowLeft") again();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deck.length, know, again]);

  const directionToggle = (
    <span className="seg" role="group" aria-label="Direction">
      <button aria-pressed={direction === "fr"} onClick={() => { setDirection("fr"); setFlipped(false); }}>{code} → RU</button>
      <button aria-pressed={direction === "ru"} onClick={() => { setDirection("ru"); setFlipped(false); }}>RU → {code}</button>
    </span>
  );

  if (!deck.length) return (
    <div className="ex">
      <ExHead title="Flashcards" onClose={onClose}>{directionToggle}</ExHead>
      <p className="score">All {words.length} cards done.</p>
      <div className="row-actions"><button className="btn primary" onClick={onRestart}>Start over</button></div>
    </div>
  );

  const card = deck[0];
  const [front, back] = direction === "fr" ? [card.fr, card.ru] : [card.ru, card.fr];
  return (
    <div className="ex">
      <ExHead title="Flashcards" onClose={onClose}><span className="progress">{done} / {words.length} known</span>{directionToggle}</ExHead>
      <button className="card" onClick={() => setFlipped(previous => !previous)} aria-label="Flip card">
        <span className="face" lang={direction === "fr" ? language : "ru"}>{front}</span>
        {direction === "fr" && card.tr && <Transcription tr={card.tr} />}
        {flipped ? <span className="back" lang={direction === "fr" ? "ru" : language}>{back}{direction === "ru" && card.tr && <> <Transcription tr={card.tr} /></>}</span> : <span className="sub">Tap to see the answer</span>}
      </button>
      <div className="card-actions">
        <button className="btn big" onClick={again}>Again</button>
        <button className="btn primary big" onClick={know}>I know it</button>
      </div>
      <p className="kbd">Space flips, ← again, → I know it</p>
    </div>
  );
}
