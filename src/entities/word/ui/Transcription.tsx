import { common, useTranslation } from '@/shared/i18n';

// A word's transcription, shown right after the French.
export default function Transcription({ tr }: { tr: string }) {
  const { t } = useTranslation(common);
  return (
    <span className="tr" data-tooltip={t('transcription')}>
      [{tr}]
    </span>
  );
}
