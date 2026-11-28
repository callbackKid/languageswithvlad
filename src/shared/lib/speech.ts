import { useSyncExternalStore } from 'react';

import { getSettings, type SpeechSpeed } from '@/shared/config';
import { type UiLanguage } from '@/shared/i18n';

// the learned languages and the translation languages (Russian too), for the browser's voices
const LOCALES: Record<UiLanguage, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
  de: 'de-DE',
  es: 'es-ES',
  pt: 'pt-PT',
  it: 'it-IT',
  ru: 'ru-RU',
};

export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

// Safari's Audio Session API (16.4 and later), not yet in TypeScript's DOM types.
declare global {
  interface Navigator {
    audioSession?: { type: string };
  }
}

/** On an iPhone the browser's voice counts as a ringer sound, so the silent switch mutes it while
    other apps still play: "playback" makes Safari treat the page as media, like those apps. It is
    set on the tap that asks for speech, as Safari wants. Other browsers don't have it. */
const playEvenWhenSilenced = () => {
  if (navigator.audioSession && navigator.audioSession.type !== 'playback')
    navigator.audioSession.type = 'playback';
};

// Settings → speech speed. Far apart on purpose: the browsers' voices change speed less than the
// number says, and 0.9 against 0.65 was hard to tell apart.
const RATES: Record<SpeechSpeed, number> = { normal: 1, slow: 0.55 };

const voiceLanguage = (locale: string) => locale.toLowerCase().split(/[-_]/)[0];

// The browser's voice for a language, if it has one.
const voiceFor = (language: UiLanguage): SpeechSynthesisVoice | undefined => {
  const locale = LOCALES[language];
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((candidate) => candidate.lang === locale) ||
    voices.find((candidate) => voiceLanguage(candidate.lang) === language)
  );
};

/** Why the browser couldn't read aloud, for the note that tells the student: it has no voices at
    all, none for the language, or the voice failed (error is the browser's code, or "silent" when
    the read never started). */
export type SpeechProblem =
  | { kind: 'noVoices' }
  | { kind: 'noVoice'; language: UiLanguage }
  | { kind: 'failed'; error: string };

let problem: SpeechProblem | null = null;
const problemListeners = new Set<() => void>();
// the problems the student closed: not shown again until the page is reloaded
const dismissed = new Set<string>();

const problemKey = (value: SpeechProblem) =>
  value.kind === 'noVoice' ? `noVoice:${value.language}` : value.kind;

const setProblem = (next: SpeechProblem | null) => {
  if (next && dismissed.has(problemKey(next))) return;
  // the same problem again (another tap on 🔊) keeps the note as it is
  if (JSON.stringify(next) === JSON.stringify(problem)) return;
  problem = next;
  problemListeners.forEach((listener) => listener());
};

// For useSyncExternalStore: the current problem, and a way to hear when it changes.
export const getSpeechProblem = () => problem;
export const subscribeSpeechProblem = (listener: () => void) => {
  problemListeners.add(listener);
  return () => {
    problemListeners.delete(listener);
  };
};

// The student closed the note: this problem stays quiet until the page is reloaded.
export const dismissSpeechProblem = () => {
  if (problem) dismissed.add(problemKey(problem));
  setProblem(null);
};

// Says so when the voices are known and none reads the language (Chrome fills the list late).
const checkVoice = (language: UiLanguage) => {
  if (window.speechSynthesis.getVoices().length && !voiceFor(language))
    setProblem({ kind: 'noVoice', language });
};

// Errors that only mean the read was stopped on purpose: by a new read, a page change or Stop.
const STOPPED_ERRORS = ['interrupted', 'canceled'];
// Errors the browser gives when it has no voice for the utterance's language.
const NO_VOICE_ERRORS = ['language-unavailable', 'voice-unavailable'];
// How long a read may take to start before it counts as silent: Chrome's online voices can need a
// second or two to load.
const START_TIMEOUT_MS = 5000;

// the utterance whose start is being waited for, and the timer that gives up on it
let watched: SpeechSynthesisUtterance | null = null;
let startTimer = 0;

const stopWatching = () => {
  window.clearTimeout(startTimer);
  watched = null;
};

/** Watches a read for the problems the student can't see: an error, or no start at all (no voices,
    or the browser's speech stuck). A read that starts clears a failure shown before. */
const watch = (utterance: SpeechSynthesisUtterance, language: UiLanguage) => {
  stopWatching();
  watched = utterance;
  startTimer = window.setTimeout(() => {
    if (watched !== utterance) return;
    watched = null;
    setProblem(
      window.speechSynthesis.getVoices().length
        ? { kind: 'failed', error: 'silent' }
        : { kind: 'noVoices' }
    );
  }, START_TIMEOUT_MS);
  const settle = () => {
    if (watched === utterance) stopWatching();
  };
  utterance.addEventListener('start', () => {
    settle();
    if (problem && problem.kind !== 'noVoice') setProblem(null);
  });
  utterance.addEventListener('end', settle);
  utterance.addEventListener('error', (event) => {
    settle();
    if (STOPPED_ERRORS.includes(event.error)) return;
    setProblem(
      NO_VOICE_ERRORS.includes(event.error)
        ? { kind: 'noVoice', language }
        : { kind: 'failed', error: event.error }
    );
  });
};

