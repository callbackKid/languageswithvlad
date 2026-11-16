import { useState } from 'react';

import { useTranslation } from '../i18n/core';
import { app } from '../i18n/messages/app';
import LanguagePicker from './LanguagePicker';

export default function CodeGate({
  onDone,
  onClear,
}: {
  onDone: (code: string) => void;
  onClear: () => void;
}) {
  const { t } = useTranslation(app);
  const [code, setCode] = useState('');
  return (
    <div className="connect">
      <div className="connect-language">
        <LanguagePicker />
      </div>
      <h1>{t('codeTitle')}</h1>
      <p>{t('codeIntro')}</p>
      <form
        className="field"
        onSubmit={(event) => {
          event.preventDefault();
          if (code.trim()) {
            onClear();
            onDone(code.trim());
          }
        }}
      >
        <input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder={t('codeTitle')}
          aria-label={t('codeTitle')}
          autoComplete="off"
          autoFocus
        />
        <button className="btn primary big" type="submit" disabled={!code.trim()}>
          {t('codeContinue')}
        </button>
      </form>
    </div>
  );
}
