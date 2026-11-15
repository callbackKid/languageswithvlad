/* The video call of the lesson: the newest Google Meet or Zoom link written in the document. */

export type CallLink =
  | { kind: 'meet'; url: string }
  | {
      kind: 'zoom';
      url: string;
      /** null for links without a number, like a personal room zoom.us/my/name */
      meetingNumber: string | null;
      passcode: string;
    };

// meet.google.com/abc-defg-hij, also with extra path parts like /meet/abc-defg-hij or /lookup/…
const MEET = /https?:\/\/meet\.google\.com(?:\/[\w-]+)+/gi;
// us05web.zoom.us/j/12345678901?pwd=…, zoom.us/wc/join/…, zoom.us/my/name
const ZOOM = /https?:\/\/(?:[\w-]+\.)*zoom\.us\/[^\s)<>"']+/gi;
// "Passcode: 123456", "Code secret : 123456", "Пароль: 123456", "Kenncode: 123456"
const PASSCODE =
  /(?:passcode|password|code secret|code d['’]accès|mot de passe|пароль|код доступа|kenncode|passwort)\s*[:：]?\s*([\w-]{4,20})/i;

function zoomDetails(url: string, text: string, position: number) {
  const meetingNumber = url.match(/\/(?:j|s|w|wc\/join|wc)\/(\d{9,11})/)?.[1] ?? null;
  // a passcode written next to the link wins over the encoded one inside it
  const nearby = text.slice(position, position + url.length + 200);
  const written = nearby.match(PASSCODE)?.[1];
  let fromLink = '';
  try {
    fromLink = new URL(url).searchParams.get('pwd') ?? '';
  } catch {
    // not a valid URL after all; no passcode from it
  }
  return { meetingNumber, passcode: written ?? fromLink };
}

/** The last Meet or Zoom link in the document (the newest lesson is at the end), or null. */
export function findCall(text: string): CallLink | null {
  let newest: { url: string; kind: 'meet' | 'zoom'; position: number } | null = null;
  for (const [pattern, kind] of [
    [MEET, 'meet'],
    [ZOOM, 'zoom'],
  ] as const) {
    for (const match of text.matchAll(pattern)) {
      const position = match.index ?? 0;
      if (!newest || position > newest.position)
        newest = { url: match[0].replace(/[.,;]+$/, ''), kind, position };
    }
  }
  if (!newest) return null;
  if (newest.kind === 'meet') return { kind: 'meet', url: newest.url };
  return { kind: 'zoom', url: newest.url, ...zoomDetails(newest.url, text, newest.position) };
}

/**
 * Opens the call as a small separate window at the right edge of the screen, so the app stays
 * beside it. Google Meet refuses to load inside other sites, so this is as close as it gets.
 */
export function openCallWindow(url: string, layout: 'small' | 'half' = 'small'): boolean {
  const screen = window.screen;
  // "half": a tall window over the right half of the screen, the closest a page can get to
  // the browser's own split view (which no website can open by itself)
  const width = layout === 'half' ? Math.round(screen.availWidth / 2) : 520;
  const height = layout === 'half' ? screen.availHeight : 400;
  const left = Math.max(0, screen.availWidth - width - (layout === 'half' ? 0 : 24));
  const top = layout === 'half' ? 0 : 48;
  const opened = window.open(
    url,
    'cahier-call',
    `popup,width=${width},height=${height},left=${left},top=${top}`
  );
  return !!opened;
}
