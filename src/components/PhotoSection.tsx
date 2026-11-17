import { useState } from 'react';

import { useTranslation } from '../i18n/core';
import { paper } from '../i18n/messages/paper';
import { load, save } from '../lib/storage';
import type { DocTarget } from './AddToDoc';
import HandwrittenNotes from './HandwrittenNotes';
import PageHead from './PageHead';
import PhotoWords from './PhotoWords';

type Mode = 'underlined' | 'handwritten' | 'textbook';

const MODES: Mode[] = ['underlined', 'handwritten', 'textbook'];

/** Everything that starts from paper: underlined words in a book, handwritten lesson notes, or a textbook chapter. */
export default function PhotoSection({ ai, target }: { ai: boolean; target: DocTarget }) {
  const { t } = useTranslation(paper);
  const [mode, setMode] = useState<Mode>(() => load<Mode>('photo:mode') || 'underlined');
  const choose = (next: Mode) => {
    setMode(next);
    save('photo:mode', next);
  };
  return (
    <>
      <PageHead guide="photo" title={t('fromPaper')} />
      <div className="seg photo-mode" role="group" aria-label={t('whatToRead')}>
        {MODES.map((entry) => (
          <button
            type="button"
            key={entry}
            aria-pressed={mode === entry}
            onClick={() => choose(entry)}
          >
            {t(`mode.${entry}`)}
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
