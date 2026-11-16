import type { VercelRequest, VercelResponse } from '@vercel/node';

import { claudeJSON, MODEL, readImages } from './_lib/claude.js';
import { checkAccess, fail, onlyPost } from './_lib/http.js';
import { photoPrompt } from './_lib/prompts.js';

/** Reads the words a learner underlined on a photo of a book page. */
export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!onlyPost(request, response) || !checkAccess(request, response)) return;
  const images = readImages(request.body, 1);
  if (typeof images === 'string') return response.status(400).json({ error: images });
  try {
    response
      .status(200)
      .json(await claudeJSON(photoPrompt(), { model: MODEL, maxTokens: 8000, images }));
  } catch (error) {
    fail(response, error);
  }
}
