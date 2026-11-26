import type { VercelRequest, VercelResponse } from '@vercel/node';

import { serviceAccount } from './_lib/google.js';
import { isTeacher } from './_lib/http.js';
import { jitsiAppId } from './_lib/jitsi.js';
import { notionConfigured } from './_lib/notion.js';
import { telegramConfigured } from './_lib/telegram.js';
import { zoomConfigured } from './_lib/zoom.js';

// Lets the app know whether it should ask students for an access code, and what the server can do.
const handler = (request: VercelRequest, response: VercelResponse) => {
  response.status(200).json({
    needsCode: !!process.env.APP_ACCESS_CODE,
    // whether a teacher code is set up, and whether this request carries the right one; this is
    // how the app checks a teacher code (the free plan's 12 functions leave no room for another)
    teacherCode: !!process.env.APP_TEACHER_CODE,
    teacher: isTeacher(request),
    ai: !!process.env.ANTHROPIC_API_KEY,
    // the email the document has to be shared with, so the app can say so
    docWriter: serviceAccount()?.client_email ?? null,
    // whether bug reports and suggestions can be sent to the teacher's Telegram
    feedback: telegramConfigured(),
    // whether Zoom calls can run inside the app
    zoom: zoomConfigured(),
    // the JaaS AppID when video calls on Jitsi can run inside the app (it is part of every call's address)
    jitsi: jitsiAppId(),
    // whether Notion pages can be read (and lessons added to them)
    notion: notionConfigured(),
    // where the lesson board is shared live (Supabase Realtime); the key is the project's
    // public one, made to be used in browsers
    board:
      process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
        ? { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_ANON_KEY }
        : null,
  });
};

export default handler;
