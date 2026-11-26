import { useEffect, useRef, useState } from 'react';

import { api, ApiError } from '@/shared/api';
import { call, getUiLanguage, translator, useTranslation } from '@/shared/i18n';
import { Button } from '@/shared/ui/controls';

// Jitsi as a Service: every call runs on 8x8's servers, under the app's AppID
const JAAS_DOMAIN = '8x8.vc';

// The parts of Jitsi's IFrame API the app uses; the library itself comes from 8x8 at join time.
interface JitsiMeeting {
  dispose: () => void;
  addListener: (event: string, listener: () => void) => void;
}
declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (domain: string, options: Record<string, unknown>) => JitsiMeeting;
  }
}

// Loads the IFrame API for this AppID, once: only when someone joins a call.
function loadJitsi(appId: string): Promise<void> {
  if (window.JitsiMeetExternalAPI) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://${JAAS_DOMAIN}/${encodeURIComponent(appId)}/external_api.js`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      reject(new Error('jitsi_script'));
    };
    document.head.append(script);
  });
}

/** A Jitsi video call running inside the page (JaaS IFrame API). The server signs a token for the
    room, with the teacher as its moderator; the call ends when the person leaves it in Jitsi,
    presses Leave, or leaves lesson mode. */
export default function JitsiCall({
  appId,
  room,
  userName,
  onLeave,
}: {
  appId: string;
  room: string;
  userName: string;
  onLeave: () => void;
}) {
  const { t } = useTranslation(call);
  const root = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'joining' | 'in' | 'error'>('joining');
  const [error, setError] = useState('');
  // read when Jitsi says the call is over, so a new onLeave doesn't restart the call
  const leaveNow = useRef(onLeave);
  useEffect(() => {
    leaveNow.current = onLeave;
  });

  useEffect(() => {
    let cancelled = false;
    let meeting: JitsiMeeting | null = null;
    Promise.all([loadJitsi(appId), api.jitsiToken(room, userName)])
      .then(([, { token, roomName }]) => {
        const Meeting = window.JitsiMeetExternalAPI;
        if (cancelled || !Meeting || !root.current) return;
        meeting = new Meeting(JAAS_DOMAIN, {
          roomName,
          jwt: token,
          parentNode: root.current,
          width: '100%',
          height: '100%',
          // the language at the moment of joining; changing it later doesn't restart the call
          lang: getUiLanguage(),
          userInfo: { displayName: userName },
        });
        meeting.addListener('readyToClose', () => leaveNow.current());
        setState('in');
      })
      .catch((failure: unknown) => {
        if (cancelled) return;
        setState('error');
        setError(failure instanceof ApiError ? failure.message : translator(call).t('jitsiFailed'));
      });
    return () => {
      cancelled = true;
      meeting?.dispose();
    };
  }, [appId, room, userName]);

  return (
    <div className="jitsi-call">
      {state === 'joining' && (
        <p className="hint">
          <span className="spinner" /> {t('joining')}
        </p>
      )}
      {state === 'error' && (
        <div className="note err" role="alert">
          <p>{error}</p>
        </div>
      )}
      <div ref={root} className={'jitsi-root' + (state === 'in' ? ' in' : '')} />
      <Button variant="ghost" onClick={onLeave}>
        {t('leave')}
      </Button>
    </div>
  );
}
