/* Sends messages to the teacher's Telegram through a bot.
   TELEGRAM_BOT_TOKEN comes from @BotFather; TELEGRAM_CHAT_ID is the chat the bot writes to. */

const API_URL = 'https://api.telegram.org/bot';
// Telegram's own limits
const MAX_TEXT = 4096;
const MAX_CAPTION = 1024;

export class TelegramError extends Error {}

export interface TelegramPhoto {
  mediaType: string;
  /** base64, without the data: prefix */
  data: string;
}

export function telegramConfigured(): boolean {
  return !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

async function call(method: string, body: FormData): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) throw new TelegramError('Telegram isn’t set up on this server.');
  body.set('chat_id', chatId);
  const response = await fetch(`${API_URL}${token}/${method}`, { method: 'POST', body });
  if (!response.ok) {
    const answer = (await response.json().catch(() => null)) as { description?: string } | null;
    // the description says what's wrong ("chat not found", "Unauthorized"); it never contains the token
    console.error('Telegram', method, response.status, answer?.description);
    throw new TelegramError('The report couldn’t be delivered. Try again later.');
  }
}

const photoFile = (photo: TelegramPhoto) =>
  new Blob([Buffer.from(photo.data, 'base64')], { type: photo.mediaType || 'image/jpeg' });
const fileName = (index: number) => `screenshot-${index + 1}.jpg`;

export async function sendText(text: string): Promise<void> {
  const body = new FormData();
  body.set('text', text.slice(0, MAX_TEXT));
  body.set('disable_web_page_preview', 'true');
  await call('sendMessage', body);
}

/** The text with the photos under it: as a caption when it fits, otherwise as its own message first. */
export async function sendWithPhotos(text: string, photos: TelegramPhoto[]): Promise<void> {
  if (!photos.length) return sendText(text);
  const fitsCaption = text.length <= MAX_CAPTION;
  if (!fitsCaption) await sendText(text);
  const caption = fitsCaption ? text : 'Screenshots for the report above';

  const body = new FormData();
  if (photos.length === 1) {
    const [photo] = photos;
    if (photo) body.set('photo', photoFile(photo), fileName(0));
    body.set('caption', caption);
    return call('sendPhoto', body);
  }
  // several photos arrive together as an album; the caption sits on the first one
  const media = photos.map((_photo, index) => ({
    type: 'photo',
    media: `attach://photo${index}`,
    ...(index === 0 ? { caption } : {}),
  }));
  body.set('media', JSON.stringify(media));
  photos.forEach((photo, index) => body.set(`photo${index}`, photoFile(photo), fileName(index)));
  return call('sendMediaGroup', body);
}
