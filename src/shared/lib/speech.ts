import type { Language } from '@/shared/config/languages';
import { getSettings, type SpeechSpeed } from '@/shared/config/settings';

const LOCALES: Record<Language, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
  de: 'de-DE',
  es: 'es-ES',
  pt: 'pt-PT',
  it: 'it-IT',
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

// Reads text aloud in the browser's own voice for the language; nothing is sent to a server.
export function speak(text: string, language: Language = 'fr') {
  if (!canSpeak) return;
  const spoken = forSpeech(text);
  if (!spoken) return;
  const locale = LOCALES[language];
  const utterance = new SpeechSynthesisUtterance(spoken);
  utterance.lang = locale;
  utterance.rate = RATES[getSettings().speechSpeed];
  const voices = window.speechSynthesis.getVoices();
  const voice =
    voices.find((candidate) => candidate.lang === locale) ||
    voices.find((candidate) => candidate.lang.startsWith(language));
  if (voice) utterance.voice = voice;
  playEvenWhenSilenced();
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
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
