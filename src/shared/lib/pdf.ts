import { translator } from '@/shared/i18n/core';
import { paper } from '@/shared/i18n/messages/paper';
/* Cutting pages out of a PDF in the browser, so only the chapter is uploaded: Vercel accepts
   at most 4.5 MB per request and whole textbooks are much larger. pdf-lib is loaded only when
   a PDF is actually opened, so it doesn't slow down the rest of the app. */

// Most pages read at once; a chapter is usually 4–15.
export const MAX_PDF_PAGES = 20;
// keep in step with MAX_PDF_BASE64_LENGTH in api/paper.ts
const MAX_BASE64_LENGTH = 4_000_000;

async function loadPdf(file: File) {
  const { PDFDocument } = await import('pdf-lib');
  // some textbooks are "encrypted" only to forbid editing; their pages can still be copied
  return {
    PDFDocument,
    source: await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true }),
  };
}

// How many pages a PDF has, read in the browser.
export async function pdfPageCount(file: File): Promise<number> {
  return (await loadPdf(file)).source.getPageCount();
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  // in chunks: String.fromCharCode with a whole book's bytes at once overflows the call stack
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

// Pages firstPage…lastPage (counting from 1) as a new PDF, in base64; a string error when it can't be sent.
export async function extractPages(
  file: File,
  firstPage: number,
  lastPage: number
): Promise<{ data: string } | { error: string }> {
  const { PDFDocument, source } = await loadPdf(file);
  const pageCount = source.getPageCount();
  if (firstPage < 1 || lastPage > pageCount || firstPage > lastPage)
    return { error: translator(paper).t('pagesRange', { count: pageCount }) };
  if (lastPage - firstPage + 1 > MAX_PDF_PAGES)
    return { error: translator(paper).t('tooManyPages', { count: MAX_PDF_PAGES }) };
  const chapter = await PDFDocument.create();
  const indexes = Array.from(
    { length: lastPage - firstPage + 1 },
    (_unused, offset) => firstPage - 1 + offset
  );
  for (const page of await chapter.copyPages(source, indexes)) chapter.addPage(page);
  const data = toBase64(await chapter.save());
  if (data.length > MAX_BASE64_LENGTH)
    return {
      error: translator(paper).t('pagesTooLarge'),
    };
  return { data };
}
