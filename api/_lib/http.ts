import { timingSafeEqual } from 'node:crypto';

import type { VercelRequest, VercelResponse } from '@vercel/node';

import { LEARN_LANGUAGES, type LearnLanguage } from './prompts.js';

/* What every endpoint shares: the class-code check, the method check, reading request fields
   safely, and turning errors into answers. */

/** An error with the HTTP status to answer with. The message goes to the app: either a code
    it translates ("not_shared", "notion_token") or a sentence it shows as it is. */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

/** Compares in constant time, so the answer's timing doesn't leak how much of a guess was right. */
function sameSecret(given: string, expected: string): boolean {
  const givenBytes = Buffer.from(given);
  const expectedBytes = Buffer.from(expected);
  return givenBytes.length === expectedBytes.length && timingSafeEqual(givenBytes, expectedBytes);
}

/** Rejects requests without the shared access code (when one is configured). */
export function checkAccess(request: VercelRequest, response: VercelResponse): boolean {
  const code = process.env.APP_ACCESS_CODE;
  if (!code) return true;
  const given = request.headers['x-access-code'];
  if (typeof given === 'string' && sameSecret(given, code)) return true;
  response.status(401).json({ error: 'access_code' });
  return false;
}

/** True when the request carries the teacher code (APP_TEACHER_CODE), which unlocks the teacher's
    tools; without the variable nobody is a teacher. */
export function isTeacher(request: VercelRequest): boolean {
  const code = process.env.APP_TEACHER_CODE;
  const given = request.headers['x-teacher-code'];
  return !!code && typeof given === 'string' && sameSecret(given, code);
}

/** Rejects a request for a teacher's tool that doesn't carry the teacher code. */
export function checkTeacher(request: VercelRequest, response: VercelResponse): boolean {
  if (isTeacher(request)) return true;
  response.status(403).json({ error: 'teacher_code' });
  return false;
}

export function onlyPost(request: VercelRequest, response: VercelResponse): boolean {
  if (request.method === 'POST') return true;
  response.setHeader('Allow', 'POST');
  response.status(405).json({ error: 'method' });
  return false;
}

/** Answers with the error's own status and message when it is one of ours, 500 otherwise. */
export function fail(response: VercelResponse, error: unknown) {
  if (error instanceof HttpError)
    return response.status(error.status).json({ error: error.message });
  console.error(error);
  return response.status(500).json({ error: 'Something went wrong on the server.' });
}

/** A request field as trimmed text of at most maxLength characters; "" when it isn't a string. */
export const text = (value: unknown, maxLength: number): string =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

/** CEFR levels, with A0 for a complete beginner. Keep in step with LEVELS in src/lib/settings.ts. */
export const LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type Level = (typeof LEVELS)[number];
/** The level a request asks for, or null when it isn't one. */
export const asLevel = (value: unknown): Level | null => {
  const level = text(value, 2).toUpperCase();
  return LEVELS.includes(level as Level) ? (level as Level) : null;
};

// the level assumed for a language the request gives none for
const DEFAULT_LEVEL: Level = 'A2';
/** The learner's level in every language ({fr: "A1", de: "B1"…}), each checked, A2 when missing. */
export const asLevels = (value: unknown): Record<LearnLanguage, Level> => {
  const given = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return Object.fromEntries(
    LEARN_LANGUAGES.map((language) => [language, asLevel(given[language]) ?? DEFAULT_LEVEL])
  ) as Record<LearnLanguage, Level>;
};
