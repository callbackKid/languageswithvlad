import { useState } from 'react';

import { type Lesson } from '@/entities/lesson';
import { AddToDoc, type DocTarget } from '@/features/add-to-doc';
import { api, ApiError } from '@/shared/api';
import { common, paper, useTranslation } from '@/shared/i18n';
import { shrinkImage } from '@/shared/lib/image';
import { asObjectText } from '@/shared/lib/json';
import { extractPages, MAX_PDF_PAGES, pdfPageCount } from '@/shared/lib/pdf';
import { asFields, asList, load, save } from '@/shared/lib/storage';
import { hash } from '@/shared/lib/util';
import InlineConfirm from '@/shared/ui/InlineConfirm';
import WaitingFact from '@/shared/ui/WaitingFact';
import { LessonView } from '@/widgets/lesson-view';
import { WordsTab } from '@/widgets/word-list';

// Where the lesson comes from: photos of handwritten notes, or pages of a textbook PDF.
export type PaperSource = 'handwritten' | 'textbook';

const SOURCES: Record<PaperSource, { storageKey: string; keyPrefix: string }> = {
  handwritten: { storageKey: 'handwritten', keyPrefix: 'hw-' },
  textbook: { storageKey: 'textbook', keyPrefix: 'tb-' },
};
// the pages that go to Claude in one request; keep in step with MAX_HANDWRITTEN_PAGES in api/paper.ts
const PAGES_PER_REQUEST = 4;
// a long lesson's notes: read PAGES_PER_REQUEST at a time, in order, and joined into one text
const MAX_PAGES = 10;
// smaller than for a book page: several pages have to fit in one upload
const MAX_SIDE = 1600;

interface HandwrittenLesson {
  id: string;
  title: string;
  text: string;
  at: number;
}

const toLesson = (
  entry: HandwrittenLesson,
  position: number,
  source: PaperSource,
  name: string
): Lesson => ({
  key: SOURCES[source].keyPrefix + entry.id,
  n: position + 1,
  word: 'Leçon',
  date: new Date(entry.at),
  body: entry.text,
  hash: hash(entry.text),
  title: entry.title || `${name} ${position + 1}`,
});

