import type { VercelRequest, VercelResponse } from '@vercel/node';

import { claudeJSON, FAST_MODEL } from './_lib/claude.js';
import { asLevel, checkAccess, fail, onlyPost, text } from './_lib/http.js';
import { asLanguage, definitionPrompt, gapPrompt } from './_lib/prompts.js';

// at most this many words get sentences in one request, each word and translation this long
const MAX_WORDS = 30;
const MAX_WORD_LENGTH = 80;
const MAX_TRANSLATION_LENGTH = 120;
// the sentences in a round: one a word, between these
const MIN_SENTENCES = 4;
const MAX_SENTENCES = 8;

/** Sentences with a gap for some of the lesson's words, at the student's level; with
    action "definitions", a definition of each word in its own language instead (the blitz). */
export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!onlyPost(request, response) || !checkAccess(request, response)) return;
  const raw: unknown[] = Array.isArray(request.body?.words) ? request.body.words : [];
  const words = raw
    .slice(0, MAX_WORDS)
    .map((word) => (word && typeof word === 'object' ? (word as Record<string, unknown>) : {}))
    .map((word) => ({
      fr: text(word.fr, MAX_WORD_LENGTH),
      ru: text(word.ru, MAX_TRANSLATION_LENGTH),
    }))
    .filter((word) => word.fr);
  if (!words.length) return response.status(400).json({ error: 'nothing_sent' });
  const count = Math.min(MAX_SENTENCES, Math.max(MIN_SENTENCES, words.length));
  const language = asLanguage(request.body?.language);
  const level = asLevel(request.body?.level) ?? 'A1';
  const prompt =
    request.body?.action === 'definitions'
      ? definitionPrompt(words.slice(0, MAX_SENTENCES), language, level)
      : gapPrompt(words, count, language, level);
  try {
    // Fresh sentences every time, so no caching.
    response.status(200).json(
      await claudeJSON(prompt, {
        model: FAST_MODEL,
        maxTokens: 3000,
        cache: false,
      })
    );
  } catch (error) {
    fail(response, error);
  }
}
