import { useState } from 'react';
import { api, ApiError } from '../lib/api';
import { shrinkImage } from '../lib/image';
import { extractPages, MAX_PDF_PAGES, pdfPageCount } from '../lib/pdf';
import { asObjectText } from '../lib/parse';
import { load, save } from '../lib/storage';
import type { Lesson } from '../lib/types';
import { hash } from '../lib/util';
import AddToDoc, { type DocTarget } from './AddToDoc';
import LessonView from './LessonView';
import WaitingFact from './WaitingFact';

/** Where the lesson comes from: photos of handwritten notes, or pages of a textbook PDF. */
export type PaperSource = 'handwritten' | 'textbook';

const SOURCES: Record<
  PaperSource,
  { storageKey: string; keyPrefix: string; name: string; reading: string }
> = {
  handwritten: {
    storageKey: 'handwritten',
    keyPrefix: 'hw-',
    name: 'Handwritten notes',
    reading: 'Reading the handwriting…',
  },
  textbook: {
    storageKey: 'textbook',
    keyPrefix: 'tb-',
    name: 'Textbook chapter',
    reading: 'Reading the pages and writing lesson notes…',
  },
};
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

const toLesson = (entry: HandwrittenLesson, position: number, source: PaperSource): Lesson => ({
  key: SOURCES[source].keyPrefix + entry.id,
  n: position + 1,
  word: 'Leçon',
  date: new Date(entry.at),
  body: entry.text,
  hash: hash(entry.text),
  title: entry.title || `${SOURCES[source].name} ${position + 1}`,
});

/** Photos of handwritten notes, or pages of a textbook PDF → text the student can correct → the same words, verbs and exercises as a lesson from the document. */
export default function HandwrittenNotes({
  ai,
  target,
  source,
}: {
  ai: boolean;
  target: DocTarget;
  source: PaperSource;
}) {
  const { storageKey, name, reading } = SOURCES[source];
  const [entries, setEntries] = useState<HandwrittenLesson[]>(
    () => load<HandwrittenLesson[]>(storageKey) || []
  );
  // the PDF waiting for the student to choose its pages
  const [pdf, setPdf] = useState<{ file: File; pageCount: number } | null>(null);
  const [firstPage, setFirstPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [currentId, setCurrentId] = useState<string | null>(() => entries[0]?.id ?? null);
  const [draft, setDraft] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');

  const store = (next: HandwrittenLesson[]) => {
    setEntries(next);
    save(storageKey, next);
  };
  const currentIndex = entries.findIndex((entry) => entry.id === currentId);
  const current = currentIndex >= 0 ? entries[currentIndex] : null;

  /** Adds the notes Claude wrote as a new saved lesson and opens them for checking. */
  function addEntry(answer: unknown, nothingFound: string) {
    const { title, text } = asObjectText(answer, ['title', 'text']);
    if (!text) throw new ApiError(0, 'empty', nothingFound);
    const entry: HandwrittenLesson = { id: Date.now().toString(36), title, text, at: Date.now() };
    store([entry, ...entries]);
    setCurrentId(entry.id);
    // the student checks the text before the lesson is prepared
    setDraft(text);
  }

  async function openPdf(file: File) {
    setState('loading');
    setError('');
    try {
      const pageCount = await pdfPageCount(file);
      setPdf({ file, pageCount });
      setFirstPage(1);
      setLastPage(Math.min(pageCount, MAX_PDF_PAGES));
      setState('idle');
    } catch {
      setState('error');
      setError('This PDF couldn’t be opened. Try another file.');
    }
  }

  async function readPdf() {
    if (!pdf) return;
    setState('loading');
    setError('');
    try {
      const pages = await extractPages(pdf.file, firstPage, lastPage);
      if ('error' in pages) throw new ApiError(0, 'pages', pages.error);
      addEntry(await api.textbook(pages.data), 'No lesson content was found on these pages.');
      setPdf(null);
      setState('idle');
    } catch (failure) {
      setState('error');
      setError(
        failure instanceof ApiError ? failure.message : 'The pages couldn’t be read. Try again.'
      );
    }
  }

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
      addEntry(await api.transcribe(images), 'No handwriting was found in these photos.');
      setState('idle');
      return;
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
      <p className="empty">
        Reading {source === 'textbook' ? 'textbooks' : 'handwriting'} needs Claude, which isn’t set
        up on this server.
      </p>
    );

  return (
    <>
      {source === 'textbook' ? (
        <p className="hint photo-intro">
          Choose a textbook PDF and the pages of one chapter (up to {MAX_PDF_PAGES}). Claude writes
          lesson notes from them: words, phrases, grammar and examples. Check them, then practise
          like any other lesson.
        </p>
      ) : (
        <p className="hint photo-intro">
          Take photos of handwritten lesson notes (up to {MAX_PAGES} pages at once). You can fix
          anything misread, then practise the words and verbs like any other lesson.
        </p>
      )}
      <div className="photo-pick">
        <label className="btn primary">
          {source === 'textbook'
            ? pdf
              ? 'Another PDF'
              : 'Choose a PDF'
            : entries.length
              ? 'New notes from photos'
              : 'Choose or take photos'}
          {source === 'textbook' ? (
            <input
              type="file"
              accept="application/pdf"
              hidden
              disabled={state === 'loading'}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (file) void openPdf(file);
              }}
            />
          ) : (
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
          )}
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
                {entry.title || `${name} ${entries.length - position}`}
              </option>
            ))}
          </select>
        )}
      </div>
      {pdf && state !== 'loading' && (
        <form
          className="pdf-pages"
          onSubmit={(event) => {
            event.preventDefault();
            void readPdf();
          }}
        >
          <span className="pdf-name">
            {pdf.file.name} · {pdf.pageCount} pages
          </span>
          <label>
            From page{' '}
            <input
              type="number"
              min={1}
              max={pdf.pageCount}
              value={firstPage}
              onChange={(event) => setFirstPage(Number(event.target.value))}
            />
          </label>
          <label>
            to{' '}
            <input
              type="number"
              min={1}
              max={pdf.pageCount}
              value={lastPage}
              onChange={(event) => setLastPage(Number(event.target.value))}
            />
          </label>
          <button className="btn primary" type="submit">
            Read these pages
          </button>
        </form>
      )}
      {state === 'loading' && (
        <WaitingFact>
          {pdf ? reading : source === 'textbook' ? 'Opening the PDF…' : reading}
        </WaitingFact>
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
                {source === 'textbook'
                  ? 'Check the notes against the textbook: remove what you don’t need, add what’s missing.'
                  : 'Check the text against your notes. Words that couldn’t be read are marked [?].'}
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
              lesson={toLesson(current, entries.length - 1 - currentIndex, source)}
              docId={storageKey}
              ai={ai}
            />
          </>
        ))}
    </>
  );
}
