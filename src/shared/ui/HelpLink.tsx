import { type GuideId, guidePath } from '@/shared/config';
import { common, useTranslation } from '@/shared/i18n';
import { followLink, hrefFor } from '@/shared/lib/router';

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
