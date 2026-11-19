import type { VercelRequest, VercelResponse } from '@vercel/node';

import { checkAccess, fail, onlyPost, text } from './_lib/http.js';
import { sendWithPhotos, telegramConfigured, type TelegramPhoto } from './_lib/telegram.js';

const KINDS: Record<string, string> = {
  bug: '🐞 Bug report',
  idea: '💡 Suggestion',
  other: '💬 Message',
};
const MAX_PHOTOS = 3;
// the message itself; keep in step with maxLength in src/components/Feedback.tsx
const MAX_MESSAGE_LENGTH = 3000;
// the contact, the page and the document's name
const MAX_DETAIL_LENGTH = 200;
// a browser's user agent and window size
const MAX_BROWSER_LENGTH = 300;
const MAX_DATE_LENGTH = 80;
const MAX_KIND_LENGTH = 10;
const MAX_PHOTOS_BASE64 = 4_000_000;
const PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

// a few reports per visitor in a short time, so a stuck button or a script can't flood the chat
// (in memory, so per server instance: enough for a small app)
const RECENT_LIMIT = 5;
const RECENT_WINDOW = 10 * 60 * 1000;
const recent = new Map<string, number[]>();
function tooMany(visitor: string): boolean {
  const now = Date.now();
  // forget visitors whose reports are all old, so the list doesn't grow for ever
  for (const [known, times] of recent)
    if (times.every((time) => now - time >= RECENT_WINDOW)) recent.delete(known);
  const times = (recent.get(visitor) ?? []).filter((time) => now - time < RECENT_WINDOW);
  times.push(now);
  recent.set(visitor, times);
  return times.length > RECENT_LIMIT;
}

function readPhotos(raw: unknown): TelegramPhoto[] | string {
  const list = Array.isArray(raw) ? raw : [];
  if (list.length > MAX_PHOTOS) return `Attach at most ${MAX_PHOTOS} pictures.`;
  const photos: TelegramPhoto[] = [];
  let total = 0;
  for (const entry of list) {
    const { mediaType, data } = (entry || {}) as { mediaType?: unknown; data?: unknown };
    if (
      typeof data !== 'string' ||
      !data ||
      typeof mediaType !== 'string' ||
      !PHOTO_TYPES.has(mediaType)
    )
      return 'Attach JPEG, PNG or WebP pictures.';
    total += data.length;
    photos.push({ mediaType, data });
  }
  if (total > MAX_PHOTOS_BASE64) return 'These pictures are too large. Attach fewer.';
  return photos;
}

/** A bug report, suggestion or any message from a student, with optional screenshots, sent to the teacher's Telegram. */
export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!onlyPost(request, response) || !checkAccess(request, response)) return;
  if (!telegramConfigured())
    return response.status(501).json({ error: 'Feedback isn’t set up on this server.' });

  const body = (request.body ?? {}) as Record<string, unknown>;
  const message = text(body.message, MAX_MESSAGE_LENGTH);
  if (!message) return response.status(400).json({ error: 'Write a few words first.' });
  const photos = readPhotos(body.images);
  if (typeof photos === 'string') return response.status(400).json({ error: photos });

  const visitor =
    String(request.headers['x-forwarded-for'] ?? '')
      .split(',')[0]
      ?.trim() || 'unknown';
  if (tooMany(visitor))
    return response
      .status(429)
      .json({ error: 'Too many messages in a short time. Try again in a few minutes.' });

  const details = [
    ['From', text(body.contact, MAX_DETAIL_LENGTH) || 'not given'],
    ['Page', text(body.page, MAX_DETAIL_LENGTH)],
    ['Document', text(body.docTitle, MAX_DETAIL_LENGTH)],
    ['Browser', text(body.browser, MAX_BROWSER_LENGTH)],
    ['Sent', text(body.sentAt, MAX_DATE_LENGTH)],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`);
  const report = [
    KINDS[text(body.kind, MAX_KIND_LENGTH)] ?? KINDS.other,
    '',
    message,
    '',
    ...details,
  ].join('\n');

  try {
    await sendWithPhotos(report, photos);
    response.status(200).json({ ok: true });
  } catch (error) {
    fail(response, error);
  }
}
