import { useState } from 'react';
import { api, ApiError } from '../lib/api';

/** Where new lessons go: the connected document, the lesson number to use next, and whether the server can write. */
export interface DocTarget {
  docId: string;
  nextLessonNumber: number;
  docWriter: string | null;
}

const pad = (value: number) => String(value).padStart(2, '0');

/** "13.11.2026 8 Leçon" and the lines under it, in the format the app reads lessons from. */
export function lessonText(lessonNumber: number, lines: string[]): string {
  const today = new Date();
  const heading = `${pad(today.getDate())}.${pad(today.getMonth() + 1)}.${today.getFullYear()} ${lessonNumber} Leçon`;
  return `\n\n${heading}\n${lines
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')}\n`;
}

/** Appends the lines to the Google Doc as a new lesson, then asks the app to sync. */
export default function AddToDoc({ target, lines }: { target: DocTarget; lines: string[] }) {
  const [state, setState] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!target.docWriter)
    return (
      <p className="hint">
        Adding to the Google Doc isn’t set up on the server yet (GOOGLE_SERVICE_ACCOUNT, see
        README).
      </p>
    );

  async function add() {
    setState('saving');
    try {
      await api.append(target.docId, lessonText(target.nextLessonNumber, lines));
      setState('done');
      setMessage(`Added to the document as Leçon ${target.nextLessonNumber}.`);
      window.dispatchEvent(new Event('cahier:doc-changed'));
    } catch (error) {
      setState('error');
      setMessage(
        error instanceof ApiError ? error.message : 'Couldn’t add to the document. Try again.'
      );
    }
  }

  return (
    <div className="row-actions add-to-doc">
      <button
        className="btn"
        disabled={state === 'saving' || state === 'done' || !lines.length}
        onClick={add}
      >
        {state === 'saving'
          ? 'Adding…'
          : state === 'done'
            ? 'Added ✓'
            : `Add to Google Doc as Leçon ${target.nextLessonNumber}`}
      </button>
      {message && (
        <span className={'hint' + (state === 'error' ? ' err' : '')} role="status">
          {message}
        </span>
      )}
    </div>
  );
}
