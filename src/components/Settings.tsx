import { useState } from 'react';

import { knownTenses, tensesForLevel } from '@/entities/verb';
import {
  type Language,
  LANGUAGES,
  type Tense,
  TENSES_BY_LANGUAGE,
  VERB_LANGUAGES,
  type VerbLanguage,
} from '@/shared/config/languages';
import { type Section, SECTIONS } from '@/shared/config/routes';
import {
  ALWAYS_SHOWN,
  DAILY_GOALS,
  LESSON_TABS,
  type LessonTab,
  type Level,
  LEVELS,
  SPEECH_SPEEDS,
  THEMES,
  updateSettings,
  useSettings,
} from '@/shared/config/settings';
import { setUiLanguage, UI_LANGUAGES, useTranslation } from '@/shared/i18n/core';
import { app } from '@/shared/i18n/messages/app';
import { learning } from '@/shared/i18n/messages/common';
import { paper } from '@/shared/i18n/messages/paper';
import { settingsText } from '@/shared/i18n/messages/settings';
import { shrinkImage } from '@/shared/lib/image';
import { canSpeak, speak } from '@/shared/lib/speech';
import PageHead from '@/shared/ui/PageHead';

import TeacherCard from './TeacherCard';

// each lesson tab under the name it has on the lesson page
// the student's name, in reports to the teacher and in Zoom calls
const MAX_NAME_LENGTH = 60;
// how long “Copied” stays on the button, in milliseconds
const COPIED_SHOWN = 2500;
// the picture is kept this many pixels wide: enough for the top bar and Zoom, small to store
const AVATAR_SIDE = 256;

const TAB_NAMES = {
  words: 'words',
  verbs: 'verbs',
  grammar: 'grammar',
  homework: 'homework',
  book: 'book',
  notes: 'myNotes',
  source: 'original',
} as const satisfies Record<LessonTab, string>;

// a sentence to try the voice with
const SAMPLES: Record<Language, string> = {
  fr: 'Bonjour, comment ça va ?',
  en: 'Hello, how are you today?',
  de: 'Hallo, wie geht es dir?',
  es: 'Hola, ¿qué tal?',
  pt: 'Olá, como estás?',
  it: 'Ciao, come stai?',
};

// A picture of the student: the uploaded one, or the first letter of their name.
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

// The lesson document this app reads, and what can be done with it.
export interface DocumentInfo {
  title: string;
  url: string;
  // the app's address with this document, for the student
  studentLink: string;
  onChange: () => void;
}

