import { useEffect, useRef, useState } from 'react';

import { useTranslation } from '../i18n/core';
import { common } from '../i18n/messages/common';
import { paper } from '../i18n/messages/paper';
import { api, ApiError } from '../lib/api';
import { shrinkImage } from '../lib/image';
import { normalizePhoto, normalizePhotoItems } from '../lib/parse';
import { asFields, loadChecked, save } from '../lib/storage';
import type { PhotoItem } from '../lib/types';
import AddToDoc, { type DocTarget } from './AddToDoc';
import WaitingFact from './WaitingFact';
import WordNotesTable from './WordNotesTable';

const LAST_KEY = 'photo:last';
// long side in pixels: enough to read book print, small enough for the server's upload limit
const MAX_SIDE = 2000;

interface LastScan {
  items: PhotoItem[];
  at: number;
}

/** Photo of a book page with underlined words → translation, dictionary form, tense and a short explanation for each. */
/** "avoir raison — был прав (avait raison, imparfait, il)": one line of a lesson in the document. */
function docLine(item: PhotoItem): string {
  const notes = [item.base && item.base !== item.fr ? item.fr : '', item.tense]
    .filter(Boolean)
    .join(', ');
  return `${item.base || item.fr} — ${item.ru}${notes ? ` (${notes})` : ''}`;
}

export default function PhotoWords({
  hasClaude,
  target,
}: {
  hasClaude: boolean;
  target: DocTarget;
}) {
  const { t } = useTranslation(paper);
  const commonText = useTranslation(common);
  const [preview, setPreview] = useState<string | null>(null);
  const [scan, setScan] = useState<LastScan | null>(() =>
    loadChecked(LAST_KEY, (raw) => {
      const fields = asFields(raw, { at: 'number' });
      const items = normalizePhotoItems((raw as { items?: unknown }).items);
      return fields && items.length ? { at: fields.at, items } : null;
    })
  );
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');

  // the preview is an object URL: the old one is released when a new photo replaces it and
  // when the page is left
  const previewUrl = useRef<string | null>(null);
  const showPreview = (file: File) => {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = URL.createObjectURL(file);
    setPreview(previewUrl.current);
  };
  useEffect(
    () => () => {
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    },
    []
  );

  async function read(file: File) {
    showPreview(file);
    setState('loading');
    setError('');
    try {
      const items = normalizePhoto(await api.photo(await shrinkImage(file, MAX_SIDE)));
      const next = { items, at: Date.now() };
      save(LAST_KEY, next);
      setScan(next);
      setState('idle');
    } catch (failure) {
      setState('error');
      setError(failure instanceof ApiError ? failure.message : t('photoFailed'));
    }
  }

  return (
    <>
      <p className="hint photo-intro">{t('photoIntro')}</p>
      {!hasClaude ? (
        <p className="empty">{commonText.t('needsClaude')}</p>
      ) : (
        <>
          <div className="photo-pick">
            <label className="btn primary">
              {scan || preview ? t('anotherPhoto') : t('choosePhoto')}
              <input
                type="file"
                accept="image/*"
                hidden
                disabled={state === 'loading'}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = '';
                  if (file) void read(file);
                }}
              />
            </label>
            {preview && <img className="photo-preview" src={preview} alt={t('pageYouSent')} />}
          </div>
          {state === 'loading' && <WaitingFact>{t('readingUnderlined')}</WaitingFact>}
          {state === 'error' && (
            <div className="note err">
              <p>{error}</p>
            </div>
          )}
          {scan &&
            state !== 'loading' &&
            (scan.items.length ? (
              <>
                <WordNotesTable items={scan.items} firstColumn={t('colUnderlined')} />
                <AddToDoc key={scan.at} target={target} lines={scan.items.map(docLine)} />
              </>
            ) : (
              <p className="empty">{t('noUnderlined')}</p>
            ))}
        </>
      )}
    </>
  );
}
