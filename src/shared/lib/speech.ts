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
function playEvenWhenSilenced() {
  if (navigator.audioSession && navigator.audioSession.type !== 'playback')
    navigator.audioSession.type = 'playback';
}

// Settings → speech speed. Far apart on purpose: the browsers' voices change speed less than the
// number says, and 0.9 against 0.65 was hard to tell apart.
const RATES: Record<SpeechSpeed, number> = { normal: 1, slow: 0.55 };

// The browser's voice for a language, if it has one.
function voiceFor(language: UiLanguage): SpeechSynthesisVoice | undefined {
  const locale = LOCALES[language];
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((candidate) => candidate.lang === locale) ||
    voices.find((candidate) => candidate.lang.startsWith(language))
  );
}

// The text as an utterance in the language's voice at the speed from Settings; null when empty.
function utteranceFor(text: string, language: UiLanguage): SpeechSynthesisUtterance | null {
  if (!canSpeak) return null;
  const spoken = forSpeech(text);
  if (!spoken) return null;
  const utterance = new SpeechSynthesisUtterance(spoken);
  utterance.lang = LOCALES[language];
  utterance.rate = RATES[getSettings().speechSpeed];
  const voice = voiceFor(language);
  if (voice) utterance.voice = voice;
  return utterance;
}

// Reads text aloud in the browser's own voice for the language; nothing is sent to a server.
export function speak(text: string, language: UiLanguage = 'fr') {
  const utterance = utteranceFor(text, language);
  if (!utterance) return;
  playEvenWhenSilenced();
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

/** Whether the browser can read the language. True while its list of voices is still empty
    (Chrome fills it a moment after the page opens): it is then worth trying. */
export function hasVoice(language: UiLanguage): boolean {
  if (!canSpeak) return false;
  return !window.speechSynthesis.getVoices().length || voiceFor(language) !== undefined;
}

// the utterance being read, kept so the browser doesn't drop it (Chrome then never says it ended)
let reading: SpeechSynthesisUtterance | null = null;
// a read that never reports its end still finishes after this long per letter, and at least this
const MS_PER_LETTER = 120;
const MIN_READ_MS = 1500;

/** Reads text aloud and resolves when the voice has finished, or was stopped. Resolves at once
    when there is nothing to read or no voice for the language (the text is then only shown). */
export function speakAndWait(text: string, language: UiLanguage): Promise<void> {
  const utterance = utteranceFor(text, language);
  if (!utterance || !hasVoice(language)) return Promise.resolve();
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
    window.speechSynthesis.speak(utterance);
  });
}

/** A silent utterance on the tap that starts a read-through: iPhone Safari speaks from a timer
    only after the page has spoken once in answer to a tap. */
export function unlockSpeech() {
  if (!canSpeak) return;
  playEvenWhenSilenced();
  const silent = new SpeechSynthesisUtterance(' ');
  silent.volume = 0;
  window.speechSynthesis.speak(silent);
}

/** Stops whatever is being read aloud: on leaving a page and when the tab is hidden, so no word
    goes on playing over a page that has nothing to do with it. */
export function stopSpeaking() {
  if (canSpeak) window.speechSynthesis.cancel();
}

// "il/elle/on se lève" → "il se lève", "allé(e)s" → "allés": read one natural form, not the notation.
export function forSpeech(text: string): string {
  return text
    .replace(/(\p{L}+)(?:\/\p{L}+)+/gu, '$1')
    .replace(/\([^)]*\)/g, '')
    .replace(/(['’])\s+/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}
