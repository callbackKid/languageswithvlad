import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useTranslation } from '../i18n/core';
import { call } from '../i18n/messages/call';
import { isDark, useSettings } from '../lib/settings';
import type { BoardHandle } from './BoardCanvas';

const BoardCanvas = lazy(() => import('./BoardCanvas'));

/** A drawing board for the lesson: write, draw, paste pictures. The student sees it through
    screen sharing in the call. Saved on this device for each day. */
export default function LessonBoard({ storageKey }: { storageKey: string }) {
  const { t, language } = useTranslation(call);
  // the theme chosen in Settings, or the system's
  const dark = isDark(useSettings());
  const frame = useRef<HTMLDivElement>(null);
  const handle = useRef<BoardHandle | null>(null);
  const [open, setOpen] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);

  useEffect(() => {
    const onFullScreen = () => setFullScreen(document.fullscreenElement === frame.current);
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
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section className="call-card lesson-board">
      <div className="call-notes-head">
        <h2>{t('boardTitle')}</h2>
        {open && (
          <>
            <button
              type="button"
              className="btn ghost"
              onClick={() =>
                fullScreen
                  ? void document.exitFullscreen()
                  : void frame.current?.requestFullscreen()
              }
            >
              {fullScreen ? t('exitFullScreen') : t('fullScreen')}
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
      <p className="hint">{t('boardHint')}</p>
      {open ? (
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
              onReady={(ready) => {
                handle.current = ready;
              }}
            />
          </Suspense>
        </div>
      ) : (
        <div className="row-actions">
          <button type="button" className="btn primary" onClick={() => setOpen(true)}>
            {t('openBoard')}
          </button>
        </div>
      )}
    </section>
  );
}
