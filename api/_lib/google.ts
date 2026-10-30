import { createSign } from 'node:crypto';

/* Writing to Google Docs as a service account: a robot Google account whose key lives in
   the GOOGLE_SERVICE_ACCOUNT env variable (the whole JSON key file). It can edit only the
   documents shared with its email as Editor. */

interface ServiceAccount {
  client_email: string;
  private_key: string;
}

const SCOPE = 'https://www.googleapis.com/auth/documents';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

export class GoogleError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export function serviceAccount(): ServiceAccount | null {
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
}

const base64Url = (input: string | Buffer) => Buffer.from(input).toString('base64url');

let cachedToken: { value: string; expiresAt: number } | null = null;

/** A short-lived access token, reused while it is valid. */
async function accessToken(account: ServiceAccount): Promise<string> {
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
      (await tokenResponse.text().catch(() => '')).slice(0, 300)
    );
    throw new GoogleError(
      500,
      'The Google service account key was refused. Check GOOGLE_SERVICE_ACCOUNT.'
    );
  }
  const data = (await tokenResponse.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

/** Adds text at the very end of a Google Doc. */
export async function appendToDoc(documentId: string, text: string): Promise<void> {
  const account = serviceAccount();
  if (!account) throw new GoogleError(501, 'Writing to Google Docs isn’t set up on this server.');
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
    (await docsResponse.text().catch(() => '')).slice(0, 300)
  );
  if (docsResponse.status === 403 || docsResponse.status === 404) {
    throw new GoogleError(
      403,
      `The app can’t edit this document. In Google Docs, share it with ${account.client_email} as Editor.`
    );
  }
  throw new GoogleError(502, 'Google Docs didn’t accept the change. Try again.');
}
