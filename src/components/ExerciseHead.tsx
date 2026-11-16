import type { ReactNode } from 'react';

import { useTranslation } from '../i18n/core';
import { common } from '../i18n/messages/common';

/** The title row of an exercise: its name, a progress counter, and a way back. */
export default function ExerciseHead({
  title,
  children,
  onClose,
  closeLabel,
}: {
  title: string;
  children?: ReactNode;
  onClose?: () => void;
  closeLabel?: string;
}) {
  const { t } = useTranslation(common);
  return (
    <div className="ex-head">
      <h2>{title}</h2>
      {children}
      {onClose && (
        <button type="button" className="btn ghost" onClick={onClose}>
          {closeLabel ?? t('backToWords')}
        </button>
      )}
    </div>
  );
}
