import { useEffect, useRef, useState } from 'react';

import { api, ApiError } from '@/shared/api';
import { call, getUiLanguage, translator, type UiLanguage, useTranslation } from '@/shared/i18n';

// the Zoom window speaks the same language as the app
// the size of the call inside the page, in pixels: 16:9, as wide as the lesson mode's column
const ZOOM_VIEW = { width: 480, height: 270 };

const ZOOM_LANGUAGES = {
  en: 'en-US',
  ru: 'ru-RU',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
  pt: 'pt-PT',
  it: 'it-IT',
} as const satisfies Record<UiLanguage, string>;

/** A Zoom meeting running inside the page (Zoom Meeting SDK, component view). The SDK is large,
    so it's only downloaded when someone actually joins. */
export default function ZoomCall({
  meetingNumber,
  passcode,
  userName,
  onLeave,
}: {
  meetingNumber: string;
  passcode: string;
  userName: string;
  onLeave: () => void;
}) {
  const { t } = useTranslation(call);
  const root = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'joining' | 'in' | 'error'>('joining');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    let leave: (() => void) | null = null;
    (async () => {
      const [{ default: ZoomMtgEmbedded }, { signature }] = await Promise.all([
        import('@zoom/meetingsdk/embedded'),
        api.zoomSignature(meetingNumber),
      ]);
      if (cancelled) return;
      const client = ZoomMtgEmbedded.createClient();
      leave = () => {
        void client.leaveMeeting().catch(() => undefined);
        ZoomMtgEmbedded.destroyClient();
      };
      await client.init({
        zoomAppRoot: root.current ?? undefined,
        // the language at the moment of joining; changing it later doesn't restart the call
        language: ZOOM_LANGUAGES[getUiLanguage()],
        patchJsMedia: true,
        leaveOnPageUnload: true,
        customize: {
          video: { isResizable: true, viewSizes: { default: ZOOM_VIEW } },
        },
      });
      await client.join({ signature, meetingNumber, password: passcode, userName });
      if (!cancelled) setState('in');
    })().catch((failure: unknown) => {
      if (cancelled) return;
      setState('error');
      // the SDK rejects with { reason, errorCode }; our API with ApiError
      const reason =
        failure instanceof ApiError
          ? failure.message
          : String((failure as { reason?: string } | null)?.reason ?? failure);
      setError(translator(call).t('zoomFailed', { reason }));
    });
    return () => {
      cancelled = true;
      leave?.();
    };
  }, [meetingNumber, passcode, userName]);

  return (
    <div className="zoom-call">
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
      <div ref={root} className="zoom-root" />
      <button type="button" className="btn ghost" onClick={onLeave}>
        {t('leave')}
      </button>
    </div>
  );
}
