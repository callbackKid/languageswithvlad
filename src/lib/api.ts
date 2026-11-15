import { translator } from '../i18n/core';
import { common } from '../i18n/messages/common';
import { load } from './storage';
import type { ImagePayload } from './image';
import type { Language } from './types';

export type FeedbackKind = 'bug' | 'idea' | 'other';
export interface FeedbackReport {
  kind: FeedbackKind;
  message: string;
  /** how to reach the student: a name, Telegram or email; optional */
  contact: string;
  images: ImagePayload[];
  /** filled in by the app, so the teacher knows where it happened */
  page: string;
  docTitle: string;
  browser: string;
  sentAt: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  const code = load<string>('code');
  if (code) headers['x-access-code'] = code;
  let response: Response;
  try {
    response = await fetch(path, { ...init, headers });
  } catch {
    throw new ApiError(0, 'offline', translator(common).t('offline'));
  }
  const data = await response.json().catch(() => null);
  // Vite alone (yarn dev) answers /api/* with index.html and a 200.
  if (response.ok && data === null)
    throw new ApiError(response.status, 'no_api', translator(common).t('noServer'));
  if (!response.ok) {
    const errorCode = (data as { error?: string } | null)?.error || '';
    throw new ApiError(response.status, errorCode, messageFor(response.status, errorCode));
  }
  return data as T;
}

/** The error in the interface language. Codes and common statuses are translated here; the
    rare input errors the server explains in its own words (in English) are shown as they are. */
function messageFor(status: number, errorCode: string): string {
  const { t } = translator(common);
  if (status === 401) {
    window.dispatchEvent(new Event('cahier:need-code'));
    return t('enterCode');
  }
  if (errorCode === 'not_shared') return t('notShared');
  if (errorCode === 'not_found') return t('docNotFound');
  if (errorCode === 'bad_id') return t('badDocLink');
  if (errorCode === 'unreachable') return t('docUnreachable');
  if (errorCode === 'delivery_failed') return t('deliveryFailed');
  if (errorCode === 'notion_off') return t('notionOff');
  if (errorCode === 'notion_token') return t('notionToken');
  if (errorCode === 'notion_not_shared') return t('notionNotShared');
  if (errorCode === 'notion_no_write') return t('notionNoWrite');
  if (errorCode === 'notion_unreachable' || errorCode === 'notion_validation')
    return t('notionUnreachable');
  if (status === 429) return t('tooMany');
  if (status === 503) return t('busy');
  if (status === 502) return t('unreadable');
  if (status >= 500) return t('somethingWrong');
  return errorCode && errorCode.length > 3 && !/^[a-z_]+$/.test(errorCode)
    ? errorCode
    : t('somethingWrong');
}

// Identical analyses already on their way share one request (the lesson page and the
// word bank can ask for the same lesson at once; React's dev mode runs effects twice).
const inflight = new Map<string, Promise<unknown>>();
function analyzeOnce(body: string, fresh: boolean): Promise<unknown> {
  const cacheKey = (fresh ? '1:' : '0:') + body;
  let pending = inflight.get(cacheKey);
  if (!pending) {
    pending = request<unknown>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ body, fresh }),
    }).finally(() => inflight.delete(cacheKey));
    inflight.set(cacheKey, pending);
  }
  return pending;
}

export const api = {
  health: () =>
    request<{
      needsCode: boolean;
      ai: boolean;
      docWriter?: string | null;
      feedback?: boolean;
      zoom?: boolean;
      notion?: boolean;
    }>('/api/health'),
  zoomSignature: (meetingNumber: string) =>
    request<{ signature: string }>('/api/zoom-signature', {
      method: 'POST',
      body: JSON.stringify({ meetingNumber }),
    }),
  feedback: (report: FeedbackReport) =>
    request<{ ok: boolean }>('/api/feedback', { method: 'POST', body: JSON.stringify(report) }),
  append: (docId: string, text: string) =>
    request<{ ok: boolean }>('/api/append', {
      method: 'POST',
      body: JSON.stringify({ docId, text }),
    }),
  doc: (id: string) =>
    request<{ title: string; text: string }>(`/api/doc?id=${encodeURIComponent(id)}`),
  analyze: (body: string, fresh = false) => analyzeOnce(body, fresh),
  conjugate: (infinitive: string, ru: string, fresh = false) =>
    request<unknown>('/api/conjugate', {
      method: 'POST',
      body: JSON.stringify({ inf: infinitive, ru, fresh }),
    }),
  photo: (image: ImagePayload) =>
    request<unknown>('/api/photo', { method: 'POST', body: JSON.stringify({ images: [image] }) }),
  discussion: (options: { language: Language; level: string; topic: string; grammar: string }) =>
    request<unknown>('/api/discussion', { method: 'POST', body: JSON.stringify(options) }),
  textbook: (data: string) =>
    request<unknown>('/api/textbook', { method: 'POST', body: JSON.stringify({ data }) }),
  transcribe: (images: ImagePayload[]) =>
    request<unknown>('/api/transcribe', { method: 'POST', body: JSON.stringify({ images }) }),
  gaps: (words: { fr: string; ru: string }[], language: Language) =>
    request<unknown>('/api/gaps', { method: 'POST', body: JSON.stringify({ words, language }) }),
};
