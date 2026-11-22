import { useState } from 'react';

import { api, ApiError, BOOK_PARTS, type BookPart } from '@/shared/api';
import { common, paper, translator, useTranslation } from '@/shared/i18n';
import { shrinkImage } from '@/shared/lib/image';
import { asObjectText } from '@/shared/lib/json';
import { extractPages, pdfPageCount } from '@/shared/lib/pdf';
import WaitingFact from '@/shared/ui/WaitingFact';

// keep in step with MAX_HANDWRITTEN_PAGES in api/paper.ts
const MAX_PHOTOS = 4;
const MAX_SIDE = 1600;

type Step = 'idle' | 'reading' | 'review' | 'saving' | 'done';

/** Pages of the student's book, photographed or picked from a PDF: Claude copies out the parts
    ticked (the exercises, the text, the grammar) without any answers, the teacher or student
    checks the text, and it is written under this lesson in the document, so both of them see it
    on every device. */
export default function BookImport({
  docId,
  lessonKey,
  docWriter,
  embedded = false,
}: {
  docId: string;
  lessonKey: string;
  docWriter: boolean;
  // inside a card that already has the title (lesson mode)
  embedded?: boolean;
}) {
  const { t } = useTranslation(paper);
  const commonText = useTranslation(common);
  const [step, setStep] = useState<Step>('idle');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [parts, setParts] = useState<BookPart[]>(['exercises']);
  const [pdf, setPdf] = useState<{ file: File; pageCount: number } | null>(null);
  const [firstPage, setFirstPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const failed = (failure: unknown, fallback: string) => {
    setStep('idle');
    setError(failure instanceof ApiError ? failure.message : fallback);
  };
  async function readPages(pages: Parameters<typeof api.bookExercises>[0]) {
    setStep('reading');
    setError('');
    try {
      const { text: copied } = asObjectText(await api.bookExercises(pages, parts), ['text']);
      if (!copied) throw new Error('empty');
      setText(copied);
      setPdf(null);
      setStep('review');
    } catch (failure) {
      failed(failure, translator(paper).t('bookFailed'));
    }
  }
  async function readPhotos(files: File[]) {
    if (files.length > MAX_PHOTOS) {
      setError(t('tooManyPhotos', { count: MAX_PHOTOS }));
      return;
    }
    try {
      await readPages({
        images: await Promise.all(files.map((file) => shrinkImage(file, MAX_SIDE))),
      });
    } catch (failure) {
      failed(failure, translator(paper).t('photosFailed'));
    }
  }
  async function openPdf(file: File) {
    setError('');
    try {
      const pageCount = await pdfPageCount(file);
      setPdf({ file, pageCount });
      setFirstPage(1);
      setLastPage(Math.min(pageCount, 2));
    } catch {
      setError(t('pdfFailed'));
    }
  }
  async function readPdf() {
    if (!pdf) return;
    const pages = await extractPages(pdf.file, firstPage, lastPage).catch(() => null);
    if (!pages) setError(t('pdfFailed'));
    else if ('error' in pages) setError(pages.error);
    else await readPages({ data: pages.data });
  }
  async function add() {
    setStep('saving');
    setError('');
    try {
      await api.append(docId, text, lessonKey);
      setStep('done');
      // the app syncs, and the exercises come back as part of this lesson
      window.dispatchEvent(new Event('cahier:doc-changed'));
    } catch (failure) {
      setStep('review');
      setError(failure instanceof ApiError ? failure.message : commonText.t('addFailed'));
    }
  }

  return (
    <section className="book-import">
      {!embedded && <h2>{t('importBook')}</h2>}
      {!docWriter ? (
        <p className="hint">{commonText.t('docWriterMissing')}</p>
      ) : (
        <>
          <p className="hint">{t('importBookHint', { count: MAX_PHOTOS })}</p>
          {(step === 'idle' || step === 'done') && (
            <fieldset className="book-parts">
              <legend>{t('takeFromPage')}</legend>
              {BOOK_PARTS.map((part) => (
                <label key={part} className="check">
                  <input
                    type="checkbox"
                    checked={parts.includes(part)}
                    onChange={(event) =>
                      setParts(
                        event.target.checked
                          ? BOOK_PARTS.filter((kept) => kept === part || parts.includes(kept))
                          : parts.filter((kept) => kept !== part)
                      )
                    }
                  />
                  {t(`part.${part}`)}
                </label>
              ))}
              {!parts.length && <span className="hint">{t('pickPart')}</span>}
            </fieldset>
          )}
          {(step === 'idle' || step === 'done') && parts.length > 0 && (
            <div className="row-actions">
              <label className="btn">
                {t('choosePhotos')}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(event) => {
                    const files = Array.from(event.target.files || []);
                    event.target.value = '';
                    if (files.length) void readPhotos(files);
                  }}
                />
              </label>
              <label className="btn">
                {pdf ? t('anotherPdf') : t('choosePdf')}
                <input
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = '';
                    if (file) void openPdf(file);
                  }}
                />
              </label>
            </div>
          )}
          {pdf && step === 'idle' && (
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
          {step === 'reading' && <WaitingFact>{t('readingBook')}</WaitingFact>}
          {(step === 'review' || step === 'saving') && (
            <>
              <p className="hint">{t('checkBook')}</p>
              <textarea
                className="notes book-text"
                value={text}
                aria-label={t('importBook')}
                onChange={(event) => setText(event.target.value)}
              />
              <div className="row-actions">
                <button
                  type="button"
                  className="btn primary"
                  disabled={step === 'saving' || !text.trim()}
                  onClick={() => void add()}
                >
                  {step === 'saving' ? commonText.t('adding') : t('addToLesson')}
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  disabled={step === 'saving'}
                  onClick={() => setStep('idle')}
                >
                  {commonText.t('cancel')}
                </button>
              </div>
            </>
          )}
          {step === 'done' && (
            <p className="hint" role="status">
              {t('addedToLesson')}
            </p>
          )}
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
        </>
      )}
    </section>
  );
}
