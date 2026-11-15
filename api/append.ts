import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkAccess, onlyPost } from './_lib/claude.js';
import { appendToDoc, GoogleError } from './_lib/google.js';
import { appendToNotion, NOTION_ID, NotionError } from './_lib/notion.js';

/** Appends a new lesson (heading and lines, built by the app) to the end of the Google Doc or Notion page. */
export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!onlyPost(request, response) || !checkAccess(request, response)) return;
  const documentId = typeof request.body?.docId === 'string' ? request.body.docId : '';
  const text = typeof request.body?.text === 'string' ? request.body.text : '';
  const notionId = documentId.match(NOTION_ID)?.[1];
  if (!notionId && !/^[a-zA-Z0-9_-]{20,100}$/.test(documentId))
    return response.status(400).json({ error: 'bad_id' });
  if (!text.trim()) return response.status(400).json({ error: 'Nothing to add.' });
  if (text.length > 20000)
    return response.status(413).json({ error: 'This is too long to add in one go.' });
  try {
    if (notionId) await appendToNotion(notionId, text);
    else await appendToDoc(documentId, text);
    response.status(200).json({ ok: true });
  } catch (error) {
    if (error instanceof NotionError)
      return response.status(error.status).json({ error: error.message });
    if (error instanceof GoogleError)
      return response.status(error.status).json({ error: error.message });
    console.error(error);
    response.status(500).json({ error: 'Something went wrong on the server.' });
  }
}
