import type { VercelRequest, VercelResponse } from '@vercel/node';

import { claudeJSON, MODEL } from './_lib/claude.js';
import { checkAccess, fail, onlyPost } from './_lib/http.js';
import { asVerbLanguage, conjugationPrompt } from './_lib/prompts.js';

/** A French or German verb's conjugation tables. */
export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!onlyPost(request, response) || !checkAccess(request, response)) return;
  const infinitive = typeof request.body?.inf === 'string' ? request.body.inf.trim() : '';
  const ru = typeof request.body?.ru === 'string' ? request.body.ru.trim().slice(0, 100) : '';
  if (!infinitive || infinitive.length > 60)
    return response.status(400).json({ error: 'Bad verb.' });
  // an app from before German verb tables sends no language: its verbs are French
  const language =
    request.body?.language === undefined ? 'fr' : asVerbLanguage(request.body.language);
  if (!language) return response.status(400).json({ error: 'No verb tables for this language.' });
  try {
    const fresh = request.body?.fresh === true;
    response.status(200).json(
      await claudeJSON(conjugationPrompt(infinitive, ru, language), {
        model: MODEL,
        maxTokens: 3000,
        cache: !fresh,
      })
    );
  } catch (error) {
    fail(response, error);
  }
}
