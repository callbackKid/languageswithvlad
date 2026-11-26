import { createHmac } from 'node:crypto';

/* The Zoom Meeting SDK joins a meeting with a signature made from the app's secret. The secret
   stays on the server; the browser only gets a signature for one meeting, valid 2 hours.
   ZOOM_SDK_KEY / ZOOM_SDK_SECRET are the Client ID and Client Secret of a Zoom app with the
   Meeting SDK turned on (marketplace.zoom.us). */

const base64url = (value: string | Buffer) => Buffer.from(value).toString('base64url');

// Whether the Zoom SDK key and secret are set, so Zoom calls can run inside the app.
export const zoomConfigured = (): boolean => {
  return !!(process.env.ZOOM_SDK_KEY && process.env.ZOOM_SDK_SECRET);
};

// A signed JWT (HS256) that lets the Meeting SDK join one meeting as a participant.
export const zoomSignature = (meetingNumber: string, sdkKey: string, secret: string): string => {
  // a little in the past, so a server clock slightly ahead of Zoom's doesn't make it "not yet valid"
  const issuedAt = Math.floor(Date.now() / 1000) - 30;
  const expiresAt = issuedAt + 2 * 60 * 60;
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64url(
    JSON.stringify({
      appKey: sdkKey,
      sdkKey,
      mn: meetingNumber,
      // 0 joins as a participant; hosting from the app would need the host's Zoom sign-in (ZAK)
      role: 0,
      iat: issuedAt,
      exp: expiresAt,
      tokenExp: expiresAt,
    })
  );
  const signature = base64url(createHmac('sha256', secret).update(`${header}.${payload}`).digest());
  return `${header}.${payload}.${signature}`;
};
