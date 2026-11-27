import { useId, useState } from 'react';

import {
  app,
  common,
  isUiLanguage,
  setUiLanguage,
  UI_LANGUAGES,
  useTranslation,
} from '@/shared/i18n';

import { Select } from './controls';
import styles from './LanguagePicker.module.css';

// The same picker is used before connecting a document and in Settings.
const LanguagePicker = ({
  id,
  className = styles['language-picker'],
  errorClassName,
  showTooltip = true,
}: {
  id?: string;
  className?: string;
  errorClassName?: string;
  showTooltip?: boolean;
}) => {
  const { t, language } = useTranslation(app);
  const commonText = useTranslation(common);
  const errorId = useId();
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const choose = async (value: string) => {
    if (!isUiLanguage(value)) return;
    setIsLoading(true);
    setHasError(false);
    setHasError(!(await setUiLanguage(value)));
    setIsLoading(false);
  };

  return (
    <>
      <Select
        id={id}
        className={className}
        value={language}
        disabled={isLoading}
        aria-label={t('interfaceLanguage')}
        aria-describedby={hasError ? errorId : undefined}
        data-tooltip={showTooltip ? t('interfaceLanguage') : undefined}
        onChange={(event) => void choose(event.target.value)}
      >
        {UI_LANGUAGES.map((option) => (
          <option key={option.id} value={option.id}>
            {option.flag} {option.name}
          </option>
        ))}
      </Select>
      {isLoading && <span className="spinner" aria-hidden="true" />}
      {hasError && (
        <small className={`field-error ${errorClassName ?? ''}`.trim()} id={errorId} role="alert">
          {commonText.t('somethingWrong')}
        </small>
      )}
    </>
  );
};

export default LanguagePicker;
