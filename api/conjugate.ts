import type { VercelRequest, VercelResponse } from '@vercel/node';

import { claudeJSON, MODEL } from './_lib/claude.js';
import { checkAccess, fail, onlyPost, text } from './_lib/http.js';
import { asExplainLanguage, asVerbLanguage, conjugationPrompt } from './_lib/prompts.js';

// an infinitive is a word or two ("se lever", "sich waschen"); its translation a few words
const MAX_INFINITIVE_LENGTH = 60;
// the longest answer, in tokens: room for every tense of a verb, and a cost cap
const CONJUGATION_TOKENS = 3000;
const MAX_TRANSLATION_LENGTH = 100;

// A verb's conjugation tables, in any language that has them (French, German, Spanish, Italian, Portuguese).
export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!onlyPost(request, response) || !checkAccess(request, response)) return;
  const infinitive = typeof request.body?.inf === 'string' ? request.body.inf.trim() : '';
  const ru = text(request.body?.ru, MAX_TRANSLATION_LENGTH);
  if (!infinitive || infinitive.length > MAX_INFINITIVE_LENGTH)
    return response.status(400).json({ error: 'bad_request' });
  // an app from before German verb tables sends no language: its verbs are French
  const language =
    request.body?.language === undefined ? 'fr' : asVerbLanguage(request.body.language);
  if (!language) return response.status(400).json({ error: 'bad_request' });
  try {
    const fresh = request.body?.fresh === true;
    response.status(200).json(
      await claudeJSON(
        conjugationPrompt(infinitive, ru, language, asExplainLanguage(request.body?.translateTo)),
        {
          model: MODEL,
          maxTokens: CONJUGATION_TOKENS,
          cache: !fresh,
        }
      )
    );
  } catch (error) {
    fail(response, error);
  }
}
