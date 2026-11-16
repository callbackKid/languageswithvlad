import '@excalidraw/excalidraw/index.css';

import { Excalidraw, exportToBlob } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import { useCallback, useEffect, useRef } from 'react';

import type { UiLanguage } from '../i18n/core';
import { load, save } from '../lib/storage';

/* The drawing itself (Excalidraw, MIT). It's a big library, so LessonBoard loads this file only
   when the board is opened. */

const LANG_CODES: Record<UiLanguage, string> = { en: 'en', ru: 'ru-RU', fr: 'fr-FR', de: 'de-DE' };

interface Saved {
  elements: unknown[];
  files: Record<string, unknown>;
}

export interface BoardHandle {
  /** the drawing as a PNG, or null when the board is empty */
  picture: () => Promise<Blob | null>;
  clear: () => void;
}

export default function BoardCanvas({
  storageKey,
  language,
  dark,
  onReady,
}: {
  storageKey: string;
  language: UiLanguage;
  dark: boolean;
  onReady: (handle: BoardHandle) => void;
}) {
  const timer = useRef<number>();
  const initial = useRef(load<Saved>(storageKey));
  // the newest drawing not written to storage yet (saving waits for a pause in drawing)
  const unsaved = useRef<Saved | null>(null);

  const flush = useCallback(() => {
    window.clearTimeout(timer.current);
    if (unsaved.current) save(storageKey, unsaved.current);
    unsaved.current = null;
  }, [storageKey]);
  // the last strokes are kept even when the board closes during the short save delay
  useEffect(() => flush, [flush]);

  return (
    <Excalidraw
      langCode={LANG_CODES[language]}
      theme={dark ? 'dark' : 'light'}
      initialData={
        initial.current
          ? {
              elements: initial.current.elements as never,
              files: initial.current.files as never,
              scrollToContent: true,
            }
          : null
      }
      UIOptions={{ canvasActions: { loadScene: false, saveToActiveFile: false } }}
      excalidrawAPI={(instance: ExcalidrawImperativeAPI) => {
        onReady({
          picture: async () => {
            const elements = instance.getSceneElements();
            if (!elements.length) return null;
            return exportToBlob({
              elements,
              appState: { ...instance.getAppState(), exportBackground: true },
              files: instance.getFiles(),
              mimeType: 'image/png',
            });
          },
          clear: () => {
            instance.resetScene();
            unsaved.current = { elements: [], files: {} };
            flush();
          },
        });
      }}
      onChange={(elements, _appState, files) => {
        // pictures pasted on the board can be large; storage may refuse them, the drawing stays
        unsaved.current = { elements: elements.filter((element) => !element.isDeleted), files };
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(flush, 400);
      }}
    />
  );
}
