import { asFields, asList, load, save } from './storage';
import type { Lesson } from './types';

/* Questions the student writes down for the next lesson ("почему здесь subjonctif?"). Kept on
   the device until they are added to the document under the newest lesson, as a block:

     ❓ Вопросы к уроку (Ana):
        почему здесь subjonctif?
        как сказать «соскучиться»?

   The first line starts with ❓ and the questions with spaces, so the lesson's analysis skips
   the block like the student's report (withoutReport in parse.ts). */

export const QUESTIONS_MARK = '❓';
const INDENT = '   ';

export interface Question {
  text: string;
  at: number;
}

const storageKey = (docId: string) => `questions:${docId}`;
// The questions kept on this device for a document, each one checked.
export const readQuestions = (docId: string): Question[] =>
  asList(load<unknown>(storageKey(docId)), (raw) =>
    asFields(raw, { text: 'string', at: 'number' })
  );
// Keeps the questions not yet added to the document.
export const saveQuestions = (docId: string, questions: Question[]) =>
  save(storageKey(docId), questions);

// The block added to the document; the heading line is in the interface language.
export function questionsBlock(heading: string, questions: Question[]): string {
  return [
    `${QUESTIONS_MARK} ${heading}`,
    ...questions.map((question) => INDENT + question.text.replace(/\s+/g, ' ').trim()),
  ].join('\n');
}

// The questions in a lesson's ❓ blocks, in order.
export function lessonQuestions(lesson: Lesson | null): string[] {
  if (!lesson) return [];
  const found: string[] = [];
  let inBlock = false;
  for (const line of lesson.body.split('\n')) {
    if (line.startsWith(QUESTIONS_MARK)) inBlock = true;
    else if (inBlock && /^\s+\S/.test(line)) found.push(line.trim());
    else inBlock = false;
  }
  return found;
}
