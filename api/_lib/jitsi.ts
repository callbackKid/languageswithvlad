import { createSign } from 'node:crypto';

/* Video calls inside the app on Jitsi as a Service (JaaS, 8x8.vc). Every participant needs a JWT
   signed with the app's private key; the key stays on the server, the browser gets a token for
   one room, valid 3 hours. JAAS_APP_ID is the AppID ("vpaas-magic-cookie-…"), JAAS_KEY_ID the
   Key ID JaaS shows for the uploaded public key ("vpaas-magic-cookie-…/1a2b3c"), and
   JAAS_PRIVATE_KEY the matching private key in PEM (newlines may be written as \n). */

// a lesson lasts an hour or two; the token only has to let the participant in
const TOKEN_HOURS = 3;

const base64url = (value: string | Buffer) => Buffer.from(value).toString('base64url');

// The JaaS AppID when calls are set up, otherwise null. It isn't secret: it is part of every call's address.
export function jitsiAppId(): string | null {
  const { JAAS_APP_ID, JAAS_KEY_ID, JAAS_PRIVATE_KEY } = process.env;
  return JAAS_APP_ID && JAAS_KEY_ID && JAAS_PRIVATE_KEY ? JAAS_APP_ID : null;
}

/** A JWT (RS256) that lets one person into one room: the teacher as its moderator, a student as
    a participant. Recording, streaming and phone calls stay off: they cost extra on JaaS. */
export function jitsiToken({
  room,
  name,
  moderator,
}: {
  room: string;
  name: string;
  moderator: boolean;
}): string {
  const appId = process.env.JAAS_APP_ID ?? '';
  const keyId = process.env.JAAS_KEY_ID ?? '';
  const privateKey = (process.env.JAAS_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');
  // a little in the past, so a server clock slightly ahead of 8x8's doesn't make it "not yet valid"
  const notBefore = Math.floor(Date.now() / 1000) - 30;
  const header = base64url(JSON.stringify({ alg: 'RS256', kid: keyId, typ: 'JWT' }));
  const payload = base64url(
    JSON.stringify({
      aud: 'jitsi',
      iss: 'chat',
      sub: appId,
      room,
      nbf: notBefore,
      exp: notBefore + TOKEN_HOURS * 60 * 60,
      context: {
        user: {
          id: `${moderator ? 'teacher' : 'student'}-${name}`,
          name,
          moderator: String(moderator),
        },
        features: {
          livestreaming: false,
          recording: false,
          transcription: false,
          'outbound-call': false,
        },
      },
    })
  );
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${payload}`);
  return `${header}.${payload}.${base64url(signer.sign(privateKey))}`;
}
