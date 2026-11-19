import type { VercelRequest, VercelResponse } from '@vercel/node';

import { claudeJSON, MODEL } from './_lib/claude.js';
import { asLevel, asLevels, checkAccess, fail, onlyPost, text } from './_lib/http.js';
import {
  asExplainLanguage,
  explainPrompt,
  studyPrompt,
  translatePrompt,
  wordPrompt,
  writingCheckPrompt,
} from './_lib/prompts.js';

/* Working with text the learner reads or writes:
   - "explain": one marked word or phrase, in its sentence;
   - "word": a word or phrase selected anywhere in the app, with a definition and examples too;
   - "translate": the whole text into Russian, paragraph by paragraph;
   - "study": vocabulary, questions and true-or-false statements built from the text;
   - "correct": a written homework answer, its mistakes fixed and explained. */

// Longest text taken at once: a long article. Keep in step with MAX_TEXT_LENGTH in src/components/Reader.tsx.
const MAX_TEXT_LENGTH = 8000;
const MAX_SELECTION_LENGTH = 200;
const MAX_CONTEXT_LENGTH = 600;
const MAX_TASK_LENGTH = 600;

// One of the five actions above, chosen by body.action.
export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!onlyPost(request, response) || !checkAccess(request, response)) return;
  const body = (request.body ?? {}) as Record<string, unknown>;
  try {
    if (body.action === 'explain' || body.action === 'word') {
      const selection = text(body.selection, MAX_SELECTION_LENGTH);
      if (!selection) return response.status(400).json({ error: 'nothing_sent' });
      const makePrompt = body.action === 'word' ? wordPrompt : explainPrompt;
      const prompt = makePrompt(
        selection,
        text(body.context, MAX_CONTEXT_LENGTH),
        asLevels(body.levels)
      );
      // a word's card holds a definition and examples as well, so it needs more room
      const maxTokens = body.action === 'word' ? 2500 : 1500;
      return response.status(200).json(await claudeJSON(prompt, { model: MODEL, maxTokens }));
    }

    const whole = typeof body.text === 'string' ? body.text.trim() : '';
    if (!whole) return response.status(400).json({ error: 'nothing_sent' });
    if (whole.length > MAX_TEXT_LENGTH) return response.status(413).json({ error: 'too_long' });

    if (body.action === 'translate') {
      const paragraphs = whole.split(/\n+/).filter((paragraph) => paragraph.trim());
      return response
        .status(200)
        .json(await claudeJSON(translatePrompt(paragraphs), { model: MODEL, maxTokens: 12000 }));
    }
    if (body.action === 'correct') {
      const task = text(body.task, MAX_TASK_LENGTH);
      if (!task) return response.status(400).json({ error: 'nothing_sent' });
      const prompt = writingCheckPrompt({
        task,
        text: whole,
        level: asLevel(body.level) ?? 'A2',
        explainIn: asExplainLanguage(body.explainIn),
      });
      // the student may send the same text again after reading the answer: a new check each time
      return response
        .status(200)
        .json(await claudeJSON(prompt, { model: MODEL, maxTokens: 6000, cache: false }));
    }
    if (body.action === 'study') {
      const prompt = studyPrompt(whole, asLevels(body.levels));
      return response.status(200).json(await claudeJSON(prompt, { model: MODEL, maxTokens: 6000 }));
    }
    return response.status(400).json({ error: 'bad_request' });
  } catch (error) {
    return fail(response, error);
  }
}