// Photos of handwritten notes, or pages of a textbook PDF → text the student can correct → the same words, verbs and exercises as a lesson from the document.
export default function HandwrittenNotes({
  hasClaude,
  target,
  source,
}: {
  hasClaude: boolean;
  target: DocTarget;
  source: PaperSource;
}) {
  const { t } = useTranslation(paper);
  const commonText = useTranslation(common);
  const { storageKey } = SOURCES[source];
  const name = t(`name.${source}`);
  const reading = t(`reading.${source}`);
  const [entries, setEntries] = useState<HandwrittenLesson[]>(() =>
    asList(load<unknown>(storageKey), (raw) =>
      asFields(raw, { id: 'string', title: 'string', text: 'string', at: 'number' })
    )
  );
  // the PDF waiting for the student to choose its pages
  const [pdf, setPdf] = useState<{ file: File; pageCount: number } | null>(null);
  const [firstPage, setFirstPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [currentId, setCurrentId] = useState<string | null>(() => entries[0]?.id ?? null);
  // the notes whose Delete was pressed: the question under the buttons asks first
  const [deleting, setDeleting] = useState<string | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');
  // which pages are being read, when there are more than one request takes
  const [progress, setProgress] = useState<{ from: number; to: number; total: number } | null>(
    null
  );

  const store = (next: HandwrittenLesson[]) => {
    setEntries(next);
    save(storageKey, next);
  };
  const currentIndex = entries.findIndex((entry) => entry.id === currentId);
  const current = currentIndex >= 0 ? entries[currentIndex] : null;

  // Adds the notes Claude wrote as a new saved lesson and opens them for checking.
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
      setError(t('pdfFailed'));
    }
  }

  async function readPdf() {
    if (!pdf) return;
    setState('loading');
    setError('');
    try {
      const pages = await extractPages(pdf.file, firstPage, lastPage);
      if ('error' in pages) throw new ApiError(0, 'pages', pages.error);
      addEntry(await api.textbook(pages.data), t('noTextbookContent'));
      setPdf(null);
      setState('idle');
    } catch (failure) {
      setState('error');
      setError(failure instanceof ApiError ? failure.message : t('pagesFailed'));
    }
  }

  async function read(files: File[]) {
    if (files.length > MAX_PAGES) {
      setState('error');
      setError(t('tooManyPages', { count: MAX_PAGES }));
      return;
    }
    setState('loading');
    setError('');
    try {
      const parts: { title: string; text: string }[] = [];
      for (let start = 0; start < files.length; start += PAGES_PER_REQUEST) {
        const batch = files.slice(start, start + PAGES_PER_REQUEST);
        if (files.length > PAGES_PER_REQUEST)
          setProgress({ from: start + 1, to: start + batch.length, total: files.length });
        const images = await Promise.all(batch.map((file) => shrinkImage(file, MAX_SIDE)));
        parts.push(asObjectText(await api.transcribe(images), ['title', 'text']));
      }
      // pages are separated by an empty line, as Claude does within one request
      const text = parts
        .map((part) => part.text)
        .filter(Boolean)
        .join('\n\n');
      addEntry({ title: parts.find((part) => part.text)?.title ?? '', text }, t('noHandwriting'));
      setState('idle');
    } catch (failure) {
      setState('error');
      setError(failure instanceof ApiError ? failure.message : t('photosFailed'));
    } finally {
      setProgress(null);
    }
  }

  function saveDraft() {
    if (!current || draft === null) return;
    const text = draft.trim();
    if (text) store(entries.map((entry) => (entry.id === current.id ? { ...entry, text } : entry)));
    setDraft(null);
  }

  function remove() {
    setDeleting(null);
    if (!current) return;
    const next = entries.filter((entry) => entry.id !== current.id);
    store(next);
    setCurrentId(next[0]?.id ?? null);
    setDraft(null);
  }

  if (!hasClaude) return <p className="empty">{commonText.t('needsClaude')}</p>;

  return (
    <>
      {source === 'textbook' ? (
        <p className="hint photo-intro">{t('textbookIntro', { count: MAX_PDF_PAGES })}</p>
      ) : (
        <p className="hint photo-intro">{t('handwrittenIntro', { count: MAX_PAGES })}</p>
      )}
      <div className="photo-pick">
        <label className="btn primary">
          {source === 'textbook'
            ? pdf
              ? t('anotherPdf')
              : t('choosePdf')
            : entries.length
              ? t('newNotes')
              : t('choosePhotos')}
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
            aria-label={t('savedNotes')}
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
            {pdf.file.name} · {t('pageCount', { count: pdf.pageCount })}
          </span>
          <label>
            {t('fromPage')}{' '}
            <input
              type="number"
              min={1}
              max={pdf.pageCount}
              value={firstPage}
              onChange={(event) => setFirstPage(Number(event.target.value))}
            />
          </label>
          <label>
            {t('toPage')}{' '}
            <input
              type="number"
              min={1}
              max={pdf.pageCount}
              value={lastPage}
              onChange={(event) => setLastPage(Number(event.target.value))}
            />
          </label>
          <button className="btn primary" type="submit">
            {t('readPages')}
          </button>
        </form>
      )}
      {state === 'loading' && (
        <WaitingFact>
          {progress
            ? t('readingPages', progress)
            : pdf
              ? reading
              : source === 'textbook'
                ? t('openingPdf')
                : reading}
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
                {source === 'textbook' ? t('checkTextbook') : t('checkHandwriting')}
              </p>
              <textarea
                className="transcript"
                lang="fr"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                spellCheck={false}
              />
              <div className="row-actions">
                <button type="button" className="btn primary" onClick={saveDraft}>
                  {t('prepareLesson')}
                </button>
                <button type="button" className="btn ghost" onClick={() => setDraft(null)}>
                  {commonText.t('cancel')}
                </button>
              </div>
            </div>
          </section>
        ) : (
          <>
            <div className="row-actions handwritten-actions">
              <button type="button" className="btn ghost" onClick={() => setDraft(current.text)}>
                {t('editText')}
              </button>
              <button
                type="button"
                className="btn ghost"
                aria-expanded={deleting === current.id}
                onClick={() => setDeleting(deleting === current.id ? null : current.id)}
              >
                {t('delete')}
              </button>
              {deleting === current.id && (
                <InlineConfirm
                  question={t('deleteConfirm', { title: current.title || t('theseNotes') })}
                  yesLabel={t('delete')}
                  onYes={remove}
                  onNo={() => setDeleting(null)}
                />
              )}
            </div>
            <AddToDoc
              key={current.id + hash(current.text)}
              target={target}
              lines={current.text.split('\n')}
            />
            <LessonView
              key={current.id + hash(current.text)}
              lesson={toLesson(current, entries.length - 1 - currentIndex, source, name)}
              docId={storageKey}
              hasClaude={hasClaude}
              renderWords={(props) => <WordsTab grouped {...props} />}
            />
          </>
        ))}
    </>
  );
}
