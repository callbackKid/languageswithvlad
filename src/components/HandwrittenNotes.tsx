import { useState } from 'react';
import { api, ApiError } from '../lib/api';
import { shrinkImage } from '../lib/image';
import { asObjectText } from '../lib/parse';
import { load, save } from '../lib/storage';
import type { Lesson } from '../lib/types';
import { hash } from '../lib/util';
import AddToDoc, { type DocTarget } from './AddToDoc';
import LessonView from './LessonView';

const STORAGE_KEY = 'handwritten';
// keep in step with MAX_PAGES in api/transcribe.ts
const MAX_PAGES = 4;
// smaller than for a book page: several pages have to fit in one upload
const MAX_SIDE = 1600;

interface HandwrittenLesson {
  id: string;
  title: string;
  text: string;
  at: number;
}

const toLesson = (entry: HandwrittenLesson, position: number): Lesson => ({
  key: 'hw-' + entry.id,
  n: position + 1,
  word: 'Leçon',
  date: new Date(entry.at),
  body: entry.text,
  hash: hash(entry.text),
  title: entry.title || `Handwritten notes ${position + 1}`,
});

/** Photos of handwritten lesson notes → text the student can correct → the same words, verbs and exercises as a lesson from the document. */
export default function HandwrittenNotes({ ai, target }: { ai: boolean; target: DocTarget }) {
  const [entries, setEntries] = useState<HandwrittenLesson[]>(
    () => load<HandwrittenLesson[]>(STORAGE_KEY) || []
  );
  const [currentId, setCurrentId] = useState<string | null>(() => entries[0]?.id ?? null);
  const [draft, setDraft] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');

  const store = (next: HandwrittenLesson[]) => {
    setEntries(next);
    save(STORAGE_KEY, next);
  };
  const currentIndex = entries.findIndex((entry) => entry.id === currentId);
  const current = currentIndex >= 0 ? entries[currentIndex] : null;

  async function read(files: File[]) {
    if (files.length > MAX_PAGES) {
      setState('error');
      setError(`Choose at most ${MAX_PAGES} pages at once.`);
      return;
    }
    setState('loading');
    setError('');
    try {
      const images = await Promise.all(files.map((file) => shrinkImage(file, MAX_SIDE)));
      const { title, text } = asObjectText(await api.transcribe(images), ['title', 'text']);
      if (!text) throw new ApiError(0, 'empty', 'No handwriting was found in these photos.');
      const entry: HandwrittenLesson = { id: Date.now().toString(36), title, text, at: Date.now() };
      store([entry, ...entries]);
      setCurrentId(entry.id);
      // the student checks the transcription before the lesson is prepared
      setDraft(text);
      setState('idle');
    } catch (failure) {
      setState('error');
      setError(
        failure instanceof ApiError ? failure.message : 'The photos couldn’t be read. Try again.'
      );
    }
  }

  function saveDraft() {
    if (!current || draft === null) return;
    const text = draft.trim();
    if (text) store(entries.map((entry) => (entry.id === current.id ? { ...entry, text } : entry)));
    setDraft(null);
  }

  function remove() {
    if (!current || !window.confirm(`Delete “${current.title || 'these notes'}”?`)) return;
    const next = entries.filter((entry) => entry.id !== current.id);
    store(next);
    setCurrentId(next[0]?.id ?? null);
    setDraft(null);
  }

  if (!ai)
    return (
      <p className="empty">Reading handwriting needs Claude, which isn’t set up on this server.</p>
    );

  return (
    <>
      <p className="hint photo-intro">
        Take photos of handwritten lesson notes (up to {MAX_PAGES} pages at once). You can fix
        anything misread, then practise the words and verbs like any other lesson.
      </p>
      <div className="photo-pick">
        <label className="btn primary">
          {entries.length ? 'New notes from photos' : 'Choose or take photos'}
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            disabled={state === 'loading'}
            onChange={(event) => {
              const files = Array.from(event.target.files || []);
              event.target.value = '';
              if (files.length) void read(files);
            }}
          />
        </label>
        {entries.length > 1 && (
          <select
            aria-label="Saved notes"
            value={currentId ?? ''}
            onChange={(event) => {
              setCurrentId(event.target.value);
              setDraft(null);
            }}
          >
            {entries.map((entry, position) => (
              <option key={entry.id} value={entry.id}>
                {entry.title || `Handwritten notes ${entries.length - position}`}
              </option>
            ))}
          </select>
        )}
      </div>
      {state === 'loading' && (
        <div className="note info">
          <span className="spinner" />
          <p>Reading the handwriting…</p>
        </div>
      )}
      {state === 'error' && (
        <div className="note err">
          <p>{error}</p>
        </div>
      )}

      {current &&
        state !== 'loading' &&
        (draft !== null ? (
          <section className="panel solo">
            <div className="body">
              <p className="hint">
                Check the text against your notes. Words that couldn’t be read are marked [?].
              </p>
              <textarea
                className="transcript"
                lang="fr"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                spellCheck={false}
              />
              <div className="row-actions">
                <button className="btn primary" onClick={saveDraft}>
                  Prepare lesson
                </button>
                <button className="btn ghost" onClick={() => setDraft(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </section>
        ) : (
          <>
            <div className="row-actions handwritten-actions">
              <button className="btn ghost" onClick={() => setDraft(current.text)}>
                Edit text
              </button>
              <button className="btn ghost" onClick={remove}>
                Delete
              </button>
            </div>
            <AddToDoc
              key={current.id + hash(current.text)}
              target={target}
              lines={current.text.split('\n')}
            />
            <LessonView
              key={current.id + hash(current.text)}
              lesson={toLesson(current, entries.length - 1 - currentIndex)}
              docId="handwritten"
              ai={ai}
            />
          </>
        ))}
    </>
  );
}
