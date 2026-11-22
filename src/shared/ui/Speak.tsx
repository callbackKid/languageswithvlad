import { type Language } from '@/shared/config/languages';
import { useTranslation } from '@/shared/i18n/core';
import { common } from '@/shared/i18n/messages/common';
import { canSpeak, speak } from '@/shared/lib/speech';

// A small 🔊 button that reads the text aloud; hidden where the browser has no speech.
export default function Speak({ text, language = 'fr' }: { text: string; language?: Language }) {
  const { t } = useTranslation(common);
  if (!canSpeak) return null;
  return (
    <button
      type="button"
      className="speak"
      data-tooltip={t('listen')}
      aria-label={t('listenTo', { text })}
      onClick={(event) => {
        event.stopPropagation();
        speak(text, language);
      }}
    >
      🔊
    </button>
  );
}
