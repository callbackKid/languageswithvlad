import { translator } from '../i18n/core';
import { common } from '../i18n/messages/common';
import type { BoardServer } from './boardSync';
import type { ImagePayload } from './image';
import { getSettings } from './settings';
import { load } from './storage';
import { getTeacherCode } from './teacher';
import type { Language, VerbLanguage } from './types';

export type FeedbackKind = 'bug' | 'idea' | 'other';
export interface FeedbackReport {
  kind: FeedbackKind;
  message: string;
  // how to reach the student: a name, Telegram or email; optional
  contact: string;
  images: ImagePayload[];
  // filled in by the app, so the teacher knows where it happened
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

// teacherCode replaces the saved one, to check a code before it is kept.
async function request<T>(path: string, init?: RequestInit, teacherCode?: string): Promise<T> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  const code = load<string>('code');
  if (code) headers['x-access-code'] = code;
  const teacher = teacherCode ?? getTeacherCode();
  if (teacher) headers['x-teacher-code'] = teacher;
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
    const fields = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
    const errorCode = typeof fields.error === 'string' ? fields.error : '';
    throw new ApiError(response.status, errorCode, messageFor(response.status, errorCode, fields));
  }
  return data as T;
}

type CommonKey = keyof (typeof common)['en'];
// The text in common.ts for each error code the server sends (api/), so every error the student
// sees is in the interface language.
const ERROR_TEXTS: Record<string, CommonKey> = {
  teacher_code: 'teacherOnly',
  not_shared: 'notShared',
  not_found: 'docNotFound',
  bad_id: 'badDocLink',
  unreachable: 'docUnreachable',
  delivery_failed: 'deliveryFailed',
  lesson_not_found: 'lessonNotFound',
  google_off: 'googleOff',
  google_key: 'googleKey',
  google_no_edit: 'googleNoEdit',
  google_unreachable: 'googleUnreachable',
  google_rejected: 'googleRejected',
  notion_off: 'notionOff',
  notion_token: 'notionToken',
  notion_not_shared: 'notionNotShared',
  notion_no_write: 'notionNoWrite',
  notion_unreachable: 'notionUnreachable',
  notion_validation: 'notionUnreachable',
  nothing_sent: 'nothingSent',
  bad_request: 'badRequest',
  method: 'badRequest',
  lesson_too_long: 'lessonTooLong',
  too_long: 'tooLong',
  not_pdf: 'notPdf',
  picture_type: 'pictureType',
  pictures_too_large: 'picturesTooLarge',
  too_many_pictures: 'tooManyPictures',
  zoom_off: 'zoomOff',
  bad_meeting_number: 'badMeetingNumber',
  jitsi_off: 'jitsiOff',
  bad_room: 'badRoom',
  feedback_off: 'feedbackOff',
  claude_off: 'claudeOff',
  claude_busy: 'busy',
  claude_unreadable: 'unreadable',
  claude_failed: 'somethingWrong',
  too_many: 'tooMany',
  server_error: 'somethingWrong',
};

/** The error in the interface language: by its code, or by the status for an answer without one
    (a timeout, a proxy). An English sentence from a server older than the app is shown as it is. */
function messageFor(status: number, errorCode: string, fields: Record<string, unknown>): string {
  const { t } = translator(common);
  if (status === 401) {
    window.dispatchEvent(new Event('cahier:need-code'));
    return t('enterCode');
  }
  const key = ERROR_TEXTS[errorCode];
  if (key)
    return t(key, {
      email: typeof fields.email === 'string' ? fields.email : '',
      count: Number(fields.count) || 0,
    });
  if (status === 429) return t('tooMany');
  if (status === 503) return t('busy');
  if (status === 502) return t('unreadable');
  if (status >= 500) return t('somethingWrong');
  return errorCode && errorCode.length > 3 && !/^[a-z_]+$/.test(errorCode)
    ? errorCode
    : t('somethingWrong');
}

// Prompts that only learn the language from what they read (a lesson, a photo, a text) get the
// student's level in every language, from Settings.
// Identical analyses already on their way share one request (the lesson page and the
// word bank can ask for the same lesson at once; React's dev mode runs effects twice).
const inflight = new Map<string, Promise<unknown>>();
function analyzeOnce(body: string, fresh: boolean): Promise<unknown> {
  const cacheKey = (fresh ? '1:' : '0:') + body;
  let pending = inflight.get(cacheKey);
  if (!pending) {
    pending = request<unknown>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ body, fresh, levels: getSettings().levels }),
    }).finally(() => inflight.delete(cacheKey));
    inflight.set(cacheKey, pending);
  }
  return pending;
}

interface Health {
  needsCode: boolean;
  // a teacher code is set up on the server
  teacherCode?: boolean;
  // the request carried the right teacher code
  teacher?: boolean;
  ai: boolean;
  docWriter?: string | null;
  feedback?: boolean;
  zoom?: boolean;
  // the JaaS AppID when Jitsi calls run inside the app
  jitsi?: string | null;
  notion?: boolean;
  board?: BoardServer | null;
}

