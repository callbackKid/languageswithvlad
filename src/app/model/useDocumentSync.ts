import { useCallback, useEffect, useRef, useState } from 'react';

import { docIdFrom } from '@/entities/lesson';
import { api, ApiError } from '@/shared/api';
import { app, translator } from '@/shared/i18n';
import { asFields, loadChecked, loadText, save } from '@/shared/lib/storage';

interface CachedDocument {
  title: string;
  text: string;
  fetchedAt: number;
}

type SyncStatus = { state: 'idle' | 'loading' | 'ok' } | { state: 'error'; message: string };

// The last successful read lets the selected document open offline.
const readCachedDocument = (id: string): CachedDocument | null =>
  loadChecked('doc:' + id, (raw) =>
    asFields(raw, { title: 'string', text: 'string', fetchedAt: 'number' })
  );

// A student link selects its document before the app renders.
export function initializeDocumentId(): string | null {
  const fromUrl = docIdFrom(new URLSearchParams(window.location.search).get('doc') || '');
  if (fromUrl) {
    save('doc', fromUrl);
    return fromUrl;
  }
  return loadText('doc');
}

/** Keeps the document cache and the visible sync status together. A quiet refresh waits for any
    active read to finish before the next interval, so it cannot interrupt a visible refresh. */
export function useDocumentSync(initialId: string | null) {
  const [docId, setDocId] = useState(initialId);
  const [doc, setDoc] = useState(() => (initialId ? readCachedDocument(initialId) : null));
  const [sync, setSync] = useState<SyncStatus>({ state: 'idle' });
  // Update the selection in the event handler so a request can start before React renders it.
  const selectedId = useRef(initialId);
  const pending = useRef<AbortController | null>(null);

  const syncDocument = useCallback(async (quiet = false) => {
    const id = selectedId.current;
    if (!id || (quiet && pending.current)) return;
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    if (!quiet) setSync({ state: 'loading' });
    try {
      const fetched = await api.doc(id, controller.signal);
      if (controller.signal.aborted) return;
      const next = { title: fetched.title, text: fetched.text, fetchedAt: Date.now() };
      save('doc:' + id, next);
      setDoc(next);
      setSync({ state: 'ok' });
    } catch (error) {
      if (controller.signal.aborted || quiet) return;
      setSync({
        state: 'error',
        message: error instanceof ApiError ? error.message : translator(app).t('readFailed'),
      });
    } finally {
      if (pending.current === controller) pending.current = null;
    }
  }, []);

  useEffect(() => {
    void syncDocument();
    return () => pending.current?.abort();
  }, [syncDocument]);

  function selectDocument(id: string) {
    if (selectedId.current !== id) {
      selectedId.current = id;
      setDocId(id);
      setDoc(readCachedDocument(id));
    }
    save('doc', id);
    void syncDocument();
  }

  return { docId, doc, sync, selectDocument, syncDocument };
}
