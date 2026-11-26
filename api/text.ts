import type { VercelRequest, VercelResponse } from '@vercel/node';

import { claudeJSON, MODEL } from './_lib/claude.js';
import { asLevel, asLevels, checkAccess, fail, onlyPost, text } from './_lib/http.js';
import {
  asExplainLanguage,
  asTranslationRequest,
  studyPrompt,
  translatePrompt,
  wordPrompt,
  writingCheckPrompt,
} from './_lib/prompts.js';

/* Working with text the learner reads or writes:
   - "word": a word or phrase selected anywhere in the app, explained in its sentence, with a
     definition and examples;
   - "translate": the whole text into the translation language, paragraph by paragraph;
   - "study": vocabulary, questions and true-or-false statements built from the text;
   - "correct": a written homework answer, its mistakes fixed and explained. */

// Longest text taken at once: a long article. Keep in step with MAX_TEXT_LENGTH in src/pages/text/ui/Reader.tsx.
const MAX_TEXT_LENGTH = 8000;
// the longest answer for each action, in tokens: room for its biggest answer, and a cost cap
const WORD_TOKENS = 2500;
const TRANSLATION_TOKENS = 12000;
const CORRECTION_TOKENS = 6000;
const STUDY_TOKENS = 6000;
const MAX_SELECTION_LENGTH = 200;
const MAX_CONTEXT_LENGTH = 600;
const MAX_TASK_LENGTH = 600;

// One of the four actions above, chosen by body.action.
const handler = async (request: VercelRequest, response: VercelResponse) => {
  if (!onlyPost(request, response) || !checkAccess(request, response)) return;
  const body = (request.body ?? {}) as Record<string, unknown>;
  try {
    if (body.action === 'word') {
      const selection = text(body.selection, MAX_SELECTION_LENGTH);
      if (!selection) return response.status(400).json({ error: 'nothing_sent' });
      const prompt = wordPrompt(
        selection,
        text(body.context, MAX_CONTEXT_LENGTH),
        asLevels(body.levels),
        asTranslationRequest(body)
      );
      return response
        .status(200)
        .json(await claudeJSON(prompt, { model: MODEL, maxTokens: WORD_TOKENS }));
    }

    const whole = typeof body.text === 'string' ? body.text.trim() : '';
    if (!whole) return response.status(400).json({ error: 'nothing_sent' });
    if (whole.length > MAX_TEXT_LENGTH) return response.status(413).json({ error: 'too_long' });

    if (body.action === 'translate') {
      const paragraphs = whole.split(/\n+/).filter((paragraph) => paragraph.trim());
      return response.status(200).json(
        await claudeJSON(translatePrompt(paragraphs, asTranslationRequest(body)), {
          model: MODEL,
          maxTokens: TRANSLATION_TOKENS,
        })
      );
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
        .json(
          await claudeJSON(prompt, { model: MODEL, maxTokens: CORRECTION_TOKENS, cache: false })
        );
    }
    if (body.action === 'study') {
      const prompt = studyPrompt(whole, asLevels(body.levels), asTranslationRequest(body));
      return response
        .status(200)
        .json(await claudeJSON(prompt, { model: MODEL, maxTokens: STUDY_TOKENS }));
    }
    return response.status(400).json({ error: 'bad_request' });
  } catch (error) {
    return fail(response, error);
  }
};

export default handler;
