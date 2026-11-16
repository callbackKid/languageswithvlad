import type { VercelRequest, VercelResponse } from '@vercel/node';

import { claudeJSON, MODEL, readImages } from './_lib/claude.js';
import { checkAccess, fail, onlyPost } from './_lib/http.js';
import {
  bookExercisesPrompt,
  photoPrompt,
  textbookPrompt,
  transcribePrompt,
} from './_lib/prompts.js';

/* Everything that starts from paper, in one function (Vercel's free plan allows 12 per project):
   - "underlined": the words a learner underlined on a photo of a book page;
   - "handwritten": photos of handwritten lesson notes, as text;
   - "textbook": pages of a textbook chapter (a PDF), as lesson notes;
   - "exercises": exercises from a student's book (photos or PDF pages), copied out as text. */

// keep in step with MAX_PAGES in src/components/HandwrittenNotes.tsx
const MAX_HANDWRITTEN_PAGES = 4;
// The app cuts the chosen pages out of the PDF before sending; Vercel refuses bodies over 4.5 MB.
// Keep in step with MAX_BASE64_LENGTH in src/lib/pdf.ts.
const MAX_PDF_BASE64_LENGTH = 4_000_000;

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!onlyPost(request, response) || !checkAccess(request, response)) return;
  const kind: unknown = request.body?.kind;
  try {
    const data = typeof request.body?.data === 'string' ? request.body.data : '';
    if (kind === 'textbook' || (kind === 'exercises' && data)) {
      if (!data) return response.status(400).json({ error: 'Send a PDF.' });
      if (data.length > MAX_PDF_BASE64_LENGTH)
        return response
          .status(413)
          .json({ error: 'These pages are too large. Choose fewer pages.' });
      // a real PDF starts with "%PDF", which is "JVBERi" in base64
      if (!data.startsWith('JVBERi'))
        return response.status(400).json({ error: 'This isn’t a PDF.' });
      const prompt = kind === 'textbook' ? textbookPrompt() : bookExercisesPrompt();
      return response
        .status(200)
        .json(await claudeJSON(prompt, { model: MODEL, maxTokens: 16000, pdfs: [data] }));
    }
    if (kind !== 'underlined' && kind !== 'handwritten' && kind !== 'exercises')
      return response.status(400).json({ error: 'Unknown kind of page.' });

    const images = readImages(request.body, kind === 'underlined' ? 1 : MAX_HANDWRITTEN_PAGES);
    if (typeof images === 'string') return response.status(400).json({ error: images });
    const prompt =
      kind === 'handwritten'
        ? transcribePrompt(images.length)
        : kind === 'exercises'
          ? bookExercisesPrompt()
          : photoPrompt();
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
