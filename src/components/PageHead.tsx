import type { ReactNode } from 'react';

import { useTranslation } from '../i18n/core';
import { common } from '../i18n/messages/common';
import type { Bank } from '../lib/bank';
import type { GuideId } from '../lib/guides';
import HelpLink from './HelpLink';

/** A page's title and intro; with a guide, a "?" beside the title opens its Tutorial card. */
export default function PageHead({
  title,
  guide,
  children,
}: {
  title: string;
  guide?: GuideId;
  children?: ReactNode;
}) {
  return (
    <section className="page-head">
      <div className="title-row">
        <h1>{title}</h1>
        {guide && <HelpLink guide={guide} />}
      </div>
      {children && <p>{children}</p>}
    </section>
  );
}

/** Says when some lessons aren't in the cross-lesson pages yet: still preparing, failed, or never opened. */
export function BankNote({ bank }: { bank: Bank }) {
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
}
