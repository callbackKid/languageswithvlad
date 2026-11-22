import { useState } from 'react';

import { api } from '@/shared/api';
import { forgetTeacherCode, saveTeacherCode, useTeacher } from '@/shared/config/teacher';
import { useTranslation } from '@/shared/i18n/core';
import { common } from '@/shared/i18n/messages/common';
import { settingsText } from '@/shared/i18n/messages/settings';

/** The Settings card where the teacher turns the teacher's tools on, with the teacher code.
    Shown only when the server has a teacher code set up. */
export default function TeacherCard() {
  const { t } = useTranslation(settingsText);
  const commonText = useTranslation(common);
  const { available, isTeacher } = useTeacher();
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!available) return null;

  const turnOn = async () => {
    setChecking(true);
    setError(null);
    try {
      if (await api.checkTeacher(code.trim())) {
        saveTeacherCode(code.trim());
        setCode('');
      } else setError(t('teacherWrong'));
    } catch {
      setError(commonText.t('offline'));
    } finally {
      setChecking(false);
    }
  };

  return (
    <section className="settings-card">
      <h2>{t('teacher')}</h2>
      <p className="hint">{t('teacherHint')}</p>
      {isTeacher ? (
        <div className="settings-row">
          <span role="status">{t('teacherOn')}</span>
          <button type="button" className="btn ghost" onClick={forgetTeacherCode}>
            {t('teacherTurnOff')}
          </button>
        </div>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void turnOn();
          }}
        >
          <label className="form-field">
            <span>{t('teacherCode')}</span>
            <input
              type="password"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              autoComplete="off"
            />
          </label>
          <div className="row-actions">
            <button type="submit" className="btn primary" disabled={!code.trim() || checking}>
              {t('teacherTurnOn')}
            </button>
          </div>
        </form>
      )}
      {error && (
        <div className="note err" role="alert">
          <p>{error}</p>
        </div>
      )}
    </section>
  );
}
