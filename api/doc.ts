import type { VercelRequest, VercelResponse } from '@vercel/node';

import { GOOGLE_DOC_ID } from './_lib/google.js';
import { checkAccess, fail } from './_lib/http.js';
import { NOTION_ID, readNotion } from './_lib/notion.js';

// Reads a Google Doc shared as "Anyone with the link can view", or a Notion page, as plain text.
const handler = async (request: VercelRequest, response: VercelResponse) => {
  // the class code guards the lessons too: with Notion connected, this reads private pages
  if (!checkAccess(request, response)) return;
  const id = String(request.query.id || '');
  response.setHeader('Cache-Control', 'no-store');
  const notionId = id.match(NOTION_ID)?.[1];
  if (notionId) {
    try {
      return response.status(200).json(await readNotion(notionId));
    } catch (error) {
      return fail(response, error);
    }
  }
  // Only real Docs ids reach the outgoing URL.
  if (!GOOGLE_DOC_ID.test(id)) return response.status(400).json({ error: 'bad_id' });

  try {
    const googleResponse = await fetch(
      `https://docs.google.com/document/d/${encodeURIComponent(id)}/export?format=txt`,
      { redirect: 'follow' }
    );
    const type = googleResponse.headers.get('content-type') || '';
    if (googleResponse.status === 404) return response.status(404).json({ error: 'not_found' });
    // A private doc redirects to Google's sign-in page instead of returning text.
    if (
      !googleResponse.ok ||
      type.includes('text/html') ||
      googleResponse.url.includes('accounts.google.com')
    ) {
      return response.status(403).json({ error: 'not_shared' });
    }
    const text = (await googleResponse.text()).replace(/^\uFEFF/, '');
    const disposition = googleResponse.headers.get('content-disposition') || '';
    const match =
      disposition.match(/filename\*=UTF-8''([^;]+)/i) || disposition.match(/filename="([^"]+)"/i);
    let title = '';
    if (match) {
      try {
        title = decodeURIComponent(match[1]);
      } catch {
        title = match[1];
      }
      title = title.replace(/\.txt$/i, '');
    }
    return response.status(200).json({ title, text });
  } catch (error) {
    console.error(error);
    return response.status(502).json({ error: 'unreachable' });
  }
};

export default handler;
