import '@excalidraw/excalidraw/index.css';

import {
  CaptureUpdateAction,
  Excalidraw,
  exportToBlob,
  reconcileElements,
} from '@excalidraw/excalidraw';
import type {
  BinaryFiles,
  Collaborator,
  ExcalidrawImperativeAPI,
  SocketId,
} from '@excalidraw/excalidraw/types';
import { useCallback, useEffect, useRef } from 'react';

import {
  asPointer,
  asPointerButton,
  asSavedBoard,
  asSharedElements,
  asSharedFiles,
} from '@/entities/board';
import { type BoardConnection, type BoardPeer, type BoardServer, connectBoard } from '@/shared/api';
import { type UiLanguage } from '@/shared/i18n';
import { loadChecked, save } from '@/shared/lib/storage';

/* The drawing itself (Excalidraw, MIT). It's a big library, so LessonBoard loads this file only
   when the board is opened. With a connection, every change is sent to the other people on the
   board and theirs are merged in (see src/shared/api/boardSync.ts for the messages). */

const LANG_CODES: Record<UiLanguage, string> = {
  en: 'en',
  ru: 'ru-RU',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
  pt: 'pt-PT',
  it: 'it-IT',
};
/** Changes are gathered for this long before they are sent: smooth for the other person,
    and well within the realtime service's message limits. */
const SEND_EVERY = 100;
const POINTER_EVERY = 60;
// the drawing is saved on the device this many milliseconds after the last stroke
const SAVE_AFTER = 400;
// Pictures larger than this aren't sent (a broadcast message is limited to about 256 KB).
const MAX_SHARED_FILE = 180_000;

type RemoteElements = Parameters<typeof reconcileElements>[1];
interface Saved {
  elements: unknown[];
  files: Record<string, unknown>;
}

export interface BoardHandle {
  // the drawing as a PNG, or null when the board is empty
  picture: () => Promise<Blob | null>;
  clear: () => void;
}

