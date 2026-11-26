import { exportToSvg } from '@excalidraw/excalidraw';
import type { BinaryFiles } from '@excalidraw/excalidraw/types';
import { useEffect, useRef } from 'react';

/** A board saved during a lesson, drawn as a picture. Excalidraw is a big library, so
    LessonDrawings loads this file only when there is a board to show. */
const BoardPicture = ({
  elements,
  files,
  dark,
  label,
}: {
  elements: unknown[];
  files: Record<string, unknown>;
  dark: boolean;
  label: string;
}) => {
  const holder = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let alive = true;
    exportToSvg({
      elements: elements as never,
      files: files as BinaryFiles,
      appState: { exportBackground: true, exportWithDarkMode: dark },
    })
      .then((svg: SVGSVGElement) => {
        if (!alive || !holder.current) return;
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-label', label);
        holder.current.replaceChildren(svg);
      })
      .catch(() => {
        // a board that can't be drawn just isn't shown
      });
    return () => {
      alive = false;
    };
  }, [elements, files, dark, label]);
  return <div className="board-picture" ref={holder} />;
};

export default BoardPicture;
