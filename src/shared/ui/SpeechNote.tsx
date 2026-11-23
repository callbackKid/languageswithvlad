import { useSyncExternalStore } from 'react';

import { common, useTranslation } from '@/shared/i18n';
import {
  dismissSpeechProblem,
  getSpeechProblem,
  type SpeechProblem,
  subscribeSpeechProblem,
} from '@/shared/lib/speech';

/** The note over every page when the browser couldn't read aloud: what went wrong and how to
    fix it, so a 🔊 that stays silent isn't a mystery. Closed with ×; gone once a read works. */
export default function SpeechNote() {
  const { t, locale } = useTranslation(common);
  const problem = useSyncExternalStore(subscribeSpeechProblem, getSpeechProblem);
  if (!problem) return null;
  return (
    <div className="note warn speech-note" role="alert">
      <p>{describe(problem)}</p>
      <button
        type="button"
        className="btn ghost"
        aria-label={t('close')}
        data-tooltip={t('close')}
        onClick={dismissSpeechProblem}
      >
        ×
      </button>
    </div>
  );

  function describe(value: SpeechProblem): string {
    if (value.kind === 'noVoices') return t('speechNoVoices');
    if (value.kind === 'failed') return t('speechFailed', { error: value.error });
    const name = new Intl.DisplayNames([locale], { type: 'language' }).of(value.language);
    return t('speechNoVoice', { language: name ?? value.language });
  }
}
