import type { ReactNode } from 'react';

import { common, useTranslation } from '@/shared/i18n';

import { Button } from './controls';

// The title row of an exercise: its name, a progress counter, and a way back.
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
        <Button variant="ghost" onClick={onClose}>
          {closeLabel ?? t('backToWords')}
        </Button>
      )}
    </div>
  );
}
