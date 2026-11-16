import type { VercelRequest, VercelResponse } from '@vercel/node';

import { claudeJSON, MODEL, readImages } from './_lib/claude.js';
import { checkAccess, fail, onlyPost } from './_lib/http.js';
import { transcribePrompt } from './_lib/prompts.js';

// keep in step with MAX_PAGES in src/components/HandwrittenNotes.tsx
const MAX_PAGES = 4;

/** Turns photos of handwritten lesson notes into text, which the app then prepares like any lesson. */
export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!onlyPost(request, response) || !checkAccess(request, response)) return;
  const images = readImages(request.body, MAX_PAGES);
  if (typeof images === 'string') return response.status(400).json({ error: images });
  try {
    response.status(200).json(
      await claudeJSON(transcribePrompt(images.length), {
        model: MODEL,
        maxTokens: 16000,
        images,
      })
    );
  } catch (error) {
    fail(response, error);
  }
}
