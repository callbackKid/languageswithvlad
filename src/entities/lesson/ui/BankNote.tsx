import { common, useTranslation } from '@/shared/i18n';

import { type Bank } from '../model/bank';

// Says when some lessons aren't in the cross-lesson pages yet: still preparing, failed, or never opened.
const BankNote = ({ bank }: { bank: Bank }) => {
  const { t } = useTranslation(common);
  if (bank.pending)
    return (
      <div className="note info">
        <span className="spinner" />
        <p>{t('preparingMore', { count: bank.pending })}</p>
      </div>
    );
  if (bank.failed)
    return (
      <div className="note err">
        <p>{t('failedLessons', { count: bank.failed })}</p>
      </div>
    );
  if (bank.waiting)
    return (
      <div className="note info">
        <p>{t('waitingLessons', { count: bank.waiting })}</p>
      </div>
    );
  return null;
};

export default BankNote;
