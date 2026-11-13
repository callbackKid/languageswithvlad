import { useState } from 'react';
import { load, save } from '../lib/storage';
import type { DocTarget } from './AddToDoc';
import HandwrittenNotes from './HandwrittenNotes';
import PageHead from './PageHead';
import PhotoWords from './PhotoWords';

type Mode = 'underlined' | 'handwritten' | 'textbook';

const MODES: { id: Mode; label: string }[] = [
  { id: 'underlined', label: 'Underlined words' },
  { id: 'handwritten', label: 'Handwritten notes' },
  { id: 'textbook', label: 'Textbook PDF' },
];

/** Everything that starts from paper: underlined words in a book, handwritten lesson notes, or a textbook chapter. */
export default function PhotoSection({ ai, target }: { ai: boolean; target: DocTarget }) {
  const [mode, setMode] = useState<Mode>(() => load<Mode>('photo:mode') || 'underlined');
  const choose = (next: Mode) => {
    setMode(next);
    save('photo:mode', next);
  };
  return (
    <>
      <PageHead title="From paper" />
      <div className="seg photo-mode" role="group" aria-label="What to read">
        {MODES.map((entry) => (
          <button key={entry.id} aria-pressed={mode === entry.id} onClick={() => choose(entry.id)}>
            {entry.label}
          </button>
        ))}
      </div>
      {mode === 'underlined' ? (
        <PhotoWords ai={ai} target={target} />
      ) : (
        // a separate instance per mode, so each keeps its own saved lessons
        <HandwrittenNotes key={mode} ai={ai} target={target} source={mode} />
      )}
    </>
  );
}
