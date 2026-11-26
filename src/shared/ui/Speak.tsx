import { type Language } from '@/shared/config';
import { common, useTranslation } from '@/shared/i18n';
import { canSpeak, speak } from '@/shared/lib/speech';

import { IconButton } from './controls';

/** A small 🔊 button that reads the text aloud; hidden where the browser has no speech. label
    replaces "Listen: {text}" for a screen reader where the text must stay hidden (an answer). */
const Speak = ({
  text,
  language = 'fr',
  label,
}: {
  text: string;
  language?: Language;
  label?: string;
}) => {
  const { t } = useTranslation(common);
  if (!canSpeak) return null;
  return (
    <IconButton
      className="speak"
      tooltip={t('listen')}
      label={label ?? t('listenTo', { text })}
      onClick={(event) => {
        event.stopPropagation();
        speak(text, language);
      }}
    >
      🔊
    </IconButton>
  );
};

export default Speak;
