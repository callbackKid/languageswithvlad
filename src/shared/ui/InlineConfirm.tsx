import { useEffect, useRef } from 'react';

import { common, useTranslation } from '@/shared/i18n';

import { IconButton } from './controls';

/** A question asked in place, under the row it is about, instead of the browser's alert: ✓ does
    it, the red ✕ (or Escape) doesn't. Focus moves to ✕, so Enter by habit changes nothing. */
const InlineConfirm = ({
  question,
  yesLabel,
  onYes,
  onNo,
}: {
  question: string;
  yesLabel: string;
  onYes: () => void;
  onNo: () => void;
}) => {
  const { t } = useTranslation(common);
  const noButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    noButton.current?.focus();
  }, []);

  return (
    <div
      className="inline-confirm"
      role="group"
      aria-label={question}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onNo();
      }}
    >
      <p>{question}</p>
      <IconButton className="inline-confirm-yes" label={yesLabel} onClick={onYes}>
        ✓
      </IconButton>
      <IconButton ref={noButton} className="inline-confirm-no" label={t('cancel')} onClick={onNo}>
        ✕
      </IconButton>
    </div>
  );
};

export default InlineConfirm;
