import { useEffect, useRef } from 'react';

import {
  getBoardRevision,
  readBoardPreview,
  type SavedBoard,
  writeBoardPreview,
} from '@/entities/board';

/** Prefer a picture from this board revision. Older boards can still render from the scene. */
const BoardPicture = ({
  boardKey,
  board,
  dark,
  label,
}: {
  boardKey: string;
  board: SavedBoard;
  dark: boolean;
  label: string;
}) => {
  const holder = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = holder.current;
    if (!element) return;
    let alive = true;
    let imageUrl: string | undefined;

    const show = async () => {
      const scene = JSON.stringify(board);
      const revision = await getBoardRevision(scene);
      const cached = revision && (await readBoardPreview(boardKey, revision, dark));
      if (!alive) return;
      if (cached) {
        const image = new Image();
        image.alt = label;
        imageUrl = URL.createObjectURL(cached);
        image.src = imageUrl;
        try {
          await image.decode();
          if (alive) element.replaceChildren(image);
          return;
        } catch {
          URL.revokeObjectURL(imageUrl);
          imageUrl = undefined;
        }
      }
      if (!alive) return;
      const { exportToSvg } = await import('@excalidraw/excalidraw');
      if (!alive) return;
      const svg = await exportToSvg({
        elements: board.elements as never,
        files: board.files,
        appState: { exportBackground: true, exportWithDarkMode: dark },
      });
      if (!alive) return;
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', label);
      element.replaceChildren(svg);
      if (revision) {
        const markup = new XMLSerializer().serializeToString(svg);
        const image = new Blob([markup], { type: 'image/svg+xml' });
        void writeBoardPreview(boardKey, scene, revision, dark, image);
      }
    };

    // A board that can't be drawn does not hide the lesson notes.
    void show().catch(() => undefined);
    return () => {
      alive = false;
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      element.replaceChildren();
    };
  }, [boardKey, board, dark, label]);
  return <div className="board-picture" ref={holder} />;
};

export default BoardPicture;
