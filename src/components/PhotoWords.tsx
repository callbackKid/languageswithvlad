import { useState } from 'react';
import { api, ApiError } from '../lib/api';
import { shrinkImage } from '../lib/image';
import { normPhoto } from '../lib/parse';
import { load, save } from '../lib/storage';
import type { PhotoItem, Word } from '../lib/types';
import AddToDoc, { type DocTarget } from './AddToDoc';
import Speak from './Speak';
import Star from './Star';
import WaitingFact from './WaitingFact';

const LAST_KEY = 'photo:last';
// long side in pixels: enough to read book print, small enough for the server's upload limit
const MAX_SIDE = 2000;

interface LastScan {
  items: PhotoItem[];
  at: number;
}

/** What goes onto My words: the dictionary form when there is one. */
const asWord = (item: PhotoItem): Word => ({
  fr: item.base || item.fr,
  ru: item.ru,
  tr: '',
  kind: item.kind,
  added: false,
  language: 'fr',
});

/** Photo of a book page with underlined words → translation, dictionary form, tense and a short explanation for each. */
/** "avoir raison — был прав (avait raison, imparfait, il)": one line of a lesson in the document. */
function docLine(item: PhotoItem): string {
  const notes = [item.base && item.base !== item.fr ? item.fr : '', item.tense]
    .filter(Boolean)
    .join(', ');
  return `${item.base || item.fr} — ${item.ru}${notes ? ` (${notes})` : ''}`;
}

export default function PhotoWords({ ai, target }: { ai: boolean; target: DocTarget }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [scan, setScan] = useState<LastScan | null>(() => load<LastScan>(LAST_KEY));
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');

  async function read(file: File) {
    setPreview((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return URL.createObjectURL(file);
    });
    setState('loading');
    setError('');
    try {
      const items = normPhoto(await api.photo(await shrinkImage(file, MAX_SIDE)));
      const next = { items, at: Date.now() };
      save(LAST_KEY, next);
      setScan(next);
      setState('idle');
    } catch (failure) {
      setState('error');
      setError(
        failure instanceof ApiError ? failure.message : 'The photo couldn’t be read. Try again.'
      );
    }
  }

  return (
    <>
      <p className="hint photo-intro">
        Underline words in your book, take a photo of the page, and get a translation, the
        dictionary form, the tense and a short explanation for each.
      </p>
      {!ai ? (
        <p className="empty">Reading photos needs Claude, which isn’t set up on this server.</p>
      ) : (
        <>
          <div className="photo-pick">
            <label className="btn primary">
              {scan || preview ? 'Another photo' : 'Choose or take a photo'}
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
            {preview && <img className="photo-preview" src={preview} alt="The page you sent" />}
          </div>
          {state === 'loading' && <WaitingFact>Reading the underlined words…</WaitingFact>}
          {state === 'error' && (
            <div className="note err">
              <p>{error}</p>
            </div>
          )}
          {scan &&
            state !== 'loading' &&
            (scan.items.length ? (
              <div className="photo-table-wrap">
                <table className="photo-table">
                  <thead>
                    <tr>
                      <th>Underlined</th>
                      <th>Translation</th>
                      <th>Form</th>
                      <th>Explanation</th>
                      <th aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {scan.items.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <b lang="fr">{item.fr}</b>
                          {item.context && (
                            <div className="context" lang="fr">
                              {item.context}
                            </div>
                          )}
                        </td>
                        <td lang="ru">{item.ru}</td>
                        <td>
                          {item.base && (
                            <div lang="fr">
                              <i>{item.base}</i>
                            </div>
                          )}
                          {item.tense && <div className="tense">{item.tense}</div>}
                          {!item.base && !item.tense && <span className="muted">—</span>}
                        </td>
                        <td lang="ru" className="explanation">
                          {item.explanation}
                        </td>
                        <td className="actions">
                          <Speak text={item.fr} />
                          <Star word={asWord(item)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="legend">
                  ☆ adds the word to My words, so it comes back in exercises.
                </p>
                <AddToDoc key={scan.at} target={target} lines={scan.items.map(docLine)} />
              </div>
            ) : (
              <p className="empty">
                No underlined words found. Make sure the marks are visible and the page is in focus.
              </p>
            ))}
        </>
      )}
    </>
  );
}
