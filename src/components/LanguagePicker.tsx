import { setUiLanguage, UI_LANGUAGES, useTranslation, type UiLanguage } from '../i18n/core';
import { app } from '../i18n/messages/app';

/** The dropdown in the top bar that changes the language of the interface. */
export default function LanguagePicker() {
  const { t, language } = useTranslation(app);
  return (
    <select
      className="language-picker"
      value={language}
      aria-label={t('interfaceLanguage')}
      title={t('interfaceLanguage')}
      onChange={(event) => setUiLanguage(event.target.value as UiLanguage)}
    >
      {UI_LANGUAGES.map((option) => (
        <option key={option.id} value={option.id}>
          {option.flag} {option.name}
        </option>
      ))}
    </select>
  );
}
