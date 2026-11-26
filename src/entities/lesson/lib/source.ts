/* Where the lessons come from: a Google Doc (its id) or a Notion page ("notion-" and its id).
   The id is what the app stores, puts in the student link (?doc=…) and sends to /api/doc. */

const NOTION_PREFIX = 'notion-';

// Whether a document id is a Notion page's ("notion-…") rather than a Google Doc's.
export const isNotion = (id: string) => id.startsWith(NOTION_PREFIX);

// notion.so/…/Lessons-0123…cdef?pvs=4, xyz.notion.site/…, also with a dashed id → "notion-0123…cdef".
export const notionIdFrom = (input: string): string | null => {
  const text = input.trim();
  if (!/notion\.(?:so|site)\//i.test(text)) return null;
  // the page id ends the last part of the path: "Lessons-0123…cdef", or a dashed id
  // (a ?p= peek link opens a row of a database; the path still names the database)
  const path = text.split(/[?#]/)[0] ?? '';
  const dashed = path.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)?.[0];
  const last = path.replace(/\/+$/, '').split('/').pop() ?? '';
  const id = dashed?.replace(/-/g, '') ?? last.match(/(?:^|-)([0-9a-f]{32})$/i)?.[1];
  return id ? NOTION_PREFIX + id.toLowerCase() : null;
};

// The page to open for editing.
export const sourceUrl = (id: string): string => {
  return isNotion(id)
    ? `https://www.notion.so/${id.slice(NOTION_PREFIX.length)}`
    : `https://docs.google.com/document/d/${encodeURIComponent(id)}/edit`;
};
