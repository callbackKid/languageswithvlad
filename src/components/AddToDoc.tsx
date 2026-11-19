import { useState } from 'react';

import { useTranslation } from '../i18n/core';
import { common } from '../i18n/messages/common';
import { api, ApiError } from '../lib/api';
import { documentDate } from '../lib/dates';

/** Where new lessons go: the connected document, the lesson number to use next, and whether the server can write. */
export interface DocTarget {
  docId: string;
  nextLessonNumber: number;
  docWriter: string | null;
}

/** "13.11.2026 8 Leçon" and the lines under it, in the format the app reads lessons from. */
export function lessonText(lessonNumber: number, lines: string[]): string {
  const heading = `${documentDate(new Date())} ${lessonNumber} Leçon`;
  return `\n\n${heading}\n${lines
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')}\n`;
}

/** Appends the lines to the Google Doc as a new lesson, then asks the app to sync. */
export default function AddToDoc({ target, lines }: { target: DocTarget; lines: string[] }) {
  const { t } = useTranslation(common);
  const [state, setState] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!target.docWriter) return <p className="hint">{t('docWriterMissing')}</p>;

  async function add() {
    setState('saving');
    try {
      await api.append(target.docId, lessonText(target.nextLessonNumber, lines));
      setState('done');
      setMessage(t('addedAs', { number: target.nextLessonNumber }));
      window.dispatchEvent(new Event('cahier:doc-changed'));
    } catch (error) {
      setState('error');
      setMessage(error instanceof ApiError ? error.message : t('addFailed'));
    }
  }

  return (
    <div className="row-actions add-to-doc">
      <button
        type="button"
        className="btn"
        disabled={state === 'saving' || state === 'done' || !lines.length}
        onClick={add}
      >
        {state === 'saving'
          ? t('adding')
          : state === 'done'
            ? t('added')
            : t('addAsLesson', { number: target.nextLessonNumber })}
      </button>
      {message && (
        <span className={'hint' + (state === 'error' ? ' err' : '')} role="status">
          {message}
        </span>
      )}
    </div>
  );
}
