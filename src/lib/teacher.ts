import { useSyncExternalStore } from 'react';

import { load, remove, save } from './storage';

/* Whether this device has the teacher's tools on. The teacher enters the teacher code
   (APP_TEACHER_CODE on the server) once in Settings and it is kept here. The server checks the
   code on every request for a teacher's tool, so this only decides what the screen shows. */

const KEY = 'teacherCode';

export interface TeacherState {
  /** the server has a teacher code set up, so Settings can offer to enter it */
  available: boolean;
  /** this device holds the right code */
  isTeacher: boolean;
}

const stored = load<unknown>(KEY);
let code: string | null = typeof stored === 'string' && stored ? stored : null;
// a saved code counts until the server says otherwise at start-up
let current: TeacherState = { available: false, isTeacher: !!code };
const listeners = new Set<() => void>();

function publish(next: TeacherState) {
  current = next;
  listeners.forEach((listener) => listener());
}

/** The code sent with every request, or null on a student's device. */
export const getTeacherCode = () => code;

/** Called with the server's answer at start-up: a saved code it no longer accepts is dropped. */
export function applyTeacherHealth(available: boolean, confirmed: boolean) {
  if (code && !confirmed) {
    code = null;
    remove(KEY);
  }
  publish({ available, isTeacher: !!code && confirmed });
}

/** Keeps a code the server has just confirmed. */
export function saveTeacherCode(confirmedCode: string) {
  code = confirmedCode;
  save(KEY, confirmedCode);
  publish({ ...current, isTeacher: true });
}

export function forgetTeacherCode() {
  code = null;
  remove(KEY);
  publish({ ...current, isTeacher: false });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
const getTeacherState = () => current;
export const useTeacher = () => useSyncExternalStore(subscribe, getTeacherState, getTeacherState);
