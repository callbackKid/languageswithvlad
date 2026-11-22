import type { VercelRequest, VercelResponse } from '@vercel/node';

import { claudeJSON, MODEL, readImages } from './_lib/claude.js';
import { asLevels, checkAccess, fail, HttpError, onlyPost } from './_lib/http.js';
import {
  BOOK_PARTS,
  bookExercisesPrompt,
  type BookPart,
  photoPrompt,
  textbookPrompt,
  transcribePrompt,
} from './_lib/prompts.js';

/* Everything that starts from paper, in one function (Vercel's free plan allows 12 per project):
   - "underlined": the words a learner underlined on a photo of a book page;
   - "handwritten": photos of handwritten lesson notes, as text;
   - "textbook": pages of a textbook chapter (a PDF), as lesson notes;
   - "exercises": a student's book pages (photos or PDF pages) copied out as text for a lesson: the
     exercises, the reading text and/or the grammar (body.parts), never their answers. */

// keep in step with MAX_PAGES in src/pages/photo/ui/HandwrittenNotes.tsx
const MAX_HANDWRITTEN_PAGES = 4;
// The app cuts the chosen pages out of the PDF before sending; Vercel refuses bodies over 4.5 MB.
// Keep in step with MAX_BASE64_LENGTH in src/shared/lib/pdf.ts.
const MAX_PDF_BASE64_LENGTH = 4_000_000;

// From paper: underlined words on a photo, handwritten notes, textbook pages or exercises from the book (body.kind).
export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!onlyPost(request, response) || !checkAccess(request, response)) return;
  const kind: unknown = request.body?.kind;
  try {
    const data = typeof request.body?.data === 'string' ? request.body.data : '';
    if (kind === 'textbook' || (kind === 'exercises' && data)) {
      if (!data) return response.status(400).json({ error: 'nothing_sent' });
      if (data.length > MAX_PDF_BASE64_LENGTH)
        return response.status(413).json({ error: 'too_long' });
      // a real PDF starts with "%PDF", which is "JVBERi" in base64
      if (!data.startsWith('JVBERi')) return response.status(400).json({ error: 'not_pdf' });
      const prompt =
        kind === 'textbook'
          ? textbookPrompt(asLevels(request.body?.levels))
          : bookExercisesPrompt(bookParts(request.body?.parts));
      return response
        .status(200)
        .json(await claudeJSON(prompt, { model: MODEL, maxTokens: 16000, pdfs: [data] }));
    }
    if (kind !== 'underlined' && kind !== 'handwritten' && kind !== 'exercises')
      return response.status(400).json({ error: 'bad_request' });

    const images = readImages(request.body, kind === 'underlined' ? 1 : MAX_HANDWRITTEN_PAGES);
    if (images instanceof HttpError) return fail(response, images);
    const prompt =
      kind === 'handwritten'
        ? transcribePrompt(images.length)
        : kind === 'exercises'
          ? bookExercisesPrompt(bookParts(request.body?.parts))
          : photoPrompt(asLevels(request.body?.levels));
    return response.status(200).json(
      await claudeJSON(prompt, {
        model: MODEL,
        maxTokens: kind === 'underlined' ? 8000 : 16000,
        images,
      })
    );
  } catch (error) {
    return fail(response, error);
  }
}

// The parts of a book page asked for, the known ones only; the exercises when none is.
function bookParts(value: unknown): BookPart[] {
  const asked = Array.isArray(value) ? value : [];
  const parts = BOOK_PARTS.filter((part) => asked.includes(part));
  return parts.length ? parts : ['exercises'];
}
