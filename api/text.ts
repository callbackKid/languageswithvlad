import type { VercelRequest, VercelResponse } from '@vercel/node';

import { claudeJSON, MODEL } from './_lib/claude.js';
import { asLevel, checkAccess, fail, onlyPost, text } from './_lib/http.js';
import { explainPrompt, studyPrompt, translatePrompt } from './_lib/prompts.js';

/* Working with a text the learner pasted:
   - "explain": one marked word or phrase, in its sentence;
   - "translate": the whole text into Russian, paragraph by paragraph;
   - "study": vocabulary, questions and true-or-false statements built from the text. */

/** Longest text taken at once: a long article. Keep in step with MAX_TEXT_LENGTH in src/components/Reader.tsx. */
const MAX_TEXT_LENGTH = 8000;
const MAX_SELECTION_LENGTH = 200;
const MAX_CONTEXT_LENGTH = 600;

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!onlyPost(request, response) || !checkAccess(request, response)) return;
  const body = (request.body ?? {}) as Record<string, unknown>;
  try {
    if (body.action === 'explain') {
      const selection = text(body.selection, MAX_SELECTION_LENGTH);
      if (!selection) return response.status(400).json({ error: 'Mark a word or phrase first.' });
      const prompt = explainPrompt(selection, text(body.context, MAX_CONTEXT_LENGTH));
      return response.status(200).json(await claudeJSON(prompt, { model: MODEL, maxTokens: 1500 }));
    }

    const whole = typeof body.text === 'string' ? body.text.trim() : '';
    if (!whole) return response.status(400).json({ error: 'Paste a text first.' });
    if (whole.length > MAX_TEXT_LENGTH)
      return response.status(413).json({ error: 'This text is too long. Paste a shorter part.' });

    if (body.action === 'translate') {
      const paragraphs = whole.split(/\n+/).filter((paragraph) => paragraph.trim());
      return response
        .status(200)
        .json(await claudeJSON(translatePrompt(paragraphs), { model: MODEL, maxTokens: 12000 }));
    }
    if (body.action === 'study') {
      const levels = (body.levels ?? {}) as Record<string, unknown>;
      const prompt = studyPrompt(whole, {
        fr: asLevel(levels.fr) ?? 'A2',
        en: asLevel(levels.en) ?? 'A2',
        de: asLevel(levels.de) ?? 'A2',
      });
      return response.status(200).json(await claudeJSON(prompt, { model: MODEL, maxTokens: 6000 }));
    }
    return response.status(400).json({ error: 'Unknown action.' });
  } catch (error) {
    return fail(response, error);
  }
}
