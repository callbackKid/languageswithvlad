import { useEffect, useRef } from 'react';

import { common, useTranslation } from '@/shared/i18n';

/** A question asked in place, under the row it is about, instead of the browser's alert: ✓ does
    it, the red ✕ (or Escape) doesn't. Focus moves to ✕, so Enter by habit changes nothing. */
export default function InlineConfirm({
  question,
  yesLabel,
  onYes,
  onNo,
}: {
  question: string;
  yesLabel: string;
  onYes: () => void;
  onNo: () => void;
}) {
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
      <button
        type="button"
        className="inline-confirm-yes"
        aria-label={yesLabel}
        data-tooltip={yesLabel}
        onClick={onYes}
      >
        ✓
      </button>
      <button
        ref={noButton}
        type="button"
        className="inline-confirm-no"
        aria-label={t('cancel')}
        data-tooltip={t('cancel')}
        onClick={onNo}
      >
        ✕
      </button>
    </div>
  );
}
