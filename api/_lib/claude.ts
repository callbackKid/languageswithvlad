import { HttpError } from './http.js';

const API_URL = 'https://api.anthropic.com/v1/messages';
export const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-5-5';
export const FAST_MODEL = process.env.CLAUDE_FAST_MODEL || 'claude-haiku-5-5';

/* Small in-memory cache: warm instances skip repeated identical prompts
   (many students opening the same lesson or the same verb). */
const cache = new Map<string, unknown>();
const MAX_CACHE = 500;
// characters of an error answer written to the log: enough to see what went wrong
const LOGGED_DETAIL = 500;

export class ClaudeError extends HttpError {}

export interface ImageInput {
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
  data: string;
}

const MEDIA_TYPES = new Set<string>(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
// The app shrinks photos before sending them; Vercel refuses bodies over 4.5 MB anyway.
const MAX_TOTAL_BASE64 = 4_000_000;

// Reads up to maxCount photos from the request body ({images: [{mediaType, data}]}); an HttpError is the answer to send back.
export function readImages(body: unknown, maxCount: number): ImageInput[] | HttpError {
  const raw = (body as { images?: unknown } | null)?.images;
  const list = Array.isArray(raw) ? raw : [];
  if (!list.length) return new HttpError(400, 'nothing_sent');
  if (list.length > maxCount)
    return new HttpError(400, 'too_many_pictures', { count: String(maxCount) });
  const images: ImageInput[] = [];
  let total = 0;
  for (const entry of list) {
    const { mediaType, data } = (entry || {}) as { mediaType?: unknown; data?: unknown };
    if (
      typeof data !== 'string' ||
      !data ||
      typeof mediaType !== 'string' ||
      !MEDIA_TYPES.has(mediaType)
    )
      return new HttpError(400, 'picture_type');
    total += data.length;
    images.push({ mediaType: mediaType as ImageInput['mediaType'], data });
  }
  if (total > MAX_TOTAL_BASE64) return new HttpError(413, 'pictures_too_large');
  return images;
}

// Asks Claude and returns the JSON in its answer; a warm instance answers an identical prompt from its cache.
export async function claudeJSON(
  prompt: string,
  options: {
    model?: string;
    maxTokens?: number;
    cache?: boolean;
    images?: ImageInput[];
    // base64 PDFs, read before the prompt
    pdfs?: string[];
  } = {}
): Promise<unknown> {
  const model = options.model || MODEL;
  const images = options.images || [];
  const pdfs = options.pdfs || [];
  const attachments = [
    ...pdfs.map((data) => ({
      type: 'document',
      source: { type: 'base64', media_type: 'application/pdf', data },
    })),
    ...images.map((image) => ({
      type: 'image',
      source: { type: 'base64', media_type: image.mediaType, data: image.data },
    })),
  ];
  // photos and PDFs are never cached: the key would be the whole file
  const useCache = options.cache !== false && !attachments.length;
  const key = model + '\u0000' + prompt;
  if (useCache && cache.has(key)) return cache.get(key);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new ClaudeError(500, 'claude_off');

  const apiResponse = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: options.maxTokens ?? 4000,
      messages: [
        {
          role: 'user',
          content: attachments.length ? [...attachments, { type: 'text', text: prompt }] : prompt,
        },
      ],
    }),
  });
  if (!apiResponse.ok) {
    const detail = await apiResponse.text().catch(() => '');
    console.error('Claude API error', apiResponse.status, detail.slice(0, LOGGED_DETAIL));
    if (apiResponse.status === 429 || apiResponse.status === 529)
      throw new ClaudeError(503, 'claude_busy');
    throw new ClaudeError(502, 'claude_failed');
  }
  const data = (await apiResponse.json()) as { content?: { type: string; text?: string }[] };
  const text = (data.content || [])
    .filter((block) => block.type === 'text')
    .map((block) => block.text || '')
    .join('\n');
  const value = extractJSON(text);
  if (value === undefined) throw new ClaudeError(502, 'claude_unreadable');

  if (useCache) {
    if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value as string);
    cache.set(key, value);
  }
  return value;
}

// The JSON in Claude's reply, also when it comes in a ```json fence or after a sentence; undefined when there is none.
export function extractJSON(text: string): unknown {
  const trimmed = text.trim();
  const tries = [trimmed];
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) tries.push(fence[1]);
  const first = trimmed.search(/[[{]/);
  const last = Math.max(trimmed.lastIndexOf('}'), trimmed.lastIndexOf(']'));
  if (first >= 0 && last > first) tries.push(trimmed.slice(first, last + 1));
  for (const candidate of tries) {
    try {
      return JSON.parse(candidate);
    } catch {
      // next
    }
  }
  return undefined;
}
