import { useState } from 'react';
import { load, save } from '../lib/storage';
import type { DocTarget } from './AddToDoc';
import HandwrittenNotes from './HandwrittenNotes';
import PageHead from './PageHead';
import PhotoWords from './PhotoWords';

type Mode = 'underlined' | 'handwritten';

/** Everything that starts from a photo: underlined words in a book, or handwritten lesson notes. */
export default function PhotoSection({ ai, target }: { ai: boolean; target: DocTarget }) {
  const [mode, setMode] = useState<Mode>(() => load<Mode>('photo:mode') || 'underlined');
  const choose = (next: Mode) => {
    setMode(next);
    save('photo:mode', next);
  };
  return (
    <>
      <PageHead title="From a photo" />
      <div className="seg photo-mode" role="group" aria-label="What is on the photo">
        <button aria-pressed={mode === 'underlined'} onClick={() => choose('underlined')}>
          Underlined words
        </button>
        <button aria-pressed={mode === 'handwritten'} onClick={() => choose('handwritten')}>
          Handwritten notes
        </button>
      </div>
      {mode === 'underlined' ? (
        <PhotoWords ai={ai} target={target} />
      ) : (
        <HandwrittenNotes ai={ai} target={target} />
      )}
    </>
  );
}
