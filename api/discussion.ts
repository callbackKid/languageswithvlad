import type { VercelRequest, VercelResponse } from '@vercel/node';

import { claudeJSON, MODEL } from './_lib/claude.js';
import { asLevel, checkAccess, fail, onlyPost, text } from './_lib/http.js';
import { asExplainLanguage, asLanguage, discussionPrompt } from './_lib/prompts.js';

// A topic or grammar point is a few words ("the TV series Dexter"). Keep in step with
// MAX_TOPIC_LENGTH in src/components/Discuss.tsx.
const MAX_TOPIC_LENGTH = 120;

// A discussion question for the start of a lesson, for a chosen level, vocabulary topic and grammar point.
export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!onlyPost(request, response) || !checkAccess(request, response)) return;
  const level = asLevel(request.body?.level);
  if (!level) return response.status(400).json({ error: 'Choose a level.' });
  try {
    const prompt = discussionPrompt({
      language: asLanguage(request.body?.language),
      level,
      topic: text(request.body?.topic, MAX_TOPIC_LENGTH),
      grammar: text(request.body?.grammar, MAX_TOPIC_LENGTH),
      explainIn: asExplainLanguage(request.body?.explainIn),
    });
    // a new question every time, so no caching
    response
      .status(200)
      .json(await claudeJSON(prompt, { model: MODEL, maxTokens: 5000, cache: false }));
  } catch (error) {
    fail(response, error);
  }
}