// The board itself: saved on this device per day, and shared live when a connection is given.
const BoardCanvas = ({
  storageKey,
  language,
  dark,
  server,
  room,
  name,
  onReady,
  onPeers,
}: {
  storageKey: string;
  language: UiLanguage;
  dark: boolean;
  // where the board is shared; null to share only between tabs in development
  server: BoardServer | null;
  // the shared room's name: the same for everyone on this document's board today
  room: string;
  // shown next to this person's pointer on the others' boards
  name: string;
  onReady: (handle: BoardHandle) => void;
  onPeers: (peers: BoardPeer[]) => void;
}) => {
  const api = useRef<ExcalidrawImperativeAPI | null>(null);
  // opened and closed by the effect below, so React's double mount in development is harmless
  const connectionRef = useRef<BoardConnection | null>(null);
  const timer = useRef<number>();
  const initial = useRef(loadChecked(storageKey, asSavedBoard));
  // the newest drawing not written to storage yet (saving waits for a pause in drawing)
  const unsaved = useRef<Saved | null>(null);
  // the version of each shape the others already have, so only real changes are sent
  const shared = useRef(new Map<string, number>());
  const sentFiles = useRef(new Set<string>());
  const sendTimer = useRef<number>();
  const lastPointer = useRef(0);
  const collaborators = useRef(new Map<SocketId, Collaborator>());

  const flush = useCallback(() => {
    window.clearTimeout(timer.current);
    if (unsaved.current) save(storageKey, unsaved.current);
    unsaved.current = null;
  }, [storageKey]);
  // the last strokes are kept even when the board closes during the short save delay
  useEffect(() => flush, [flush]);

  // Sends the shapes whose version the others don't have yet, and pictures they lack.
  const sendChanges = useCallback((everything = false) => {
    const instance = api.current;
    const connection = connectionRef.current;
    if (!connection || !instance) return;
    const elements = instance.getSceneElementsIncludingDeleted();
    const changed = everything
      ? elements
      : elements.filter((element) => (shared.current.get(element.id) ?? -1) < element.version);
    if (changed.length) {
      for (const element of changed) shared.current.set(element.id, element.version);
      connection.send('elements', { elements: changed });
    }
    const files = Object.values(instance.getFiles()).filter(
      (file) =>
        (everything || !sentFiles.current.has(file.id)) && file.dataURL.length < MAX_SHARED_FILE
    );
    for (const file of files) sentFiles.current.add(file.id);
    if (files.length) connection.send('files', { files });
  }, []);

  const serverUrl = server?.url ?? '';
  const serverKey = server?.key ?? '';
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const sharedVersions = shared.current;
    const knownFiles = sentFiles.current;
    const pointers = collaborators.current;

    const attach = (connection: BoardConnection | null) => {
      if (!connection) return;
      if (signal.aborted) {
        connection.close();
        return;
      }
      connectionRef.current = connection;
      connection.on('elements', (payload) => {
        const instance = api.current;
        if (!instance) return;
        // shapes from the others, in Excalidraw's own format, the malformed ones left out
        const shared = asSharedElements(payload.elements);
        if (!shared.length) return;
        // checked for what reconcileElements reads (id, type, version) on the line above
        const remote = shared as unknown as RemoteElements;
        for (const element of remote)
          sharedVersions.set(
            element.id,
            Math.max(sharedVersions.get(element.id) ?? -1, element.version)
          );
        instance.updateScene({
          elements: reconcileElements(
            instance.getSceneElementsIncludingDeleted(),
            remote,
            instance.getAppState()
          ),
          // someone else's strokes don't go on this person's undo stack
          captureUpdate: CaptureUpdateAction.NEVER,
        });
      });
      connection.on('files', (payload) => {
        const files = asSharedFiles(payload.files);
        if (!files.length) return;
        for (const file of files) knownFiles.add(file.id);
        api.current?.addFiles(files);
      });
      // a newcomer gets the whole board
      connection.on('hello', () => sendChanges(true));
      connection.on('pointer', (payload) => {
        const instance = api.current;
        const sender = typeof payload.from === 'string' ? payload.from : '';
        if (!instance || !sender) return;
        // a socket id is any non-empty text, which the check above proves
        const from = sender as SocketId;
        pointers.set(from, {
          pointer: asPointer(payload.pointer),
          button: asPointerButton(payload.button),
          username: String(payload.name ?? ''),
          id: from,
        });
        instance.updateScene({ collaborators: new Map(pointers) });
      });
      connection.onPeers((peers) => {
        if (signal.aborted) return;
        onPeers(peers);
        // the pointers of people who left disappear
        const here = new Set<string>(peers.map((peer) => peer.id));
        for (const id of pointers.keys()) if (!here.has(id)) pointers.delete(id);
        api.current?.updateScene({ collaborators: new Map(pointers) });
      });
      connection.onStatus((status) => {
        if (!signal.aborted && status === 'live') connection.send('hello', {});
      });
      connection.start();
    };

    const stop = () => {
      window.clearTimeout(sendTimer.current);
      sendTimer.current = undefined;
      const connection = connectionRef.current;
      connectionRef.current = null;
      connection?.close();
      sharedVersions.clear();
      knownFiles.clear();
      pointers.clear();
    };

    void connectBoard(serverUrl ? { url: serverUrl, key: serverKey } : null, room, name, signal)
      .then(attach)
      .catch(() => {
        if (signal.aborted) return;
        stop();
        onPeers([]);
      });

    return () => {
      controller.abort();
      stop();
    };
  }, [serverUrl, serverKey, room, name, sendChanges, onPeers]);

  return (
    <Excalidraw
      langCode={LANG_CODES[language]}
      theme={dark ? 'dark' : 'light'}
      isCollaborating={!!connectionRef.current}
      initialData={
        initial.current
          ? {
              // shapes and pictures checked by asSavedBoard, in Excalidraw's own format
              elements: initial.current.elements as never,
              files: initial.current.files as never,
              scrollToContent: true,
            }
          : null
      }
      UIOptions={{ canvasActions: { loadScene: false, saveToActiveFile: false } }}
      excalidrawAPI={(instance: ExcalidrawImperativeAPI) => {
        api.current = instance;
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
            // every shape is marked deleted with a new version, so the others' boards clear too
            const cleared = instance.getSceneElementsIncludingDeleted().map((element) => ({
              ...element,
              isDeleted: true,
              version: element.version + 1,
              versionNonce: Math.floor(Math.random() * 2 ** 31),
              updated: Date.now(),
            }));
            instance.updateScene({
              elements: cleared,
              captureUpdate: CaptureUpdateAction.IMMEDIATELY,
            });
          },
        });
      }}
      onPointerUpdate={({ pointer, button }) => {
        const now = Date.now();
        const connection = connectionRef.current;
        if (!connection || now - lastPointer.current < POINTER_EVERY) return;
        lastPointer.current = now;
        connection.send('pointer', { pointer, button, name });
      }}
      onChange={(elements, _appState, files: BinaryFiles) => {
        // pictures pasted on the board can be large; storage may refuse them, the drawing stays
        unsaved.current = { elements: elements.filter((element) => !element.isDeleted), files };
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(flush, SAVE_AFTER);
        if (!connectionRef.current || sendTimer.current) return;
        sendTimer.current = window.setTimeout(() => {
          sendTimer.current = undefined;
          sendChanges();
        }, SEND_EVERY);
      }}
    />
  );
};

export default BoardCanvas;
