import { type ReactNode, useId, useState } from 'react';

import { loadTexts, save } from '@/shared/lib/storage';

import { Button } from './controls';

// the ids of the folded cards, kept on this device for every lesson
const FOLDED_KEY = 'call:folded';

/** A card of lesson mode that folds: its title is a button, and a folded card stays folded on
    this device until it is opened again. Folding only hides the card, so a call or the board
    in it goes on. The actions next to the title show while the card is open. */
export default function CallCard({
  id,
  title,
  actions,
  className = '',
  children,
}: {
  // names the card in the saved list: "notes", "board"…
  id: string;
  title: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const [isFolded, setFolded] = useState(() => loadTexts(FOLDED_KEY).includes(id));
  const bodyId = useId();

  function toggle() {
    const folded = !isFolded;
    setFolded(folded);
    // read again: another card may have changed the list since this one was drawn
    const others = loadTexts(FOLDED_KEY).filter((saved) => saved !== id);
    save(FOLDED_KEY, folded ? [...others, id] : others);
  }

  return (
    <section className={`call-card ${className}${isFolded ? ' folded' : ''}`.trim()}>
      <div className="call-card-head">
        <h2>
          <Button
            variant="unstyled"
            className="fold-button"
            aria-expanded={!isFolded}
            aria-controls={bodyId}
            onClick={toggle}
          >
            <span className="fold-mark" aria-hidden="true">
              ▾
            </span>
            {title}
          </Button>
        </h2>
        {!isFolded && actions}
      </div>
      <div id={bodyId} className="call-card-body" hidden={isFolded}>
        {children}
      </div>
    </section>
  );
}
