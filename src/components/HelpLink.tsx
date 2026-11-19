import { useTranslation } from '../i18n/core';
import { common } from '../i18n/messages/common';
import { type GuideId, guidePath } from '../lib/guides';
import { followLink, hrefFor } from '../lib/router';

// A round "?" next to a page's title that opens the page's card in the Tutorial.
export default function HelpLink({ guide }: { guide: GuideId }) {
  const { t } = useTranslation(common);
  const path = guidePath(guide);
  return (
    <a
      className="help-link"
      href={hrefFor(path)}
      onClick={(event) => followLink(event, path)}
      aria-label={t('howItWorks')}
      data-tooltip={t('howItWorks')}
    >
      ?
    </a>
  );
}
