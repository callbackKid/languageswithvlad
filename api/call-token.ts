import type { VercelRequest, VercelResponse } from '@vercel/node';

import { checkAccess, isTeacher, onlyPost, text } from './_lib/http.js';
import { jitsiAppId, jitsiToken } from './_lib/jitsi.js';
import { zoomSignature } from './_lib/zoom.js';

/* What a browser needs to join a call inside the app, by body.kind (one function for both,
   since Vercel's free plan allows 12):
   - "zoom": a Meeting SDK signature for one Zoom meeting;
   - "jitsi": a JaaS token for one room, the teacher (by the teacher code) as its moderator. */

// a Zoom meeting number has 9 to 11 digits
const MEETING_NUMBER_DIGITS = { min: 9, max: 11 };
// the room names the app makes: "lesson-" and letters, digits and hyphens
const JITSI_ROOM = /^lesson-[a-z0-9-]{4,60}$/;
// a name as people write it in the call
const MAX_NAME_LENGTH = 60;

// A signature or token for joining one call inside the app.
const handler = (request: VercelRequest, response: VercelResponse) => {
  if (!onlyPost(request, response) || !checkAccess(request, response)) return;
  const body = (request.body ?? {}) as Record<string, unknown>;

  if (body.kind === 'jitsi') {
    const appId = jitsiAppId();
    if (!appId) return response.status(501).json({ error: 'jitsi_off' });
    const room = typeof body.room === 'string' ? body.room : '';
    if (!JITSI_ROOM.test(room)) return response.status(400).json({ error: 'bad_room' });
    const name = text(body.name, MAX_NAME_LENGTH) || 'Guest';
    const token = jitsiToken({ room, name, moderator: isTeacher(request) });
    return response.status(200).json({ token, roomName: `${appId}/${room}` });
  }

  const sdkKey = process.env.ZOOM_SDK_KEY;
  const secret = process.env.ZOOM_SDK_SECRET;
  if (!sdkKey || !secret) return response.status(501).json({ error: 'zoom_off' });
  const meetingNumber = String(body.meetingNumber ?? '').replace(/\D/g, '');
  if (
    meetingNumber.length < MEETING_NUMBER_DIGITS.min ||
    meetingNumber.length > MEETING_NUMBER_DIGITS.max
  )
    return response.status(400).json({ error: 'bad_meeting_number' });
  response.status(200).json({ signature: zoomSignature(meetingNumber, sdkKey, secret) });
};

export default handler;
