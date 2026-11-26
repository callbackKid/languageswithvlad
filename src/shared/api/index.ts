import {
  getSettings,
  getTeacherCode,
  type Language,
  translationFields,
  translationLanguage,
  type VerbLanguage,
} from '@/shared/config';
import { common, getUiLanguage, translator, type UiLanguage } from '@/shared/i18n';
import { type ImagePayload } from '@/shared/lib/image';
import { loadText } from '@/shared/lib/storage';

import { type BoardServer } from './boardSync';

export * from './boardSync';

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
  const code = loadText('code');
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
  // An abandoned document read must not dispatch an access-code error for the new selection.
  init?.signal?.throwIfAborted();
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
/** Identical analyses already on their way share one request (the lesson page and the word bank
    can ask for the same lesson at once; React's dev mode runs effects twice). The translation
    language is part of the key: an answer in Russian never stands in for one in English. Claude
    finds out the lesson's language itself, so it gets the fallback for a lesson in translateTo. */
const inflight = new Map<string, Promise<unknown>>();
function analyzeOnce(body: string, fresh: boolean): Promise<unknown> {
  const { levels, translateTo } = getSettings();
  const cacheKey = `${fresh ? 1 : 0}:${translateTo}:${body}`;
  let pending = inflight.get(cacheKey);
  if (!pending) {
    pending = request<unknown>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        body,
        fresh,
        levels,
        ...translationFields(translateTo),
      }),
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

// The parts of a book page a lesson can take; keep in step with BOOK_PARTS in api/_lib/prompts.ts.
export const BOOK_PARTS = ['exercises', 'text', 'grammar'] as const;
export type BookPart = (typeof BOOK_PARTS)[number];

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
  doc: (id: string, signal?: AbortSignal) =>
    request<{ title: string; text: string }>(`/api/doc?id=${encodeURIComponent(id)}`, { signal }),
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
  // the pronunciation points of a lesson, explained in the interface language
  lessonPhonetics: (body: string, explainIn: string) =>
    request<unknown>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ action: 'phonetics', body, explainIn, levels: getSettings().levels }),
    }),
  // choice questions on one pronunciation point
  phoneticsPractice: (options: {
    language: Language;
    level: string;
    title: string;
    summary: string;
    explainIn: string;
  }) =>
    request<unknown>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ action: 'phonetics-practice', ...options }),
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
      body: JSON.stringify({
        action: 'practice',
        ...options,
        translateTo: translationLanguage(options.language),
      }),
    }),
  // exercises from the student's book, from photos or from PDF pages, copied out as text
  // book pages copied out for a lesson: the parts asked for, never their answers
  bookExercises: (pages: { images: ImagePayload[] } | { data: string }, parts: BookPart[]) =>
    request<unknown>('/api/paper', {
      method: 'POST',
      body: JSON.stringify({ kind: 'exercises', parts, ...pages }),
    }),
  // ru is the verb's translation in translateTo, the language the tables are translated into
  conjugate: (
    infinitive: string,
    ru: string,
    language: VerbLanguage,
    translateTo: UiLanguage,
    fresh = false
  ) =>
    request<unknown>('/api/conjugate', {
      method: 'POST',
      body: JSON.stringify({ inf: infinitive, ru, language, translateTo, fresh }),
    }),
  photo: (image: ImagePayload) =>
    request<unknown>('/api/paper', {
      method: 'POST',
      body: JSON.stringify({
        kind: 'underlined',
        images: [image],
        levels: getSettings().levels,
        ...translationFields(),
      }),
    }),
  discussion: (options: {
    language: Language;
    level: string;
    topic: string;
    grammar: string;
    explainIn: string;
  }) =>
    request<unknown>('/api/discussion', {
      method: 'POST',
      body: JSON.stringify({ ...options, translateTo: translationLanguage(options.language) }),
    }),
  textbook: (data: string) =>
    request<unknown>('/api/paper', {
      method: 'POST',
      body: JSON.stringify({
        kind: 'textbook',
        data,
        levels: getSettings().levels,
        ...translationFields(),
      }),
    }),
  transcribe: (images: ImagePayload[]) =>
    request<unknown>('/api/paper', {
      method: 'POST',
      body: JSON.stringify({ kind: 'handwritten', images }),
    }),
  // an exercise made in lesson mode
  exercise: (options: {
    language: Language;
    level: string;
    grammar: string;
    words: string[];
    count: number;
  }) =>
    request<unknown>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        action: 'exercise',
        ...options,
        translateTo: translationLanguage(options.language),
        // the title is shown among the interface's texts
        explainIn: getUiLanguage(),
      }),
    }),
  /** a word or phrase selected anywhere in the app: explained in its sentence, defined, with
      examples, in translation (already resolved for its language; the card is saved under it) */
  word: (selection: string, context: string, translation: UiLanguage) =>
    request<unknown>('/api/text', {
      method: 'POST',
      body: JSON.stringify({
        action: 'word',
        selection,
        context,
        levels: getSettings().levels,
        ...translationFields(translation),
      }),
    }),
  // a pasted text translated, paragraph by paragraph
  translate: (text: string) =>
    request<unknown>('/api/text', {
      method: 'POST',
      body: JSON.stringify({ action: 'translate', text, ...translationFields() }),
    }),
  // vocabulary, questions and true-or-false statements built from a pasted text
  study: (text: string, levels: Record<Language, string>) =>
    request<unknown>('/api/text', {
      method: 'POST',
      body: JSON.stringify({ action: 'study', text, levels, ...translationFields() }),
    }),
  /** homework for the next lesson, made by Claude from a lesson's words and grammar; its
      sentences to translate are in translateTo (Make homework's own choice) */
  makeHomework: ({
    translateTo,
    ...input
  }: {
    body: string;
    keyWords: string[];
    level: string;
    sentences: number;
    translateTo: UiLanguage;
  }) =>
    request<unknown>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ action: 'homework', ...input, ...translationFields(translateTo) }),
    }),
  // a written homework answer, its mistakes fixed and explained in the interface language
  checkWriting: (input: { task: string; text: string; level: string; explainIn: string }) =>
    request<unknown>('/api/text', {
      method: 'POST',
      body: JSON.stringify({ action: 'correct', ...input }),
    }),
  // words sorted into groups by meaning, named in the interface language; known: the names in use
  wordGroups: (words: { fr: string; ru: string }[], known: string[], explainIn: string) =>
    request<unknown>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ action: 'groups', words, known, explainIn }),
    }),
  gaps: (words: { fr: string; ru: string }[], language: Language, level: string) =>
    request<unknown>('/api/gaps', {
      method: 'POST',
      body: JSON.stringify({ words, language, level, translateTo: translationLanguage(language) }),
    }),
  // a definition of each word in its own language, for the blitz
  definitions: (words: { fr: string; ru: string }[], language: Language, level: string) =>
    request<unknown>('/api/gaps', {
      method: 'POST',
      body: JSON.stringify({
        action: 'definitions',
        words,
        language,
        level,
        translateTo: translationLanguage(language),
      }),
    }),
};
