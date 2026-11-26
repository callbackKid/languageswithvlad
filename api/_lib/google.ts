import { createSign } from 'node:crypto';

import { HttpError } from './http.js';
import { findLesson, type LessonTarget } from './lessons.js';

/* Writing to Google Docs as a service account: a robot Google account whose key lives in
   the GOOGLE_SERVICE_ACCOUNT env variable (the whole JSON key file). It can edit only the
   documents shared with its email as Editor. */

interface ServiceAccount {
  client_email: string;
  private_key: string;
}

// What a Google Docs id looks like; only such ids ever reach a Google URL.
export const GOOGLE_DOC_ID = /^[a-zA-Z0-9_-]{20,100}$/;

const SCOPE = 'https://www.googleapis.com/auth/documents';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
// characters of Google's error answer written to the log: enough to see what went wrong
const LOGGED_DETAIL = 300;

export class GoogleError extends HttpError {}

// The service account in GOOGLE_SERVICE_ACCOUNT; null when it isn't set or can't be read.
export const serviceAccount = (): ServiceAccount | null => {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ServiceAccount>;
    return parsed.client_email && parsed.private_key
      ? { client_email: parsed.client_email, private_key: parsed.private_key }
      : null;
  } catch {
    return null;
  }
};

const base64Url = (input: string | Buffer) => Buffer.from(input).toString('base64url');

let cachedToken: { value: string; expiresAt: number } | null = null;

// A short-lived access token, reused while it is valid.
const accessToken = async (account: ServiceAccount): Promise<string> => {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64Url(
    JSON.stringify({
      iss: account.client_email,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  );
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  const assertion = `${header}.${claims}.${base64Url(signer.sign(account.private_key))}`;

  const tokenResponse = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  if (!tokenResponse.ok) {
    console.error(
      'Google token error',
      tokenResponse.status,
      (await tokenResponse.text().catch(() => '')).slice(0, LOGGED_DETAIL)
    );
    throw new GoogleError(500, 'google_key');
  }
  const data = (await tokenResponse.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
};

interface DocParagraph {
  startIndex?: number;
  paragraph?: { elements?: { textRun?: { content?: string } }[] };
}

/** Inserts the text at the end of one lesson: just before the next lesson's heading, or at the
    end of the document for the newest one. False when the lesson isn't in the document. */
export const insertIntoLesson = async (
  documentId: string,
  target: LessonTarget,
  text: string
): Promise<boolean> => {
  const account = serviceAccount();
  if (!account) throw new GoogleError(501, 'google_off');
  const token = await accessToken(account);
  const url = `https://docs.googleapis.com/v1/documents/${encodeURIComponent(documentId)}`;
  const documentResponse = await fetch(`${url}?fields=body.content(startIndex,paragraph)`, {
    headers: { authorization: `Bearer ${token}` },
  });
  if (!documentResponse.ok) {
    if (documentResponse.status === 403 || documentResponse.status === 404)
      throw new GoogleError(403, 'google_no_edit', { email: account.client_email });
    throw new GoogleError(502, 'google_unreachable');
  }
  const { body } = (await documentResponse.json()) as { body?: { content?: DocParagraph[] } };
  const paragraphs = (body?.content ?? []).filter((element) => element.paragraph);
  const lines = paragraphs.map((element) =>
    (element.paragraph?.elements ?? []).map((part) => part.textRun?.content ?? '').join('')
  );
  const lesson = findLesson(lines, target);
  if (!lesson) return false;
  const nextStart = lesson.next === null ? undefined : paragraphs[lesson.next]?.startIndex;
  // Just before the newline that ends the lesson's last line: the new lines take that line's
  // plain style instead of the next heading's.
  const location =
    nextStart === undefined ? { endOfSegmentLocation: {} } : { location: { index: nextStart - 1 } };
  const docsResponse = await fetch(`${url}:batchUpdate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({
      requests: [{ insertText: { ...location, text: `\n${text.trim()}\n` } }],
    }),
  });
  if (!docsResponse.ok) throw new GoogleError(502, 'google_rejected');
  return true;
};

// Adds text at the very end of a Google Doc.
export const appendToDoc = async (documentId: string, text: string): Promise<void> => {
  const account = serviceAccount();
  if (!account) throw new GoogleError(501, 'google_off');
  const token = await accessToken(account);
  const docsResponse = await fetch(
    `https://docs.googleapis.com/v1/documents/${encodeURIComponent(documentId)}:batchUpdate`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ requests: [{ insertText: { endOfSegmentLocation: {}, text } }] }),
    }
  );
  if (docsResponse.ok) return;
  console.error(
    'Google Docs error',
    docsResponse.status,
    (await docsResponse.text().catch(() => '')).slice(0, LOGGED_DETAIL)
  );
  if (docsResponse.status === 403 || docsResponse.status === 404) {
    throw new GoogleError(403, 'google_no_edit', { email: account.client_email });
  }
  throw new GoogleError(502, 'google_rejected');
};
