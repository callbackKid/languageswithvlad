/* Live sharing of the lesson board between the teacher and the student.
   Changes travel as broadcast messages through Supabase Realtime (nothing is stored there);
   every device keeps its own copy, and Excalidraw's reconcileElements merges the two, so
   drawing at the same time never overwrites the other person's strokes.

   Messages on a room:
   - "elements": the shapes that changed (new version numbers), including deleted ones;
   - "hello":    someone just joined; whoever is there answers with "elements" for the whole board;
   - "files":    pictures pasted on the board, sent once each;
   - "pointer":  where someone's pointer is, to draw it with their name.
   Who is on the board comes from presence. */

import type { RealtimeChannel } from '@supabase/supabase-js';

// Where the board is shared: the Supabase project, from /api/health.
export interface BoardServer {
  url: string;
  // the project's public (anon / publishable) key; it is meant to be in the browser
  key: string;
}

export type BoardEvent = 'elements' | 'hello' | 'files' | 'pointer';
export interface BoardPeer {
  id: string;
  name: string;
}

// What the board needs from a connection, whichever service carries it.
export interface BoardConnection {
  // this device's id in the room
  id: string;
  send: (event: BoardEvent, payload: Record<string, unknown>) => void;
  on: (event: BoardEvent, handler: (payload: Record<string, unknown>) => void) => void;
  // called with everyone in the room, this device included, whenever someone comes or goes
  onPeers: (handler: (peers: BoardPeer[]) => void) => void;
  // called once the room is joined, and when the connection drops
  onStatus: (handler: (status: 'live' | 'offline') => void) => void;
  // joins the room; call it once every handler above is in place
  start: () => void;
  close: () => void;
}

const randomId = () => Math.random().toString(36).slice(2, 10);

export const loadBoardSharing = () => import('@supabase/supabase-js');

// A room on Supabase Realtime: works between any two devices.
const supabaseConnection = (
  createClient: Awaited<ReturnType<typeof loadBoardSharing>>['createClient'],
  server: BoardServer,
  room: string,
  name: string
): BoardConnection => {
  const id = randomId();
  const client = createClient(server.url, server.key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const channel: RealtimeChannel = client.channel(room, {
    config: { broadcast: { self: false }, presence: { key: id } },
  });
  let peersHandler: (peers: BoardPeer[]) => void = () => undefined;
  let statusHandler: (status: 'live' | 'offline') => void = () => undefined;
  channel.on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState<{ name: string }>();
    peersHandler(
      Object.entries(state).map(([peerId, entries]) => ({
        id: peerId,
        name: entries[0]?.name ?? '',
      }))
    );
  });
  return {
    id,
    send: (event, payload) =>
      void channel.send({ type: 'broadcast', event, payload: { ...payload, from: id } }),
    on: (event, handler) => {
      channel.on('broadcast', { event }, (message) =>
        handler((message.payload ?? {}) as Record<string, unknown>)
      );
    },
    onPeers: (handler) => {
      peersHandler = handler;
    },
    onStatus: (handler) => {
      statusHandler = handler;
    },
    start: () =>
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          void channel.track({ name });
          statusHandler('live');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT')
          statusHandler('offline');
      }),
    close: () => {
      void client.removeChannel(channel);
    },
  };
};

// Tabs of one browser, for trying the board during development without Supabase.
const localConnection = (room: string, name: string): BoardConnection => {
  const id = randomId();
  const channel = new BroadcastChannel('cahier-board:' + room);
  const handlers = new Map<BoardEvent | 'presence', (payload: Record<string, unknown>) => void>();
  const peers = new Map<string, string>([[id, name]]);
  let peersHandler: (peers: BoardPeer[]) => void = () => undefined;
  let statusHandler: (status: 'live' | 'offline') => void = () => undefined;
  const announcePeers = () =>
    peersHandler([...peers].map(([peerId, peerName]) => ({ id: peerId, name: peerName })));
  channel.onmessage = (
    message: MessageEvent<{ event: string; payload: Record<string, unknown> }>
  ) => {
    const { event, payload } = message.data;
    if (event === 'presence') {
      const known = peers.has(String(payload.from));
      if (payload.leaving) peers.delete(String(payload.from));
      else peers.set(String(payload.from), String(payload.name ?? ''));
      // answer a newcomer, so both sides know about each other
      if (!known && !payload.leaving)
        channel.postMessage({ event: 'presence', payload: { from: id, name } });
      announcePeers();
      return;
    }
    handlers.get(event as BoardEvent)?.(payload);
  };
  // a closed tab says goodbye too, so it leaves the others' list of people
  const leave = () =>
    channel.postMessage({ event: 'presence', payload: { from: id, leaving: true } });
  window.addEventListener('pagehide', leave);
  return {
    id,
    send: (event, payload) => channel.postMessage({ event, payload: { ...payload, from: id } }),
    on: (event, handler) => {
      handlers.set(event, handler);
    },
    onPeers: (handler) => {
      peersHandler = handler;
    },
    onStatus: (handler) => {
      statusHandler = handler;
    },
    start: () => {
      announcePeers();
      statusHandler('live');
      channel.postMessage({ event: 'presence', payload: { from: id, name } });
    },
    close: () => {
      window.removeEventListener('pagehide', leave);
      leave();
      channel.close();
    },
  };
};

// Opens a board room: through Supabase when it's set up, between tabs in development, or null.
export const connectBoard = async (
  server: BoardServer | null,
  room: string,
  name: string,
  signal: AbortSignal
): Promise<BoardConnection | null> => {
  if (server) {
    const { createClient } = await loadBoardSharing();
    return signal.aborted ? null : supabaseConnection(createClient, server, room, name);
  }
  if (import.meta.env.DEV && typeof BroadcastChannel !== 'undefined')
    return localConnection(room, name);
  return null;
};
