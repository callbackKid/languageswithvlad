import type { VercelRequest, VercelResponse } from '@vercel/node';

import { claudeJSON, MODEL } from './_lib/claude.js';
import { asLevel, asLevels, checkAccess, checkTeacher, fail, onlyPost, text } from './_lib/http.js';
import {
  analysisPrompt,
  asExplainLanguage,
  asLanguage,
  grammarPracticePrompt,
  homeworkPrompt,
  lessonExtrasPrompt,
} from './_lib/prompts.js';

/** Longest lesson read in one go; a longer one is refused instead of being cut silently. */
const MAX_LESSON_LENGTH = 20_000;
const PRACTICE_SENTENCES = 8;

/* Everything Claude prepares from one lesson, in one function (Vercel's free plan allows 12):
   - "words" (the default): its words with translations, synonym and antonym pairs, and verbs;
   - "extras": its grammar points, homework and exercises from the book;
   - "practice": gap sentences on one of its grammar points;
   - "homework": homework for the next lesson, made from its words and grammar. */
export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!onlyPost(request, response) || !checkAccess(request, response)) return;
  const action: unknown = request.body?.action ?? 'words';
  try {
    if (action === 'practice') {
      const title = text(request.body?.title, 200);
      if (!title) return response.status(400).json({ error: 'Which grammar point?' });
      const prompt = grammarPracticePrompt({
        language: asLanguage(request.body?.language),
        level: asLevel(request.body?.level) ?? 'A2',
        title,
        summary: text(request.body?.summary, 600),
        count: PRACTICE_SENTENCES,
        explainIn: asExplainLanguage(request.body?.explainIn),
      });
      return response.status(200).json(await claudeJSON(prompt, { model: MODEL, maxTokens: 4000 }));
    }
    if (action === 'homework') {
      // making homework is the teacher's tool
      if (!checkTeacher(request, response)) return;
      const lesson = typeof request.body?.body === 'string' ? request.body.body : '';
      if (!lesson.trim()) return response.status(400).json({ error: 'Empty lesson.' });
      if (lesson.length > MAX_LESSON_LENGTH)
        return response
          .status(413)
          .json({ error: 'This lesson is too long to analyze in one go.' });
      const keyWords = (Array.isArray(request.body?.keyWords) ? request.body.keyWords : [])
        .map((word: unknown) => text(word, 80))
        .filter(Boolean)
        .slice(0, 20);
      const prompt = homeworkPrompt({
        body: lesson,
        keyWords,
        level: asLevel(request.body?.level) ?? 'A2',
      });
      // asked again for another version: never the same answer twice
      return response
        .status(200)
        .json(await claudeJSON(prompt, { model: MODEL, maxTokens: 3000, cache: false }));
    }
    if (action !== 'words' && action !== 'extras')
      return response.status(400).json({ error: 'Unknown action.' });

    const body = typeof request.body?.body === 'string' ? request.body.body : '';
    if (!body.trim()) return response.status(400).json({ error: 'Empty lesson.' });
    if (body.length > MAX_LESSON_LENGTH)
      return response.status(413).json({ error: 'This lesson is too long to analyze in one go.' });
    const fresh = request.body?.fresh === true;
    const levels = asLevels(request.body?.levels);
    const prompt =
      action === 'extras'
        ? lessonExtrasPrompt(body, asExplainLanguage(request.body?.explainIn), levels)
        : analysisPrompt(body, levels);
    return response
      .status(200)
      .json(await claudeJSON(prompt, { model: MODEL, maxTokens: 16000, cache: !fresh }));
  } catch (error) {
    return fail(response, error);
  }
}
