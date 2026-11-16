import { HttpError } from './http.js';
import { findLesson, type LessonTarget } from './lessons.js';

/* Reads a Notion page as plain text in the same shape as the Google Doc export, so the app finds
   lessons in it the same way ("12.11.2026 1 Leçon" and the lines under it), and appends new
   lessons back. NOTION_TOKEN is the secret of an internal integration (notion.so/my-integrations);
   every page the app reads has to be connected to it (••• → Connections). */

const API_URL = 'https://api.notion.com/v1';
// a stable API version: newer ones moved databases to "data sources"
const NOTION_VERSION = '2022-06-28';
// deep enough for toggles in columns in a sub-page, shallow enough to stay fast
const MAX_DEPTH = 4;
const MAX_BLOCKS = 4000;

export const NOTION_ID = /^notion-([0-9a-f]{32})$/;

/** Ends up as the error code the app translates (notion_not_shared and so on). */
export class NotionError extends HttpError {}

export function notionConfigured(): boolean {
  return !!process.env.NOTION_TOKEN;
}

const pause = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function notion<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new NotionError(501, 'notion_off');
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(API_URL + path, {
      method: init.method ?? 'GET',
      headers: {
        authorization: `Bearer ${token}`,
        'notion-version': NOTION_VERSION,
        'content-type': 'application/json',
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
    // Notion allows about 3 requests a second; wait as long as it asks, twice at most
    if (response.status === 429 && attempt < 2) {
      await pause(Number(response.headers.get('retry-after') || 1) * 1000);
      continue;
    }
    const data = (await response.json().catch(() => null)) as { code?: string } | null;
    if (response.ok) return data as T;
    const code = data?.code ?? '';
    if (response.status === 401) throw new NotionError(401, 'notion_token');
    if (response.status === 404 || code === 'object_not_found')
      throw new NotionError(404, 'notion_not_shared');
    if (response.status === 403 || code === 'restricted_resource')
      throw new NotionError(403, 'notion_no_write');
    // "is a database, not a page" and similar: the caller may try the other kind
    if (code === 'validation_error') throw new NotionError(400, 'notion_validation');
    console.error('Notion', path, response.status, code);
    throw new NotionError(502, 'notion_unreachable');
  }
}

interface RichText {
  plain_text: string;
  href?: string | null;
}
interface Block {
  id: string;
  type: string;
  has_children?: boolean;
  [type: string]: unknown;
}
interface List<T> {
  results: T[];
  has_more: boolean;
  next_cursor: string | null;
}
interface Page {
  id: string;
  properties: Record<
    string,
    { type: string; title?: RichText[]; date?: { start?: string } | null }
  >;
}
interface Database {
  id: string;
  title: RichText[];
  properties: Record<string, { type: string }>;
}

/** The text of a rich-text run; a call link hidden behind other words is kept, so "Join call" finds it. */
function plain(texts: RichText[] | undefined): string {
  return (texts ?? [])
    .map((text) => {
      const href = text.href ?? '';
      const isCall = /meet\.google\.com|zoom\.us/.test(href);
      return isCall && !text.plain_text.includes(href)
        ? `${text.plain_text} ${href}`
        : text.plain_text;
    })
    .join('');
}

async function children(blockId: string): Promise<Block[]> {
  const blocks: Block[] = [];
  let cursor: string | null = null;
  do {
    const query = `page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`;
    const page: List<Block> = await notion(`/blocks/${blockId}/children?${query}`);
    blocks.push(...page.results);
    cursor = page.has_more ? page.next_cursor : null;
  } while (cursor && blocks.length < MAX_BLOCKS);
  return blocks;
}

const pad = (value: number) => String(value).padStart(2, '0');
const HEADING = /^\s*\d{1,2}\.\d{1,2}\.\d{4}\s+\d+/;

/** A database row's title; when it isn't a lesson heading but the row has a date, one is made from it. */
function rowTitle(row: Page, position: number): string {
  const properties = Object.values(row.properties);
  const title = plain(properties.find((property) => property.type === 'title')?.title);
  if (HEADING.test(title)) return title;
  const start = properties.find((property) => property.type === 'date' && property.date?.start)
    ?.date?.start;
  if (!start) return title;
  const [year, month, day] = start.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return title;
  return `${pad(day)}.${pad(month)}.${year} ${position + 1} Leçon${title ? `\n${title}` : ''}`;
}

class Reader {
  private count = 0;

  /** The lines of a list of blocks, with their children indented one level deeper. */
  async lines(blocks: Block[], depth: number): Promise<string[]> {
    const out: string[] = [];
    for (const block of blocks) {
      if (++this.count > MAX_BLOCKS) break;
      const content = (block[block.type] ?? {}) as {
        rich_text?: RichText[];
        title?: string;
        url?: string;
        caption?: RichText[];
      };
      switch (block.type) {
        case 'child_page':
          out.push('', content.title ?? '');
          break;
        case 'child_database':
          out.push(...(await this.database(block.id, depth + 1)));
          continue;
        case 'table_row': {
          // tables often hold "word | translation | transcription": one line per row
          const cells = (block.table_row as { cells: RichText[][] }).cells.map(plain);
          out.push(cells.filter(Boolean).join(' — '));
          break;
        }
        case 'bookmark':
        case 'embed':
        case 'link_preview':
        case 'video':
          if (content.url) out.push(content.url);
          break;
        case 'divider':
          out.push('');
          break;
        default:
          if (content.rich_text) out.push(plain(content.rich_text));
      }
      if (block.has_children && depth < MAX_DEPTH)
        out.push(...(await this.lines(await children(block.id), depth + 1)));
    }
    return out;
  }

  /** Every row of a database as its own part: the title line (a lesson heading), then its page. */
  async database(databaseId: string, depth: number): Promise<string[]> {
    const rows: Page[] = [];
    let cursor: string | null = null;
    do {
      const page: List<Page> = await notion(`/databases/${databaseId}/query`, {
        method: 'POST',
        body: {
          page_size: 100,
          // oldest first, like lessons written one under another in a document
          sorts: [{ timestamp: 'created_time', direction: 'ascending' }],
          ...(cursor ? { start_cursor: cursor } : {}),
        },
      });
      rows.push(...page.results);
      cursor = page.has_more ? page.next_cursor : null;
    } while (cursor && rows.length < 500);
    const out: string[] = [];
    for (const [position, row] of rows.entries()) {
      out.push('', rowTitle(row, position));
      if (depth < MAX_DEPTH) out.push(...(await this.lines(await children(row.id), depth + 1)));
    }
    return out;
  }
}

const NOT_A_PAGE = new Set(['notion_validation', 'notion_not_shared']);

const tidy = (lines: string[]) =>
  lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

/** The page (or database of lessons) as { title, text }. */
export async function readNotion(id: string): Promise<{ title: string; text: string }> {
  const reader = new Reader();
  try {
    const page: Page = await notion(`/pages/${id}`);
    const title = plain(
      Object.values(page.properties).find((property) => property.type === 'title')?.title
    );
    return { title, text: tidy(await reader.lines(await children(id), 0)) };
  } catch (error) {
    // A link to a full-page database, whose rows are the lessons. Notion answers "validation
    // error" for a database id on the pages endpoint; "not found" is tried too, in case a
    // database the integration can see is reported that way.
    if (!(error instanceof NotionError) || !NOT_A_PAGE.has(error.message)) throw error;
    try {
      const database: Database = await notion(`/databases/${id}`);
      return { title: plain(database.title), text: tidy(await reader.database(id, 0)) };
    } catch (databaseError) {
      // neither a page nor a database the app can read: report the first, clearer problem
      throw error.message === 'notion_not_shared' ? error : databaseError;
    }
  }
}

const paragraph = (text: string, type = 'paragraph') => ({
  object: 'block',
  type,
  // Notion takes at most 2000 characters per text run
  [type]: { rich_text: [{ type: 'text', text: { content: text.slice(0, 2000) } }] },
});

/** Adds a lesson: under the page's last block, or as a new row when the link is a database of lessons. */
/** The one line a top-level block shows: a sub-page's title, or its text. */
function blockLine(block: Block): string {
  if (block.type === 'child_page') return (block.child_page as { title?: string }).title ?? '';
  const content = (block[block.type] ?? {}) as { rich_text?: RichText[] };
  return plain(content.rich_text);
}

/** Adds the lines at the end of one lesson: inside its sub-page or database row, or after its
    last block on the page. False when the lesson isn't found at the page's top level. */
export async function insertIntoNotionLesson(
  id: string,
  target: LessonTarget,
  text: string
): Promise<boolean> {
  const blocks = text
    .trim()
    .split('\n')
    .map((line) => paragraph(line.trimEnd()));
  const add = async (parentId: string, after?: string) => {
    // Notion adds at most 100 blocks per request; later chunks follow the ones just added
    let previous = after;
    for (let start = 0; start < blocks.length; start += 100) {
      const added: List<Block> = await notion(`/blocks/${parentId}/children`, {
        method: 'PATCH',
        body: {
          children: blocks.slice(start, start + 100),
          ...(previous ? { after: previous } : {}),
        },
      });
      if (previous) previous = added.results[added.results.length - 1]?.id ?? previous;
    }
  };

  let topLevel: Block[];
  try {
    topLevel = await children(id);
  } catch (error) {
    if (!(error instanceof NotionError) || error.message !== 'notion_validation') throw error;
    // a database: every row is a lesson
    const rows: List<Page> = await notion(`/databases/${id}/query`, {
      method: 'POST',
      body: { page_size: 100, sorts: [{ timestamp: 'created_time', direction: 'ascending' }] },
    });
    const titles = rows.results.map(
      (row, position) => rowTitle(row, position).split('\n')[0] ?? ''
    );
    const lesson = findLesson(titles, target);
    const row = lesson && rows.results[lesson.start];
    if (!row) return false;
    await add(row.id);
    return true;
  }
  const lesson = findLesson(topLevel.map(blockLine), target);
  const heading = lesson && topLevel[lesson.start];
  if (!lesson || !heading) return false;
  if (heading.type === 'child_page') await add(heading.id);
  else {
    const last = lesson.next === null ? undefined : topLevel[lesson.next - 1]?.id;
    await add(id, last);
  }
  return true;
}

export async function appendToNotion(id: string, text: string): Promise<void> {
  const lines = text.split('\n').map((line) => line.trimEnd());
  const headingIndex = lines.findIndex((line) => line.trim());
  const heading = lines[headingIndex]?.trim() ?? '';
  const body = lines.slice(headingIndex + 1).filter((line, index, all) => line || all[index - 1]);
  try {
    // Notion adds at most 100 blocks per request
    const blocks = [paragraph(heading, 'heading_2'), ...body.map((line) => paragraph(line))];
    for (let start = 0; start < blocks.length; start += 100)
      await notion(`/blocks/${id}/children`, {
        method: 'PATCH',
        body: { children: blocks.slice(start, start + 100) },
      });
  } catch (error) {
    if (!(error instanceof NotionError) || error.message !== 'notion_validation') throw error;
    const database: Database = await notion(`/databases/${id}`);
    const titleName = Object.entries(database.properties).find(
      ([, property]) => property.type === 'title'
    )?.[0];
    if (!titleName) throw error;
    await notion('/pages', {
      method: 'POST',
      body: {
        parent: { database_id: id },
        properties: { [titleName]: { title: [{ text: { content: heading } }] } },
        children: body.slice(0, 100).map((line) => paragraph(line)),
      },
    });
  }
}
