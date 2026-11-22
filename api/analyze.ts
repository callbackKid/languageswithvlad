import type { VercelRequest, VercelResponse } from '@vercel/node';

import { claudeJSON, FAST_MODEL, MODEL } from './_lib/claude.js';
import { asLevel, asLevels, checkAccess, checkTeacher, fail, onlyPost, text } from './_lib/http.js';
import {
  analysisPrompt,
  asExplainLanguage,
  asLanguage,
  asTranslationRequest,
  exercisePrompt,
  grammarPracticePrompt,
  homeworkPrompt,
  lessonExtrasPrompt,
  wordGroupsPrompt,
} from './_lib/prompts.js';

// Longest lesson read in one go; a longer one is refused instead of being cut silently.
const MAX_LESSON_LENGTH = 20_000;
const PRACTICE_SENTENCES = 8;
// a grammar point's title and its summary, as the Grammar tab shows them
const MAX_TITLE_LENGTH = 200;
const MAX_SUMMARY_LENGTH = 600;
// the key words (★) named in made homework: at most this many, each this long
const MAX_KEY_WORDS = 20;
const MAX_KEY_WORD_LENGTH = 80;
/** Sentences to translate in made homework: what the teacher picks, within the app's range
    (src/features/make-homework/model/makeHomework.ts). */
const MIN_TRANSLATE_SENTENCES = 2;
const MAX_TRANSLATE_SENTENCES = 8;
const DEFAULT_TRANSLATE_SENTENCES = 4;
// a made exercise: its questions and the grammar point as the teacher types it (both keep in step
// with src/features/make-exercise/ui/MakeExercise.tsx), and the lesson's words it practises
const MIN_EXERCISE_QUESTIONS = 3;
const MAX_EXERCISE_QUESTIONS = 15;
const DEFAULT_EXERCISE_QUESTIONS = 8;
const MAX_GRAMMAR_LENGTH = 200;
const MAX_EXERCISE_WORDS = 30;
// words sorted into groups in one request (keep in step with src/widgets/word-list/model/wordGroups.ts), each word
// and translation this long, and the group names the student's other words already have
const MAX_GROUP_WORDS = 60;
const MAX_WORD_LENGTH = 80;
const MAX_TRANSLATION_LENGTH = 120;
const MAX_KNOWN_GROUPS = 40;
const MAX_GROUP_NAME_LENGTH = 60;

/* Everything Claude prepares from one lesson, in one function (Vercel's free plan allows 12):
   - "words" (the default): its words with translations, synonym and antonym pairs, and verbs;
   - "extras": its grammar points, homework and exercises from the book;
   - "practice": gap sentences on one of its grammar points;
   - "homework": homework for the next lesson, made from its words and grammar;
   - "exercise": a mixed exercise made in lesson mode, on a grammar point and/or words;
   - "groups": a lesson's or the student's words sorted into groups by meaning. */
