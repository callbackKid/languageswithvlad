import type { VercelRequest, VercelResponse } from '@vercel/node';
import { serviceAccount } from './_lib/google.js';
import { telegramConfigured } from './_lib/telegram.js';

/** Lets the app know whether it should ask students for an access code, and what the server can do. */
export default function handler(_request: VercelRequest, response: VercelResponse) {
  response.status(200).json({
    needsCode: !!process.env.APP_ACCESS_CODE,
    ai: !!process.env.ANTHROPIC_API_KEY,
    // the email the document has to be shared with, so the app can say so
    docWriter: serviceAccount()?.client_email ?? null,
    // whether bug reports and suggestions can be sent to the teacher's Telegram
    feedback: telegramConfigured(),
  });
}
