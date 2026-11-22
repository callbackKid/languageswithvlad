import { useEffect, useRef, useState } from 'react';

import { api, ApiError } from '@/shared/api';
import { translator, useTranslation } from '@/shared/i18n/core';
import { common } from '@/shared/i18n/messages/common';
import { paper } from '@/shared/i18n/messages/paper';
import { shrinkImage } from '@/shared/lib/image';
import { asFields, loadChecked, save } from '@/shared/lib/storage';
import WaitingFact from '@/shared/ui/WaitingFact';

import { mergePhotoItems, normalizePhoto, normalizePhotoItems } from '../lib/parse';
import type { Lesson, PhotoItem } from '../lib/types';
import { docLine } from '../lib/wordActions';
import AddToDoc, { type DocTarget } from './AddToDoc';
import WordNotesTable from './WordNotesTable';

const LAST_KEY = 'photo:last';
// long side in pixels: enough to read book print, small enough for the server's upload limit
const MAX_SIDE = 2000;
// a few pages of a chapter at once; each photo goes in a request of its own, so the server's
// upload limit stays the same however many there are
const MAX_PHOTOS = 10;

interface LastScan {
  items: PhotoItem[];
  at: number;
}

/** Photos of book pages with underlined words (up to MAX_PHOTOS at once) → a translation,
    dictionary form, tense and short explanation for each word, ready to add to the document as a
    new lesson or under one of its lessons. */
export default function PhotoWords({
  hasClaude,
  target,
  lessons,
}: {
  hasClaude: boolean;
  target: DocTarget;
  lessons: Lesson[];
}) {
  const { t } = useTranslation(paper);
  const commonText = useTranslation(common);
  const [previews, setPreviews] = useState<string[]>([]);
  const [scan, setScan] = useState<LastScan | null>(() =>
    loadChecked(LAST_KEY, (raw) => {
      const fields = asFields(raw, { at: 'number' });
      const items = normalizePhotoItems((raw as { items?: unknown }).items);
      return fields && items.length ? { at: fields.at, items } : null;
    })
  );
  // which photo is being read, while they are read one after another
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState('');
  // the photos that couldn't be read, kept for Try again
  const [failed, setFailed] = useState<File[]>([]);

  // the previews are object URLs: the old ones are released when new photos replace them and
  // when the page is left
  const previewUrls = useRef<string[]>([]);
  // counts the readings, so one replaced by a newer reading (or by leaving the page) stops
  const reading = useRef(0);
  const showPreviews = (files: File[]) => {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrls.current = files.map((file) => URL.createObjectURL(file));
    setPreviews(previewUrls.current);
  };
  useEffect(
    () => () => {
      reading.current += 1;
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    },
    []
  );

  // Reads the photos one by one and adds their words to those already found (kept).
  async function read(files: File[], kept: PhotoItem[]) {
    reading.current += 1;
    const current = reading.current;
    setError('');
    setFailed([]);
    const found: PhotoItem[][] = [kept];
    const missed: File[] = [];
    let reason = '';
    for (const [index, file] of files.entries()) {
      setProgress({ current: index + 1, total: files.length });
      try {
        found.push(normalizePhoto(await api.photo(await shrinkImage(file, MAX_SIDE))));
      } catch (failure) {
        missed.push(file);
        if (failure instanceof ApiError) reason = failure.message;
      }
      if (current !== reading.current) return;
    }
    setProgress(null);
    const items = mergePhotoItems(found);
    if (items.length || !missed.length) {
      const next = { items, at: Date.now() };
      save(LAST_KEY, next);
      setScan(next);
    }
    setFailed(missed);
    // read at the moment of failure, so a new interface language is used
    if (missed.length)
      setError(reason || translator(paper).t('somePhotosFailed', { count: missed.length }));
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
              {scan || previews.length ? t('otherPhotos') : t('choosePhotos')}
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                disabled={!!progress}
                onChange={(event) => {
                  const files = [...(event.target.files ?? [])];
                  event.target.value = '';
                  if (files.length > MAX_PHOTOS) {
                    setError(t('tooManyPhotos', { count: MAX_PHOTOS }));
                    return;
                  }
                  if (!files.length) return;
                  showPreviews(files);
                  void read(files, []);
                }}
              />
            </label>
            <span className="hint">{t('photoLimit', { count: MAX_PHOTOS })}</span>
            {previews.length > 0 && (
              <div className="photo-previews">
                {previews.map((url, index) => (
                  <img
                    key={url}
                    className="photo-preview"
                    src={url}
                    alt={t('photoYouSent', { n: index + 1 })}
                  />
                ))}
              </div>
            )}
          </div>
          {progress && (
            <WaitingFact>
              {progress.total > 1 ? t('readingPhotos', progress) : t('readingUnderlined')}
            </WaitingFact>
          )}
          {error && !progress && (
            <div className="note err" role="alert">
              <p>{error}</p>
              {failed.length > 0 && (
                <button
                  type="button"
                  className="btn"
                  onClick={() => void read(failed, scan?.items ?? [])}
                >
                  {commonText.t('tryAgain')}
                </button>
              )}
            </div>
          )}
          {scan &&
            !progress &&
            (scan.items.length ? (
              <>
                <WordNotesTable items={scan.items} firstColumn={t('colUnderlined')} />
                <AddToDoc
                  key={scan.at}
                  target={target}
                  lines={scan.items.map(docLine)}
                  lessons={lessons}
                />
              </>
            ) : (
              <p className="empty">{t('noUnderlined')}</p>
            ))}
        </>
      )}
    </>
  );
}
