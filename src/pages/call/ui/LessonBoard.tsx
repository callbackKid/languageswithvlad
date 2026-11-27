import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';

import { type BoardPeer, type BoardServer, loadBoardSharing } from '@/shared/api';
import { isDark, useSettings } from '@/shared/config';
import { call, useTranslation } from '@/shared/i18n';
import CallCard from '@/shared/ui/CallCard';
import { Button } from '@/shared/ui/controls';
import InlineConfirm from '@/shared/ui/InlineConfirm';

import { type BoardHandle } from './BoardCanvas';
import styles from './LessonBoard.module.css';

// the download has started by then, so the file's address can be let go (milliseconds)
const RELEASE_AFTER = 1000;

const BoardCanvas = lazy(() => import('./BoardCanvas'));

/** A drawing board for the lesson: write, draw, paste pictures. With sharing set up, the teacher
    and the student draw on the same board live; it is also saved on each device for each day. */
const LessonBoard = ({
  storageKey,
  room,
  server,
}: {
  storageKey: string;
  // the shared room's name: the same for everyone on this document's board today
  room: string;
  // where the board is shared (Supabase), or null when it isn't set up
  server: BoardServer | null;
}) => {
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
  // Clear the board was pressed: the question at the top of the card asks first
  const [isAskingToClear, setAskingToClear] = useState(false);

  useEffect(() => {
    const onFullScreen = () => setIsFullScreen(document.fullscreenElement === frame.current);
    document.addEventListener('fullscreenchange', onFullScreen);
    return () => {
      document.removeEventListener('fullscreenchange', onFullScreen);
    };
  }, []);

  const savePicture = async () => {
    const blob = await handle.current?.picture();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `board-${new Date().toISOString().slice(0, 10)}.png`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), RELEASE_AFTER);
  };

  return (
    <CallCard
      id="board"
      title={t('boardTitle')}
      className={styles['lesson-board']}
      actions={
        <>
          {isOpen && (
            <>
              <Button
                variant="ghost"
                onClick={() =>
                  isFullScreen
                    ? void document.exitFullscreen()
                    : void frame.current?.requestFullscreen()
                }
              >
                {isFullScreen ? t('exitFullScreen') : t('fullScreen')}
              </Button>
              <Button variant="ghost" onClick={() => void savePicture()}>
                {t('savePicture')}
              </Button>
              <Button
                variant="ghost"
                aria-expanded={isAskingToClear}
                onClick={() => setAskingToClear(!isAskingToClear)}
              >
                {t('clearBoard')}
              </Button>
            </>
          )}
        </>
      }
    >
      {isOpen && isAskingToClear && (
        <InlineConfirm
          question={t('clearBoardConfirm')}
          yesLabel={t('clearBoard')}
          onYes={() => {
            handle.current?.clear();
            setAskingToClear(false);
          }}
          onNo={() => setAskingToClear(false)}
        />
      )}
      <p className="hint">{shared ? t('boardHintShared') : t('boardHint')}</p>
      {isOpen && shared && (
        <p className={styles['board-status'] + (others ? ` ${styles.live}` : '')} role="status">
          {others
            ? t('boardLive', {
                names: peers.map((peer) => peer.name || t('someone')).join(', '),
              })
            : t('boardWaiting')}
        </p>
      )}
      {isOpen ? (
        <div ref={frame} className={styles['board-frame']}>
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
          <Button
            variant="primary"
            onClick={() => {
              // Start the SDK and canvas downloads together on shared boards.
              if (server?.url) void loadBoardSharing().catch(() => undefined);
              setIsOpen(true);
            }}
          >
            {t('openBoard')}
          </Button>
        </div>
      )}
    </CallCard>
  );
};

export default LessonBoard;
