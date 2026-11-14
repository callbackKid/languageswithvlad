import type { ReactNode } from 'react';
import { useTranslation } from '../i18n/core';
import { common } from '../i18n/messages/common';

export default function ExHead({
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
        <button className="btn ghost" onClick={onClose}>
          {closeLabel ?? t('backToWords')}
        </button>
      )}
    </div>
  );
}
