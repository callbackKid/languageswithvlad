import { setHard, useProgress, wordKey } from "../lib/progress";
import type { Word } from "../lib/types";

/** Adds a word to, or removes it from, the "My words" list. */
export default function Star({ word }: { word: Word }) {
  const isStarred = !!useProgress().words[wordKey(word.fr)]?.hard;
  return (
    <button className={"star" + (isStarred ? " on" : "")} aria-pressed={isStarred} onClick={() => setHard(word, !isStarred)}
      title={isStarred ? "Remove from My words" : "Add to My words"} aria-label={(isStarred ? "Remove from" : "Add to") + " My words: " + word.fr}>
      {isStarred ? "★" : "☆"}
    </button>
  );
}
