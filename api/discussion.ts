import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkAccess, claudeJSON, fail, onlyPost, MODEL } from './_lib/claude.js';
import { asLanguage, discussionPrompt } from './_lib/prompts.js';

const LEVELS = new Set(['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
const text = (value: unknown, maxLength: number) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

/** A discussion question for the start of a lesson, for a chosen level, vocabulary topic and grammar point. */
export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!onlyPost(request, response) || !checkAccess(request, response)) return;
  const level = text(request.body?.level, 2).toUpperCase();
  if (!LEVELS.has(level)) return response.status(400).json({ error: 'Choose a level.' });
  try {
    const prompt = discussionPrompt({
      language: asLanguage(request.body?.language),
      level,
      topic: text(request.body?.topic, 120),
      grammar: text(request.body?.grammar, 120),
    });
    // a new question every time, so no caching
    response
      .status(200)
      .json(await claudeJSON(prompt, { model: MODEL, maxTokens: 3000, cache: false }));
  } catch (error) {
    fail(response, error);
  }
}