export const api = {
  health: () => request<Health>('/api/health'),
  // whether the server accepts this teacher code
  checkTeacher: async (teacherCode: string) =>
    !!(await request<Health>('/api/health', undefined, teacherCode)).teacher,
  zoomSignature: (meetingNumber: string) =>
    request<{ signature: string }>('/api/call-token', {
      method: 'POST',
      body: JSON.stringify({ kind: 'zoom', meetingNumber }),
    }),
  // a token for one Jitsi room; the server makes the teacher its moderator
  jitsiToken: (room: string, name: string) =>
    request<{ token: string; roomName: string }>('/api/call-token', {
      method: 'POST',
      body: JSON.stringify({ kind: 'jitsi', room, name }),
    }),
  feedback: (report: FeedbackReport) =>
    request<{ ok: boolean }>('/api/feedback', { method: 'POST', body: JSON.stringify(report) }),
  // adds a new lesson at the end of the document, or, with a lesson key, lines under that lesson
  append: (docId: string, text: string, lesson?: string) =>
    request<{ ok: boolean }>('/api/append', {
      method: 'POST',
      body: JSON.stringify({ docId, text, lesson }),
    }),
  doc: (id: string) =>
    request<{ title: string; text: string }>(`/api/doc?id=${encodeURIComponent(id)}`),
  analyze: (body: string, fresh = false) => analyzeOnce(body, fresh),
  // the grammar, homework and book exercises of a lesson, explained in the interface language
  lessonExtras: (body: string, explainIn: string, fresh = false) =>
    request<unknown>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        action: 'extras',
        body,
        explainIn,
        fresh,
        levels: getSettings().levels,
      }),
    }),
  // gap sentences on one grammar point
  grammarPractice: (options: {
    language: Language;
    level: string;
    title: string;
    summary: string;
    explainIn: string;
  }) =>
    request<unknown>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ action: 'practice', ...options }),
    }),
  // exercises from the student's book, from photos or from PDF pages, copied out as text
  bookExercises: (pages: { images: ImagePayload[] } | { data: string }) =>
    request<unknown>('/api/paper', {
      method: 'POST',
      body: JSON.stringify({ kind: 'exercises', ...pages }),
    }),
  conjugate: (infinitive: string, ru: string, language: VerbLanguage, fresh = false) =>
    request<unknown>('/api/conjugate', {
      method: 'POST',
      body: JSON.stringify({ inf: infinitive, ru, language, fresh }),
    }),
  photo: (image: ImagePayload) =>
    request<unknown>('/api/paper', {
      method: 'POST',
      body: JSON.stringify({ kind: 'underlined', images: [image], levels: getSettings().levels }),
    }),
  discussion: (options: {
    language: Language;
    level: string;
    topic: string;
    grammar: string;
    explainIn: string;
  }) => request<unknown>('/api/discussion', { method: 'POST', body: JSON.stringify(options) }),
  textbook: (data: string) =>
    request<unknown>('/api/paper', {
      method: 'POST',
      body: JSON.stringify({ kind: 'textbook', data, levels: getSettings().levels }),
    }),
  transcribe: (images: ImagePayload[]) =>
    request<unknown>('/api/paper', {
      method: 'POST',
      body: JSON.stringify({ kind: 'handwritten', images }),
    }),
  // an exercise the teacher makes in lesson mode (teacher code)
  exercise: (options: {
    language: Language;
    level: string;
    grammar: string;
    words: string[];
    count: number;
  }) =>
    request<unknown>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ action: 'exercise', ...options }),
    }),
  // a word or phrase selected anywhere in the app: explained in its sentence, defined, with examples
  word: (selection: string, context: string) =>
    request<unknown>('/api/text', {
      method: 'POST',
      body: JSON.stringify({ action: 'word', selection, context, levels: getSettings().levels }),
    }),
  // a pasted text in Russian, paragraph by paragraph
  translate: (text: string) =>
    request<unknown>('/api/text', {
      method: 'POST',
      body: JSON.stringify({ action: 'translate', text }),
    }),
  // vocabulary, questions and true-or-false statements built from a pasted text
  study: (text: string, levels: Record<Language, string>) =>
    request<unknown>('/api/text', {
      method: 'POST',
      body: JSON.stringify({ action: 'study', text, levels }),
    }),
  // homework for the next lesson, made by Claude from a lesson's words and grammar
  makeHomework: (input: { body: string; keyWords: string[]; level: string; sentences: number }) =>
    request<unknown>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ action: 'homework', ...input }),
    }),
  // a written homework answer, its mistakes fixed and explained in the interface language
  checkWriting: (input: { task: string; text: string; level: string; explainIn: string }) =>
    request<unknown>('/api/text', {
      method: 'POST',
      body: JSON.stringify({ action: 'correct', ...input }),
    }),
  gaps: (words: { fr: string; ru: string }[], language: Language, level: string) =>
    request<unknown>('/api/gaps', {
      method: 'POST',
      body: JSON.stringify({ words, language, level }),
    }),
};
