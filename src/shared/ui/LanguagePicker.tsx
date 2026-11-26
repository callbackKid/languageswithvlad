import { app, setUiLanguage, UI_LANGUAGES, type UiLanguage, useTranslation } from '@/shared/i18n';

// The dropdown in the top bar that changes the language of the interface.
const LanguagePicker = () => {
  const { t, language } = useTranslation(app);
  return (
    <select
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
    </select>
  );
};

export default LanguagePicker;
