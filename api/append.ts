import type { VercelRequest, VercelResponse } from '@vercel/node';

import { appendToDoc, GOOGLE_DOC_ID, insertIntoLesson } from './_lib/google.js';
import { checkAccess, fail, onlyPost } from './_lib/http.js';
import { lessonTarget } from './_lib/lessons.js';
import { appendToNotion, insertIntoNotionLesson, NOTION_ID } from './_lib/notion.js';

/** Longest text added in one request: a lesson is a few thousand characters. */
const MAX_TEXT_LENGTH = 20_000;

/** Appends a new lesson (heading and lines, built by the app) to the end of the Google Doc or
    Notion page; or, with a lesson key, adds the lines at the end of that lesson. */
export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!onlyPost(request, response) || !checkAccess(request, response)) return;
  const documentId = typeof request.body?.docId === 'string' ? request.body.docId : '';
  const text = typeof request.body?.text === 'string' ? request.body.text : '';
  const notionId = documentId.match(NOTION_ID)?.[1];
  if (!notionId && !GOOGLE_DOC_ID.test(documentId))
    return response.status(400).json({ error: 'bad_id' });
  if (!text.trim()) return response.status(400).json({ error: 'Nothing to add.' });
  if (text.length > MAX_TEXT_LENGTH)
    return response.status(413).json({ error: 'This is too long to add in one go.' });
  const lesson = request.body?.lesson === undefined ? null : lessonTarget(request.body.lesson);
  if (request.body?.lesson !== undefined && !lesson)
    return response.status(400).json({ error: 'bad_lesson' });
  try {
    if (lesson) {
      const found = notionId
        ? await insertIntoNotionLesson(notionId, lesson, text)
        : await insertIntoLesson(documentId, lesson, text);
      if (!found) return response.status(404).json({ error: 'lesson_not_found' });
    } else if (notionId) await appendToNotion(notionId, text);
    else await appendToDoc(documentId, text);
    response.status(200).json({ ok: true });
  } catch (error) {
    fail(response, error);
  }
}
