import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkAccess, onlyPost } from './_lib/claude.js';
import {
  sendWithPhotos,
  telegramConfigured,
  TelegramError,
  type TelegramPhoto,
} from './_lib/telegram.js';

const KINDS: Record<string, string> = {
  bug: '🐞 Bug report',
  idea: '💡 Suggestion',
  other: '💬 Message',
};
const MAX_PHOTOS = 3;
const MAX_PHOTOS_BASE64 = 4_000_000;
const PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

// a few reports per visitor in a short time, so a stuck button or a script can't flood the chat
// (in memory, so per server instance: enough for a small app)
const RECENT_LIMIT = 5;
const RECENT_WINDOW = 10 * 60 * 1000;
const recent = new Map<string, number[]>();
function tooMany(visitor: string): boolean {
  const now = Date.now();
  const times = (recent.get(visitor) ?? []).filter((time) => now - time < RECENT_WINDOW);
  times.push(now);
  recent.set(visitor, times);
  return times.length > RECENT_LIMIT;
}

const text = (value: unknown, maxLength: number) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

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
    return response.status(503).json({ error: 'Feedback isn’t set up on this server.' });

  const body = (request.body ?? {}) as Record<string, unknown>;
  const message = text(body.message, 3000);
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
    ['From', text(body.contact, 200) || 'not given'],
    ['Page', text(body.page, 200)],
    ['Document', text(body.docTitle, 200)],
    ['Browser', text(body.browser, 300)],
    ['Sent', text(body.sentAt, 80)],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`);
  const report = [KINDS[text(body.kind, 10)] ?? KINDS.other, '', message, '', ...details].join(
    '\n'
  );

  try {
    await sendWithPhotos(report, photos);
    response.status(200).json({ ok: true });
  } catch (error) {
    if (error instanceof TelegramError) return response.status(502).json({ error: error.message });
    console.error(error);
    response.status(500).json({ error: 'Something went wrong on the server.' });
  }
}