// The text as an utterance in the language's voice at the speed from Settings; null when empty.
const utteranceFor = (text: string, language: UiLanguage): SpeechSynthesisUtterance | null => {
  if (!canSpeak) return null;
  const spoken = forSpeech(text);
  if (!spoken) return null;
  const utterance = new SpeechSynthesisUtterance(spoken);
  utterance.lang = LOCALES[language];
  utterance.rate = RATES[getSettings().speechSpeed];
  const voice = voiceFor(language);
  if (voice) utterance.voice = voice;
  return utterance;
};

// Reads text aloud in the browser's own voice for the language; nothing is sent to a server.
export const speak = (text: string, language: UiLanguage = 'fr') => {
  const utterance = utteranceFor(text, language);
  if (!utterance) return;
  checkVoice(language);
  playEvenWhenSilenced();
  window.speechSynthesis.cancel();
  watch(utterance, language);
  window.speechSynthesis.speak(utterance);
};

/** Whether the browser can read the language. True while its list of voices is still empty
    (Chrome fills it a moment after the page opens): it is then worth trying. */
export const hasVoice = (language: UiLanguage): boolean => {
  if (!canSpeak) return false;
  return !window.speechSynthesis.getVoices().length || voiceFor(language) !== undefined;
};

// Exercises require an installed voice before they can depend on audio.
export const hasReadyVoice = (language: UiLanguage): boolean =>
  canSpeak && voiceFor(language) !== undefined;

const subscribeToVoices = (notify: () => void) => {
  if (!canSpeak) return () => undefined;
  window.speechSynthesis.addEventListener('voiceschanged', notify);
  return () => window.speechSynthesis.removeEventListener('voiceschanged', notify);
};
const voiceLanguages = () =>
  canSpeak
    ? window.speechSynthesis
        .getVoices()
        .map((voice) => voice.lang)
        .join(',')
    : '';

// Re-render controls when the browser loads or changes its voices.
export const useVoiceAvailability = () => {
  const voices = useSyncExternalStore(subscribeToVoices, voiceLanguages, () => '');
  const languages = new Set(voices.split(',').map(voiceLanguage));
  return (language: UiLanguage) => languages.has(language);
};

// the utterance being read, kept so the browser doesn't drop it (Chrome then never says it ended)
let reading: SpeechSynthesisUtterance | null = null;
// a read that never reports its end still finishes after this long per letter, and at least this
const MS_PER_LETTER = 120;
const MIN_READ_MS = 1500;

/** Reads text aloud and resolves when the voice has finished, or was stopped. Resolves at once
    when there is nothing to read or no voice for the language (the text is then only shown). */
export const speakAndWait = (text: string, language: UiLanguage): Promise<void> => {
  const utterance = utteranceFor(text, language);
  if (!utterance) return Promise.resolve();
  if (!hasVoice(language)) {
    checkVoice(language);
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    let timer = 0;
    const finish = () => {
      window.clearTimeout(timer);
      utterance.onend = null;
      utterance.onerror = null;
      if (reading === utterance) reading = null;
      resolve();
    };
    utterance.onend = finish;
    utterance.onerror = finish;
    timer = window.setTimeout(
      finish,
      Math.max(MIN_READ_MS, (utterance.text.length * MS_PER_LETTER) / utterance.rate)
    );
    reading = utterance;
    playEvenWhenSilenced();
    window.speechSynthesis.cancel();
    watch(utterance, language);
    window.speechSynthesis.speak(utterance);
  });
};

/** A silent utterance on the tap that starts a read-through: iPhone Safari speaks from a timer
    only after the page has spoken once in answer to a tap. */
export const unlockSpeech = () => {
  if (!canSpeak) return;
  playEvenWhenSilenced();
  const silent = new SpeechSynthesisUtterance(' ');
  silent.volume = 0;
  window.speechSynthesis.speak(silent);
};

/** Stops whatever is being read aloud: on leaving a page and when the tab is hidden, so no word
    goes on playing over a page that has nothing to do with it. */
export const stopSpeaking = () => {
  if (!canSpeak) return;
  stopWatching();
  window.speechSynthesis.cancel();
};

// "il/elle/on se lève" → "il se lève", "allé(e)s" → "allés": read one natural form, not the notation.
export const forSpeech = (text: string): string => {
  return text
    .replace(/(\p{L}+)(?:\/\p{L}+)+/gu, '$1')
    .replace(/\([^)]*\)/g, '')
    .replace(/(['’])\s+/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
};