// The student's settings: profile, document, interface, learning and the menu.
export default function Settings({ lessonDocument }: { lessonDocument: DocumentInfo }) {
  const { t, language: uiLanguage } = useTranslation(settingsText);
  const names = useTranslation(learning);
  const sectionNames = useTranslation(app);
  const tabNames = useTranslation(paper);
  const settings = useSettings();
  const [hasPictureError, setHasPictureError] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(lessonDocument.studentLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPIED_SHOWN);
    } catch {
      window.prompt(sectionNames.t('copyPrompt'), lessonDocument.studentLink);
    }
  }

  async function choosePicture(file: File) {
    setHasPictureError(false);
    try {
      // small and square-ish: it sits in a circle in the top bar
      const { mediaType, data } = await shrinkImage(file, AVATAR_SIDE);
      updateSettings({ avatar: `data:${mediaType};base64,${data}` });
    } catch {
      setHasPictureError(true);
    }
  }
  const toggleTense = (language: VerbLanguage, tense: Tense) => {
    const known = knownTenses(language, settings);
    const all: readonly Tense[] = TENSES_BY_LANGUAGE[language];
    const ticked = all.filter((name) =>
      name === tense ? !known.includes(name) : known.includes(name)
    );
    if (!ticked.length) return;
    // the same as the level's: follow the level again, so a new level brings its tenses
    const sameAsLevel =
      ticked.join('|') === tensesForLevel(language, settings.levels[language]).join('|');
    updateSettings({
      tenses: sameAsLevel ? withoutTenses(language) : { ...settings.tenses, [language]: ticked },
    });
  };
  // the tenses ticked by hand, without one language's: that language follows its level
  const withoutTenses = (language: VerbLanguage) => {
    const others = { ...settings.tenses };
    delete others[language];
    return others;
  };
  const followLevel = (language: VerbLanguage) =>
    updateSettings({ tenses: withoutTenses(language) });
  const verbLanguages = VERB_LANGUAGES.filter((language) => settings.studying.includes(language));
  const toggleLanguage = (language: Language) => {
    const studying = settings.studying.includes(language)
      ? settings.studying.filter((studied) => studied !== language)
      : [...settings.studying, language];
    if (studying.length) updateSettings({ studying });
  };
  const toggleSection = (section: Section) =>
    updateSettings({
      hidden: settings.hidden.includes(section)
        ? settings.hidden.filter((hidden) => hidden !== section)
        : [...settings.hidden, section],
    });
  const shownTabCount = LESSON_TABS.length - settings.hiddenTabs.length;
  const toggleTab = (tab: LessonTab) =>
    updateSettings({
      hiddenTabs: settings.hiddenTabs.includes(tab)
        ? settings.hiddenTabs.filter((hidden) => hidden !== tab)
        : [...settings.hiddenTabs, tab],
    });

  return (
    <>
      <PageHead guide="settings" title={t('title')}>
        {t('intro')}
      </PageHead>

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
            {hasPictureError && (
              <p className="field-error" role="alert">
                {t('pictureFailed')}
              </p>
            )}
            <label className="form-field">
              <span>{t('name')}</span>
              <input
                type="text"
                maxLength={MAX_NAME_LENGTH}
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
        <h2>{t('document')}</h2>
        <p className="hint">{t('documentHint')}</p>
        <p className="settings-document">
          <span aria-hidden="true">📄</span> <b>{lessonDocument.title}</b>
        </p>
        <div className="row-actions">
          <a className="btn" href={lessonDocument.url} target="_blank" rel="noopener noreferrer">
            {sectionNames.t('openDocument')}
          </a>
          <button type="button" className="btn" onClick={() => void copyLink()}>
            {copied ? sectionNames.t('linkCopied') : sectionNames.t('copyLink')}
          </button>
          <button type="button" className="btn ghost" onClick={lessonDocument.onChange}>
            {sectionNames.t('changeDocument')}
          </button>
        </div>
        <small className="hint">{t('studentLinkHint')}</small>
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
                  <label data-tooltip={onlyOne ? t('atLeastOne') : undefined}>
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
        {verbLanguages.length > 0 && (
          <div className="settings-row column">
            <span className="settings-label">{t('quizTenses')}</span>
            {verbLanguages.map((language) => {
              const known = knownTenses(language, settings);
              return (
                <fieldset key={language} className="settings-tenses">
                  <legend>{names.t(`name.${language}`)}</legend>
                  <ul>
                    {TENSES_BY_LANGUAGE[language].map((tense: Tense) => {
                      const ticked = known.includes(tense);
                      const lastOne = ticked && known.length === 1;
                      return (
                        <li key={tense}>
                          <label data-tooltip={lastOne ? t('atLeastOneTense') : undefined}>
                            <input
                              type="checkbox"
                              checked={ticked}
                              disabled={lastOne}
                              onChange={() => toggleTense(language, tense)}
                            />
                            <span lang={language}>{tense}</span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                  {settings.tenses[language] && (
                    <button
                      type="button"
                      className="btn ghost flush"
                      onClick={() => followLevel(language)}
                    >
                      {t('tensesByLevel', { level: settings.levels[language] })}
                    </button>
                  )}
                </fieldset>
              );
            })}
            <small className="hint">{t('quizTensesHint')}</small>
          </div>
        )}
        <div className="settings-row">
          <span className="settings-label">{t('dailyGoal')}</span>
          <div className="seg goal-choice" role="group" aria-label={t('dailyGoal')}>
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
              {SPEECH_SPEEDS.map((speed) => (
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

      <section className="settings-card">
        <h2>{t('lessonTabs')}</h2>
        <p className="hint">{t('lessonTabsHint')}</p>
        <ul className="settings-sections">
          {LESSON_TABS.map((tab) => {
            const shown = !settings.hiddenTabs.includes(tab);
            return (
              <li key={tab}>
                <label>
                  <input
                    type="checkbox"
                    checked={shown}
                    // the last tab shown stays
                    disabled={shown && shownTabCount === 1}
                    onChange={() => toggleTab(tab)}
                  />
                  {tabNames.t(TAB_NAMES[tab])}
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <TeacherCard />
    </>
  );
}
