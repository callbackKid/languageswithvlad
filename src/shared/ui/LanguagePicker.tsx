import { app, setUiLanguage, UI_LANGUAGES, type UiLanguage, useTranslation } from '@/shared/i18n';

import { Select } from './controls';

// The dropdown in the top bar that changes the language of the interface.
const LanguagePicker = () => {
  const { t, language } = useTranslation(app);
  return (
    <Select
      className="language-picker"
      value={language}
      aria-label={t('interfaceLanguage')}
      data-tooltip={t('interfaceLanguage')}
      onChange={(event) => setUiLanguage(event.target.value as UiLanguage)}
    >
      {UI_LANGUAGES.map((option) => (
        <option key={option.id} value={option.id}>
          {option.flag} {option.name}
        </option>
      ))}
    </Select>
  );
};

export default LanguagePicker;
