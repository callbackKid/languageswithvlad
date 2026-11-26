import { useState } from 'react';

import { app, useTranslation } from '@/shared/i18n';
import { Button } from '@/shared/ui/controls';
import LanguagePicker from '@/shared/ui/LanguagePicker';

// Asks for the class code once, when the server wants one (APP_ACCESS_CODE).
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
        <Button variant="primary" className="big" type="submit" disabled={!code.trim()}>
          {t('codeContinue')}
        </Button>
      </form>
    </div>
  );
}
