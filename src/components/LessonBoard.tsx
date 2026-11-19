import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';

import { useTranslation } from '../i18n/core';
import { call } from '../i18n/messages/call';
import type { BoardPeer, BoardServer } from '../lib/boardSync';
import { isDark, useSettings } from '../lib/settings';
import type { BoardHandle } from './BoardCanvas';

// the download has started by then, so the file's address can be let go (milliseconds)
const RELEASE_AFTER = 1000;

const BoardCanvas = lazy(() => import('./BoardCanvas'));

/** A drawing board for the lesson: write, draw, paste pictures. With sharing set up, the teacher
    and the student draw on the same board live; it is also saved on each device for each day. */
export default function LessonBoard({
  storageKey,
  room,
  server,
}: {
  storageKey: string;
  // the shared room's name: the same for everyone on this document's board today
  room: string;
  // where the board is shared (Supabase), or null when it isn't set up
  server: BoardServer | null;
}) {
  const { t, language } = useTranslation(call);
  const settings = useSettings();
  // the theme chosen in Settings, or the system's
  const dark = isDark(settings);
  const [peers, setPeers] = useState<BoardPeer[]>([]);
  const onPeers = useCallback((next: BoardPeer[]) => setPeers(next), []);
  // without Supabase, development builds still share between tabs of one browser
  const shared = !!server || import.meta.env.DEV;
  const others = peers.length > 1;
  const frame = useRef<HTMLDivElement>(null);
  const handle = useRef<BoardHandle | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const onFullScreen = () => setIsFullScreen(document.fullscreenElement === frame.current);
    document.addEventListener('fullscreenchange', onFullScreen);
    return () => {
      document.removeEventListener('fullscreenchange', onFullScreen);
    };
  }, []);

  async function savePicture() {
    const blob = await handle.current?.picture();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `board-${new Date().toISOString().slice(0, 10)}.png`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), RELEASE_AFTER);
  }

  return (
    <section className="call-card lesson-board">
      <div className="call-card-head">
        <h2>{t('boardTitle')}</h2>
        {isOpen && (
          <>
            <button
              type="button"
              className="btn ghost"
              onClick={() =>
                isFullScreen
                  ? void document.exitFullscreen()
                  : void frame.current?.requestFullscreen()
              }
            >
              {isFullScreen ? t('exitFullScreen') : t('fullScreen')}
            </button>
            <button type="button" className="btn ghost" onClick={() => void savePicture()}>
              {t('savePicture')}
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                if (window.confirm(t('clearBoardConfirm'))) handle.current?.clear();
              }}
            >
              {t('clearBoard')}
            </button>
          </>
        )}
      </div>
      <p className="hint">{shared ? t('boardHintShared') : t('boardHint')}</p>
      {isOpen && shared && (
        <p className={'board-status' + (others ? ' live' : '')} role="status">
          {others
            ? t('boardLive', {
                names: peers.map((peer) => peer.name || t('someone')).join(', '),
              })
            : t('boardWaiting')}
        </p>
      )}
      {isOpen ? (
        <div ref={frame} className="board-frame">
          <Suspense
            fallback={
              <p className="hint">
                <span className="spinner" /> {t('loadingBoard')}
              </p>
            }
          >
            <BoardCanvas
              storageKey={storageKey}
              language={language}
              dark={dark}
              server={server}
              room={room}
              name={settings.name}
              onPeers={onPeers}
              onReady={(ready) => {
                handle.current = ready;
              }}
            />
          </Suspense>
        </div>
      ) : (
        <div className="row-actions">
          <button type="button" className="btn primary" onClick={() => setIsOpen(true)}>
            {t('openBoard')}
          </button>
        </div>
      )}
    </section>
  );
}