export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!onlyPost(request, response) || !checkAccess(request, response)) return;
  const action: unknown = request.body?.action ?? 'words';
  try {
    if (action === 'practice') {
      const title = text(request.body?.title, MAX_TITLE_LENGTH);
      if (!title) return response.status(400).json({ error: 'nothing_sent' });
      const prompt = grammarPracticePrompt({
        language: asLanguage(request.body?.language),
        level: asLevel(request.body?.level) ?? 'A2',
        title,
        summary: text(request.body?.summary, MAX_SUMMARY_LENGTH),
        count: PRACTICE_SENTENCES,
        explainIn: asExplainLanguage(request.body?.explainIn),
        translateTo: asExplainLanguage(request.body?.translateTo),
      });
      return response.status(200).json(await claudeJSON(prompt, { model: MODEL, maxTokens: 4000 }));
    }
    if (action === 'homework') {
      // making homework is the teacher's tool
      if (!checkTeacher(request, response)) return;
      const lesson = typeof request.body?.body === 'string' ? request.body.body : '';
      if (!lesson.trim()) return response.status(400).json({ error: 'nothing_sent' });
      if (lesson.length > MAX_LESSON_LENGTH)
        return response.status(413).json({ error: 'lesson_too_long' });
      const keyWords = (Array.isArray(request.body?.keyWords) ? request.body.keyWords : [])
        .map((word: unknown) => text(word, MAX_KEY_WORD_LENGTH))
        .filter(Boolean)
        .slice(0, MAX_KEY_WORDS);
      const prompt = homeworkPrompt({
        body: lesson,
        keyWords,
        level: asLevel(request.body?.level) ?? 'A2',
        sentences: sentenceCount(request.body?.sentences),
        translation: asTranslationRequest(request.body),
      });
      // asked again for another version: never the same answer twice
      return response
        .status(200)
        .json(await claudeJSON(prompt, { model: MODEL, maxTokens: 3000, cache: false }));
    }
    if (action === 'exercise') {
      const grammar = text(request.body?.grammar, MAX_GRAMMAR_LENGTH);
      const words = (Array.isArray(request.body?.words) ? request.body.words : [])
        .map((word: unknown) => text(word, MAX_KEY_WORD_LENGTH))
        .filter(Boolean)
        .slice(0, MAX_EXERCISE_WORDS);
      if (!grammar && !words.length) return response.status(400).json({ error: 'nothing_sent' });
      const prompt = exercisePrompt({
        language: asLanguage(request.body?.language),
        level: asLevel(request.body?.level) ?? 'A2',
        grammar,
        words,
        count: questionCount(request.body?.count),
        translateTo: asExplainLanguage(request.body?.translateTo),
        explainIn: asExplainLanguage(request.body?.explainIn),
      });
      // asked again for another exercise: never the same questions twice
      return response
        .status(200)
        .json(await claudeJSON(prompt, { model: MODEL, maxTokens: 6000, cache: false }));
    }
    if (action === 'groups') {
      const words = (Array.isArray(request.body?.words) ? request.body.words : [])
        .slice(0, MAX_GROUP_WORDS)
        .map((word: unknown) => (word && typeof word === 'object' ? word : {}))
        .map((word: Record<string, unknown>) => ({
          fr: text(word.fr, MAX_WORD_LENGTH),
          ru: text(word.ru, MAX_TRANSLATION_LENGTH),
        }))
        .filter((word: { fr: string }) => word.fr);
      if (!words.length) return response.status(400).json({ error: 'nothing_sent' });
      const known = (Array.isArray(request.body?.known) ? request.body.known : [])
        .map((name: unknown) => text(name, MAX_GROUP_NAME_LENGTH))
        .filter(Boolean)
        .slice(0, MAX_KNOWN_GROUPS);
      const prompt = wordGroupsPrompt(words, known, asExplainLanguage(request.body?.explainIn));
      return response
        .status(200)
        .json(await claudeJSON(prompt, { model: FAST_MODEL, maxTokens: 4000 }));
    }
    if (action !== 'words' && action !== 'extras')
      return response.status(400).json({ error: 'bad_request' });

    const body = typeof request.body?.body === 'string' ? request.body.body : '';
    if (!body.trim()) return response.status(400).json({ error: 'nothing_sent' });
    if (body.length > MAX_LESSON_LENGTH)
      return response.status(413).json({ error: 'lesson_too_long' });
    const fresh = request.body?.fresh === true;
    const levels = asLevels(request.body?.levels);
    const prompt =
      action === 'extras'
        ? lessonExtrasPrompt(body, asExplainLanguage(request.body?.explainIn), levels)
        : analysisPrompt(body, levels, asTranslationRequest(request.body));
    return response
      .status(200)
      .json(await claudeJSON(prompt, { model: MODEL, maxTokens: 16000, cache: !fresh }));
  } catch (error) {
    return fail(response, error);
  }
}

// The number of questions asked for, kept within the range.
function questionCount(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) return DEFAULT_EXERCISE_QUESTIONS;
  return Math.min(MAX_EXERCISE_QUESTIONS, Math.max(MIN_EXERCISE_QUESTIONS, value));
}

// The number of sentences to translate the teacher asked for, kept within the range.
function sentenceCount(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) return DEFAULT_TRANSLATE_SENTENCES;
  return Math.min(MAX_TRANSLATE_SENTENCES, Math.max(MIN_TRANSLATE_SENTENCES, value));
}
