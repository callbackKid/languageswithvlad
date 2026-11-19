import type { VercelRequest, VercelResponse } from '@vercel/node';

import { checkAccess, onlyPost } from './_lib/http.js';
import { zoomSignature } from './_lib/zoom.js';

// a Zoom meeting number has 9 to 11 digits
const MEETING_NUMBER_DIGITS = { min: 9, max: 11 };

// A signature for joining one Zoom meeting inside the app (Meeting SDK).
export default function handler(request: VercelRequest, response: VercelResponse) {
  if (!onlyPost(request, response) || !checkAccess(request, response)) return;
  const sdkKey = process.env.ZOOM_SDK_KEY;
  const secret = process.env.ZOOM_SDK_SECRET;
  if (!sdkKey || !secret)
    return response.status(501).json({ error: 'Zoom isn’t set up on this server.' });
  const meetingNumber = String(request.body?.meetingNumber ?? '').replace(/\D/g, '');
  if (
    meetingNumber.length < MEETING_NUMBER_DIGITS.min ||
    meetingNumber.length > MEETING_NUMBER_DIGITS.max
  )
    return response.status(400).json({ error: 'That isn’t a Zoom meeting number.' });
  response.status(200).json({ signature: zoomSignature(meetingNumber, sdkKey, secret) });
}
