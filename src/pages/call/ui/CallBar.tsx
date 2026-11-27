import { useState } from 'react';

import { findCall, openCallWindow } from '@/entities/lesson';
import { getSettings } from '@/shared/config';
import { call, useTranslation } from '@/shared/i18n';
import { loadText, save } from '@/shared/lib/storage';
import { Button, Input } from '@/shared/ui/controls';

// the name the call shows, kept on this device for the next lesson
const NAME_KEY = 'call:name';
// a name as Zoom shows it, and a meeting passcode (Zoom allows at most 10 characters; room to spare)
const MAX_NAME_LENGTH = 60;
const MAX_PASSCODE_LENGTH = 40;

// A call to show in the page: on Jitsi (the app's own) or Zoom inside the page.
export type JoinedCall =
  | { kind: 'jitsi'; name: string }
  | { kind: 'zoom'; name: string; meetingNumber: string; passcode: string };

/** The way into the lesson's call, one line beside lesson mode's title: a name and Join for a
    call that runs in the page (Jitsi, or Zoom when the server can sign), Google Meet's ways to
    open beside the app, or Open in Zoom. While a call runs here, it says so, with Leave. */
const CallBar = ({
  docText,
  zoomReady,
  hasJitsi,
  joined,
  onJoin,
  onLeave,
}: {
  docText: string;
  zoomReady: boolean;
  // the server runs Jitsi calls (JaaS): a call in the page for this document, every day
  hasJitsi: boolean;
  joined: JoinedCall | null;
  onJoin: (joining: JoinedCall) => void;
  onLeave: () => void;
}) => {
  const { t } = useTranslation(call);
  const link = findCall(docText);
  const [name, setName] = useState(() => loadText(NAME_KEY) ?? getSettings().name);
  const [passcode, setPasscode] = useState(link?.kind === 'zoom' ? link.passcode : '');
  const [isBlocked, setBlocked] = useState(false);

  if (joined)
    return (
      <div className="call-bar" role="status">
        <span className="call-live">
          <span className="live-dot" aria-hidden="true" /> {t('inCall')}
        </span>
        <Button onClick={onLeave}>{t('leaveCall')}</Button>
      </div>
    );

  // Zoom in the page needs the server's signature and a meeting number in the link
  const zoomHere =
    link?.kind === 'zoom' && zoomReady && link.meetingNumber ? link.meetingNumber : null;
  // a call that runs in the page: the app's own (Jitsi) first, else Zoom when it can
  const inPage = hasJitsi ? 'jitsi' : zoomHere ? 'zoom' : null;

  const newTab = (label: string, tooltip?: string) =>
    link && (
      <a
        className="btn"
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        data-tooltip={tooltip}
      >
        {label}
      </a>
    );

  return (
    <div className="call-bar">
      {inPage && (
        <form
          className="call-bar-join"
          onSubmit={(event) => {
            event.preventDefault();
            const trimmed = name.trim();
            if (!trimmed) return;
            save(NAME_KEY, trimmed);
            onJoin(
              inPage === 'jitsi' || !zoomHere
                ? { kind: 'jitsi', name: trimmed }
                : { kind: 'zoom', name: trimmed, meetingNumber: zoomHere, passcode }
            );
          }}
        >
          <Input
            type="text"
            required
            maxLength={MAX_NAME_LENGTH}
            value={name}
            placeholder={t('yourName')}
            aria-label={t('yourName')}
            onChange={(event) => setName(event.target.value)}
          />
          {inPage === 'zoom' && (
            <Input
              type="text"
              maxLength={MAX_PASSCODE_LENGTH}
              value={passcode}
              placeholder={t('passcode')}
              aria-label={t('passcode')}
              onChange={(event) => setPasscode(event.target.value)}
            />
          )}
          <Button
            type="submit"
            variant="primary"
            disabled={!name.trim()}
            data-tooltip={inPage === 'jitsi' ? t('jitsiExplain') : t('zoomExplain')}
          >
            {inPage === 'jitsi' ? t('joinCall') : t('joinHere')}
          </Button>
        </form>
      )}
      {link?.kind === 'meet' && (
        // Meet can't run inside the page: its three ways to open, folded under one button
        <details className="call-meet">
          <summary className="btn">{t('meetTitle')} ▾</summary>
          <div className="call-meet-menu">
            <p className="hint">{t('meetExplain')}</p>
            <Button variant="primary" onClick={() => setBlocked(!openCallWindow(link.url))}>
              {t('openMeet')}
            </Button>
            <Button onClick={() => setBlocked(!openCallWindow(link.url, 'half'))}>
              {t('sideBySide')}
            </Button>
            {newTab(t('openInTab'))}
            <p className="legend">{t('pipTip')}</p>
          </div>
        </details>
      )}
      {link?.kind === 'zoom' &&
        newTab(
          t('openInZoom'),
          !link.meetingNumber ? t('zoomNoNumber') : !zoomReady ? t('zoomNotSetUp') : undefined
        )}
      {!link && !hasJitsi && <p className="hint">{t('noCall')}</p>}
      {isBlocked && (
        <div className="note warn call-bar-note" role="alert">
          <p>{t('popupBlocked')}</p>
        </div>
      )}
    </div>
  );
};

export default CallBar;
