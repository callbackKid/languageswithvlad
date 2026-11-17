import { type MouseEvent, useSyncExternalStore } from 'react';

/* A tiny router on top of the browser's History API: the path is the state, links push a new
   entry, Back and Forward pop one. The query string (?doc=…) is kept on every navigation. */

const CHANGE_EVENT = 'cahier:navigate';

function subscribe(listener: () => void) {
  window.addEventListener('popstate', listener);
  window.addEventListener(CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener('popstate', listener);
    window.removeEventListener(CHANGE_EVENT, listener);
  };
}

/** The current path, e.g. "/lessons/2026-11-12_7"; re-renders when it changes. */
export function usePath(): string {
  return useSyncExternalStore(subscribe, () => window.location.pathname);
}

/** The href for a path, keeping ?doc=… so a copied link still opens the same document. A #part
    (the Tutorial's cards) goes after the query, where the browser expects it. */
export function hrefFor(path: string) {
  const [pathname = '', part] = path.split('#');
  return pathname + window.location.search + (part ? '#' + part : '');
}

/** Goes to a path inside the app; replace swaps the current history entry instead of adding one.
    A path with a #part keeps it, and the page it opens scrolls to that part itself. */
export function navigate(path: string, { replace = false } = {}) {
  const part = path.split('#')[1];
  if (path === window.location.pathname) return;
  const url = hrefFor(path);
  if (replace) window.history.replaceState(null, '', url);
  else window.history.pushState(null, '', url);
  if (!part) window.scrollTo(0, 0);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Click handler for app links: plain clicks navigate in place, Cmd/Ctrl/Shift/middle clicks open a new tab as usual. */
export function followLink(event: MouseEvent<HTMLAnchorElement>, path: string) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    return;
  event.preventDefault();
  navigate(path);
}
