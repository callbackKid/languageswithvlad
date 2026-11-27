import type { ReactNode } from 'react';

import { common, useTranslation } from '@/shared/i18n';

import { Button } from './controls';
import styles from './ExerciseHead.module.css';

// The title row of an exercise: its name, a progress counter, and a way back.
const ExerciseHead = ({
  title,
  children,
  onClose,
  closeLabel,
}: {
  title: string;
  children?: ReactNode;
  onClose?: () => void;
  closeLabel?: string;
}) => {
  const { t } = useTranslation(common);
  return (
    <div className={styles['ex-head']}>
      <h2>{title}</h2>
      {children}
      {onClose && (
        <Button variant="ghost" onClick={onClose}>
          {closeLabel ?? t('backToWords')}
        </Button>
      )}
    </div>
  );
};

export default ExerciseHead;
