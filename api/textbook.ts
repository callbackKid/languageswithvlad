import type { VercelRequest, VercelResponse } from '@vercel/node';

import { claudeJSON, MODEL } from './_lib/claude.js';
import { checkAccess, fail, onlyPost } from './_lib/http.js';
import { textbookPrompt } from './_lib/prompts.js';

// The app cuts the chosen pages out of the PDF before sending; Vercel refuses bodies over 4.5 MB.
const MAX_BASE64_LENGTH = 4_000_000;

/** Turns pages of a textbook chapter (a PDF) into lesson notes, which the app then prepares like any lesson. */
export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!onlyPost(request, response) || !checkAccess(request, response)) return;
  const data = typeof request.body?.data === 'string' ? request.body.data : '';
  if (!data) return response.status(400).json({ error: 'Send a PDF.' });
  if (data.length > MAX_BASE64_LENGTH)
    return response.status(413).json({ error: 'These pages are too large. Choose fewer pages.' });
  // a real PDF starts with "%PDF", which is "JVBERi" in base64
  if (!data.startsWith('JVBERi')) return response.status(400).json({ error: 'This isn’t a PDF.' });
  try {
    response
      .status(200)
      .json(await claudeJSON(textbookPrompt(), { model: MODEL, maxTokens: 16000, pdfs: [data] }));
  } catch (error) {
    fail(response, error);
  }
}
