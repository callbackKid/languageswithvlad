import { useState } from 'react';
import { setUiLanguage, UI_LANGUAGES, useTranslation } from '../i18n/core';
import { app } from '../i18n/messages/app';
import { learning } from '../i18n/messages/common';
import { settingsText } from '../i18n/messages/settings';
import { shrinkImage } from '../lib/image';
import { SECTIONS } from '../lib/sections';
import {
  ALWAYS_SHOWN,
  DAILY_GOALS,
  LEVELS,
  updateSettings,
  useSettings,
  type Level,
  type SpeechSpeed,
  type Theme,
} from '../lib/settings';
import { canSpeak, speak } from '../lib/speech';
import { LANGUAGES, type Language } from '../lib/types';
import PageHead from './PageHead';

const THEMES: Theme[] = ['system', 'light', 'dark'];
const SPEEDS: SpeechSpeed[] = ['normal', 'slow'];
// a sentence to try the voice with
const SAMPLES: Record<Language, string> = {
  fr: 'Bonjour, comment ça va ?',
  en: 'Hello, how are you today?',
  de: 'Hallo, wie geht es dir?',
};

/** A picture of the student: the uploaded one, or the first letter of their name. */
export function Avatar({ size = 32 }: { size?: number }) {
  const { avatar, name } = useSettings();
  return avatar ? (
    <img className="avatar" src={avatar} alt="" width={size} height={size} />
  ) : (
    <span className="avatar letter" style={{ width: size, height: size }} aria-hidden="true">
      {name.trim().charAt(0).toUpperCase() || '🙂'}
    </span>
  );
}

/** The student's settings: profile, interface, learning and the menu. */
export default function Settings() {
  const { t, language: uiLanguage } = useTranslation(settingsText);
  const names = useTranslation(learning);
  const sectionNames = useTranslation(app);
  const settings = useSettings();
  const [pictureError, setPictureError] = useState(false);

  async function choosePicture(file: File) {
    setPictureError(false);
    try {
      // small and square-ish: it sits in a circle in the top bar
      const { mediaType, data } = await shrinkImage(file, 256);
      updateSettings({ avatar: `data:${mediaType};base64,${data}` });
    } catch {
      setPictureError(true);
    }
  }
  const toggleLanguage = (language: Language) => {
    const studying = settings.studying.includes(language)
      ? settings.studying.filter((studied) => studied !== language)
      : [...settings.studying, language];
    if (studying.length) updateSettings({ studying });
  };
  const toggleSection = (section: (typeof SECTIONS)[number]['id']) =>
    updateSettings({
      hidden: settings.hidden.includes(section)
        ? settings.hidden.filter((hidden) => hidden !== section)
        : [...settings.hidden, section],
    });

  return (
    <>
      <PageHead title={t('title')}>{t('intro')}</PageHead>

      <section className="settings-card">
        <h2>{t('profile')}</h2>
        <div className="settings-profile">
          <Avatar size={72} />
          <div className="settings-profile-fields">
            <div className="row-actions">
              <label className="btn">
                {settings.avatar ? t('changePicture') : t('addPicture')}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = '';
                    if (file) void choosePicture(file);
                  }}
                />
              </label>
              {settings.avatar && (
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => updateSettings({ avatar: '' })}
                >
                  {t('removePicture')}
                </button>
              )}
            </div>
            {pictureError && (
              <p className="field-error" role="alert">
                {t('pictureFailed')}
              </p>
            )}
            <label className="report-field">
              <span>{t('name')}</span>
              <input
                type="text"
                maxLength={60}
                value={settings.name}
                placeholder={t('namePlaceholder')}
                onChange={(event) => updateSettings({ name: event.target.value })}
              />
            </label>
            <small className="hint">{t('nameHint')}</small>
          </div>
        </div>
      </section>

      <section className="settings-card">
        <h2>{t('interface')}</h2>
        <div className="settings-row">
          <span className="settings-label">{t('interfaceLanguage')}</span>
          <div className="seg" role="group" aria-label={t('interfaceLanguage')}>
            {UI_LANGUAGES.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={uiLanguage === option.id}
                onClick={() => setUiLanguage(option.id)}
              >
                {option.flag} {option.name}
              </button>
            ))}
          </div>
        </div>
        <div className="settings-row">
          <span className="settings-label">{t('theme')}</span>
          <div className="seg" role="group" aria-label={t('theme')}>
            {THEMES.map((theme) => (
              <button
                key={theme}
                type="button"
                aria-pressed={settings.theme === theme}
                onClick={() => updateSettings({ theme })}
              >
                {t(`theme.${theme}`)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="settings-card">
        <h2>{t('learning')}</h2>
        <div className="settings-row column">
          <span className="settings-label">{t('studying')}</span>
          <ul className="settings-languages">
            {LANGUAGES.map((language) => {
              const studied = settings.studying.includes(language);
              const onlyOne = studied && settings.studying.length === 1;
              return (
                <li key={language}>
                  <label title={onlyOne ? t('atLeastOne') : undefined}>
                    <input
                      type="checkbox"
                      checked={studied}
                      disabled={onlyOne}
                      onChange={() => toggleLanguage(language)}
                    />
                    {names.t(`name.${language}`)}
                  </label>
                  {studied && (
                    <select
                      aria-label={`${t('level')}: ${names.t(`name.${language}`)}`}
                      value={settings.levels[language]}
                      onChange={(event) =>
                        updateSettings({
                          levels: { ...settings.levels, [language]: event.target.value as Level },
                        })
                      }
                    >
                      {LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  )}
                </li>
              );
            })}
          </ul>
          <small className="hint">{t('studyingHint')}</small>
          <small className="hint">{t('levelsHint')}</small>
        </div>
        <div className="settings-row">
          <span className="settings-label">{t('dailyGoal')}</span>
          <div className="seg" role="group" aria-label={t('dailyGoal')}>
            {DAILY_GOALS.map((goal) => (
              <button
                key={goal}
                type="button"
                aria-pressed={settings.dailyGoal === goal}
                onClick={() => updateSettings({ dailyGoal: goal })}
              >
                {t('goalValue', { count: goal })}
              </button>
            ))}
          </div>
        </div>
        {canSpeak && (
          <div className="settings-row">
            <span className="settings-label">{t('speechSpeed')}</span>
            <div className="seg" role="group" aria-label={t('speechSpeed')}>
              {SPEEDS.map((speed) => (
                <button
                  key={speed}
                  type="button"
                  aria-pressed={settings.speechSpeed === speed}
                  onClick={() => updateSettings({ speechSpeed: speed })}
                >
                  {t(`speed.${speed}`)}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                const language = settings.studying[0] ?? 'fr';
                speak(SAMPLES[language], language);
              }}
            >
              🔊 {t('tryIt')}
            </button>
          </div>
        )}
      </section>

      <section className="settings-card">
        <h2>{t('menu')}</h2>
        <p className="hint">{t('menuHint')}</p>
        <ul className="settings-sections">
          {SECTIONS.filter((entry) => entry.inMenu !== false).map((entry) => {
            const fixed = ALWAYS_SHOWN.includes(entry.id);
            return (
              <li key={entry.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={fixed || !settings.hidden.includes(entry.id)}
                    disabled={fixed}
                    onChange={() => toggleSection(entry.id)}
                  />
                  {sectionNames.t(`section.${entry.id}`)}
                </label>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
