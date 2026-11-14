import { useState } from 'react';
import { useTranslation } from '../i18n/core';
import { app } from '../i18n/messages/app';
import { common } from '../i18n/messages/common';
import { docIdFrom } from '../lib/parse';
import LanguagePicker from './LanguagePicker';

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
  const [value, setValue] = useState(
    current ? `https://docs.google.com/document/d/${encodeURIComponent(current)}/edit` : ''
  );
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
        <button className="btn primary big" type="submit">
          {t('loadLessons')}
        </button>
        {onCancel && (
          <button className="btn ghost" type="button" onClick={onCancel}>
            {commonText.t('cancel')}
          </button>
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
