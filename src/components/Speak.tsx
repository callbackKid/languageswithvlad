import { canSpeak, speak } from '../lib/speech';
import type { Language } from '../lib/types';

/** A small 🔊 button that reads the text aloud; hidden where the browser has no speech. */
export default function Speak({ text, language = 'fr' }: { text: string; language?: Language }) {
  if (!canSpeak) return null;
  return (
    <button
      type="button"
      className="speak"
      title="Listen"
      aria-label={'Listen: ' + text}
      onClick={(event) => {
        event.stopPropagation();
        speak(text, language);
      }}
    >
      🔊
    </button>
  );
}
