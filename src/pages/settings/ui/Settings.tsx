import { useState } from 'react';

import {
  ALWAYS_SHOWN,
  DAILY_GOALS,
  type Language,
  LESSON_TABS,
  type LessonTab,
  type Section,
  SECTIONS,
  SPEECH_SPEEDS,
  THEMES,
  updateSettings,
  useSettings,
} from '@/shared/config';
import { app, paper, setUiLanguage, UI_LANGUAGES, useTranslation } from '@/shared/i18n';
import { shrinkImage } from '@/shared/lib/image';
import { canSpeak, speak } from '@/shared/lib/speech';
import Avatar from '@/shared/ui/Avatar';
import PageHead from '@/shared/ui/PageHead';

import { settingsText } from '../i18n/settings';
import LearningCard from './LearningCard';
import PictureMenu from './PictureMenu';
import styles from './Settings.module.css';
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
  phonetics: 'phonetics',
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
  const sectionNames = useTranslation(app);
  const tabNames = useTranslation(paper);
  const settings = useSettings();
  const [hasPictureError, setHasPictureError] = useState(false);
  const [copied, setCopied] = useState(false);
  /** the translation language when the page opened: once another is chosen, a note says lessons
      are prepared again in it; choosing this one again takes the note away (its lessons are kept) */
  const [openedTranslateTo] = useState(settings.translateTo);

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

      {/* Profile and Interface side by side on a wide screen, one under the other on a phone */}
      <div className={styles.top}>
        <section className={styles.card}>
          <h2>{t('profile')}</h2>
          <div className={styles.profile}>
            <PictureMenu
              hasPicture={!!settings.avatar}
              onFile={(file) => void choosePicture(file)}
              onRemove={() => updateSettings({ avatar: '' })}
            >
              <Avatar size={96} />
            </PictureMenu>
            <div className={styles['profile-fields']}>
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
          <div className={styles.row}>
            <span className={styles.label}>{t('dailyGoal')}</span>
            <div
              className={`seg ${styles['goal-choice']}`}
              role="group"
              aria-label={t('dailyGoal')}
            >
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
            <div className={styles.row}>
              <span className={styles.label}>{t('speechSpeed')}</span>
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
        <section className={styles.card}>
          <h2>{t('interface')}</h2>
          <div className={styles.row}>
            <label className={styles.label} htmlFor="settings-ui-language">
              {t('interfaceLanguage')}
            </label>
            <select
              id="settings-ui-language"
              className={styles.select}
              value={uiLanguage}
              onChange={(event) => {
                const chosen = UI_LANGUAGES.find((option) => option.id === event.target.value);
                if (chosen) setUiLanguage(chosen.id);
              }}
            >
              {UI_LANGUAGES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.flag} {option.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.row}>
            <label className={styles.label} htmlFor="settings-translate-to">
              {t('translateTo')}
            </label>
            <select
              id="settings-translate-to"
              className={styles.select}
              value={settings.translateTo}
              onChange={(event) => {
                const translateTo = UI_LANGUAGES.find((option) => option.id === event.target.value);
                if (!translateTo) return;
                updateSettings({ translateTo: translateTo.id });
              }}
            >
              {UI_LANGUAGES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.flag} {option.name}
                </option>
              ))}
            </select>
            <small className={`hint ${styles['row-note']}`}>{t('translateToHint')}</small>
          </div>
          {/* always on the page, so a screen reader reads the note when it appears */}
          <small className={`hint ${styles.status}`} role="status">
            {settings.translateTo !== openedTranslateTo && t('translateToChanged')}
          </small>
          <div className={styles.row}>
            <span className={styles.label}>{t('theme')}</span>
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
      </div>

      <LearningCard />

      <section className={styles.card}>
        <h2>{t('menu')}</h2>
        <p className="hint">{t('menuHint')}</p>
        <ul className={styles.sections}>
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

      <section className={styles.card}>
        <h2>{t('lessonTabs')}</h2>
        <p className="hint">{t('lessonTabsHint')}</p>
        <ul className={styles.sections}>
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

      <section className={styles.card}>
        <h2>{t('document')}</h2>
        <p className="hint">{t('documentHint')}</p>
        <p className={styles.document}>
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
    </>
  );
}
