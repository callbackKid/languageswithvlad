import { useState } from 'react';

import { docIdFrom, sourceUrl } from '@/entities/lesson';
import { app, common, useTranslation } from '@/shared/i18n';
import { Button } from '@/shared/ui/controls';
import LanguagePicker from '@/shared/ui/LanguagePicker';

// The first screen: paste the link of the lesson document (a Google Doc or a Notion page).
export default function Connect({
  current,
  onConnect,
  onCancel,
}: {
  current: string | null;
  onConnect: (id: string) => void;
  onCancel?: () => void;
}) {
  const { t, rich } = useTranslation(app);
  const commonText = useTranslation(common);
  const [value, setValue] = useState(current ? sourceUrl(current) : '');
  const [error, setError] = useState('');
  return (
    <div className="connect">
      <div className="connect-language">
        <LanguagePicker />
      </div>
      <h1>{t('connectTitle')}</h1>
      <p>
        {rich(
          'connectIntro',
          {},
          {
            leçon: <span className="example">14.10.2026 1 Leçon</span>,
            lesson: <span className="example">14.10.2026 1 Lesson</span>,
          }
        )}
      </p>
      <p>{rich('connectShare', { b: (chunk) => <b>{chunk}</b> })}</p>
      <p className="hint">{t('connectNotion')}</p>
      {/* noValidate: a bare document id is fine too, and our message is clearer than the browser's */}
      <form
        className="field"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const id = docIdFrom(value);
          if (!id) {
            setError(commonText.t('badDocLink'));
            return;
          }
          onConnect(id);
        }}
      >
        <input
          type="url"
          inputMode="url"
          placeholder={t('docLinkPlaceholder')}
          aria-label={t('docLinkLabel')}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError('');
          }}
        />
        <Button variant="primary" className="big" type="submit">
          {t('loadLessons')}
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            {commonText.t('cancel')}
          </Button>
        )}
      </form>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
