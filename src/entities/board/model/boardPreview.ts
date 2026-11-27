import { loadChecked } from '@/shared/lib/storage';

import { asSavedBoard, type SavedBoard } from './boardPayload';

const DATABASE = 'cahier-fr-board-previews';
const STORE = 'previews';

export const getBoardRevision = async (scene: string): Promise<string | null> => {
  try {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(scene));
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join(
      ''
    );
  } catch {
    return null;
  }
};

const openPreviews = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const accessPreviews = async <T>(
  mode: IDBTransactionMode,
  access: (store: IDBObjectStore) => IDBRequest<T> | undefined
): Promise<T | undefined> => {
  try {
    const database = await openPreviews();
    try {
      return await new Promise<T | undefined>((resolve, reject) => {
        const transaction = database.transaction(STORE, mode);
        const request = access(transaction.objectStore(STORE));
        transaction.oncomplete = () => resolve(request?.result);
        transaction.onabort = () => reject(transaction.error);
      });
    } finally {
      database.close();
    }
  } catch {
    // The scene in localStorage remains usable when IndexedDB is blocked or full.
    return undefined;
  }
};

const previewKey = (key: string, dark: boolean) => [key, dark ? 'dark' : 'light'];

type Preview = { revision: string; image: Blob };

export const readBoardPreview = async (
  key: string,
  revision: string,
  dark: boolean
): Promise<Blob | null> => {
  const entry: Partial<Preview> | undefined = await accessPreviews('readonly', (store) =>
    store.get(previewKey(key, dark))
  );
  const image = entry?.image;
  return entry?.revision === revision &&
    image instanceof Blob &&
    image.size > 0 &&
    (image.type === 'image/png' || image.type === 'image/svg+xml')
    ? image
    : null;
};

export const writeBoardPreview = async (
  key: string,
  scene: string,
  revision: string,
  dark: boolean,
  image: Blob
) => {
  await accessPreviews('readwrite', (store) => {
    // A slower export can finish after a newer edit, including an edit in another tab.
    if (JSON.stringify(loadChecked(key, asSavedBoard)) !== scene) return;
    return store.put({ revision, image } satisfies Preview, previewKey(key, dark));
  });
};

export const updateBoardPreviews = async (
  key: string,
  scene: string,
  render: (board: SavedBoard, dark: boolean) => Promise<Blob>
) => {
  // Render the exact saved scene, even if the editor has changed while waiting for idle time.
  const board = asSavedBoard(JSON.parse(scene));
  if (!board) return;
  if (!board.elements.length) {
    for (const dark of [false, true]) {
      await accessPreviews('readwrite', (store) => {
        if (JSON.stringify(loadChecked(key, asSavedBoard)) !== scene) return;
        return store.delete(previewKey(key, dark));
      });
    }
    return;
  }
  const revision = await getBoardRevision(scene);
  if (!revision) return;
  for (const dark of [false, true]) {
    if (JSON.stringify(loadChecked(key, asSavedBoard)) !== scene) return;
    if (await readBoardPreview(key, revision, dark)) continue;
    try {
      await writeBoardPreview(key, scene, revision, dark, await render(board, dark));
    } catch {
      // My notes can still generate a preview from the saved drawing.
    }
  }
};
