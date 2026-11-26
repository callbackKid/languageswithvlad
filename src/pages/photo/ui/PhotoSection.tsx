import { useState } from 'react';

import { type Lesson } from '@/entities/lesson';
import { type DocTarget } from '@/features/add-to-doc';
import { paper, useTranslation } from '@/shared/i18n';
import { load, save } from '@/shared/lib/storage';
import { Button } from '@/shared/ui/controls';
import PageHead from '@/shared/ui/PageHead';

import HandwrittenNotes from './HandwrittenNotes';
import PhotoWords from './PhotoWords';

const MODES = ['underlined', 'handwritten', 'textbook'] as const;
type Mode = (typeof MODES)[number];

// Everything that starts from paper: underlined words in a book, handwritten lesson notes, or a textbook chapter.
export default function PhotoSection({
  hasClaude,
  target,
  lessons,
}: {
  hasClaude: boolean;
  target: DocTarget;
  // the underlined words can go under one of them
  lessons: Lesson[];
}) {
  const { t } = useTranslation(paper);
  const [mode, setMode] = useState<Mode>(() => {
    const saved = load<unknown>('photo:mode');
    return MODES.find((mode) => mode === saved) ?? 'underlined';
  });
  const choose = (next: Mode) => {
    setMode(next);
    save('photo:mode', next);
  };
  return (
    <>
      <PageHead guide="photo" title={t('fromPaper')} />
      <div className="seg photo-mode" role="group" aria-label={t('whatToRead')}>
        {MODES.map((entry) => (
          <Button
            variant="unstyled"
            key={entry}
            aria-pressed={mode === entry}
            onClick={() => choose(entry)}
          >
            {t(`mode.${entry}`)}
          </Button>
        ))}
      </div>
      {mode === 'underlined' ? (
        <PhotoWords hasClaude={hasClaude} target={target} lessons={lessons} />
      ) : (
        // a separate instance per mode, so each keeps its own saved lessons
        <HandwrittenNotes key={mode} hasClaude={hasClaude} target={target} source={mode} />
      )}
    </>
  );
}
