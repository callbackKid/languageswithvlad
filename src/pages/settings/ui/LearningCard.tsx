import { useState } from 'react';

import { knownTenses, tensesForLevel } from '@/entities/verb';
import {
  type Language,
  LANGUAGES,
  type Level,
  LEVELS,
  type Settings,
  type Tense,
  TENSES_BY_LANGUAGE,
  updateSettings,
  useSettings,
  VERB_LANGUAGES,
  type VerbLanguage,
} from '@/shared/config';
import { common, learning, useTranslation } from '@/shared/i18n';

import { settingsText } from '../i18n/settings';
import styles from './Settings.module.css';

// The language's tenses when its verbs have tables (not English); null otherwise.
const verbLanguageOf = (language: Language): VerbLanguage | null =>
  VERB_LANGUAGES.find((candidate) => candidate === language) ?? null;

// The tenses with one ticked or unticked, in the language's order; null when none would be left.
function withToggled(language: VerbLanguage, ticked: readonly Tense[], tense: Tense) {
  const all: readonly Tense[] = TENSES_BY_LANGUAGE[language];
  const next = all.filter((name) =>
    name === tense ? !ticked.includes(name) : ticked.includes(name)
  );
  return next.length ? next : null;
}

// The tenses ticked by hand without one language's: that language follows its level again.
function withoutLanguage(tenses: Settings['tenses'], language: VerbLanguage): Settings['tenses'] {
  const others = { ...tenses };
  delete others[language];
  return others;
}

// The tenses ticked by hand with one language's set; left out when they match the level's.
function tensesWith(
  tenses: Settings['tenses'],
  language: VerbLanguage,
  level: Level,
  ticked: readonly Tense[]
): Settings['tenses'] {
  // the same as the level's: follow the level, so a new level brings its tenses
  const sameAsLevel = ticked.join('|') === tensesForLevel(language, level).join('|');
  return sameAsLevel
    ? withoutLanguage(tenses, language)
    : { ...withoutLanguage(tenses, language), [language]: [...ticked] };
}

/** The Learning card: the languages being learned, each with its level and the tenses quizzes
    ask, and a button that adds one more after asking for the same. */
export default function LearningCard() {
  const { t } = useTranslation(settingsText);
  const names = useTranslation(learning);
  const settings = useSettings();
  const [isAdding, setIsAdding] = useState(false);
  const notStudied = LANGUAGES.filter((language) => !settings.studying.includes(language));

  const stopLearning = (language: Language) => {
    const studying = settings.studying.filter((studied) => studied !== language);
    if (studying.length) updateSettings({ studying });
  };

  return (
    <section className={styles.card}>
      <h2>{t('learning')}</h2>
      <span className={styles.label}>{t('studying')}</span>
      <ul className={styles.learned}>
        {settings.studying.map((language) => {
          const name = names.t(`name.${language}`);
          const level = settings.levels[language];
          const verbLanguage = verbLanguageOf(language);
          return (
            <li key={language} className={styles['learned-language']}>
              <div className={styles['learned-head']}>
                <b>{name}</b>
                <label className={styles.level}>
                  {t('level')}
                  <select
                    value={level}
                    onChange={(event) => {
                      const chosen = LEVELS.find((option) => option === event.target.value);
                      if (chosen)
                        updateSettings({ levels: { ...settings.levels, [language]: chosen } });
                    }}
                  >
                    {LEVELS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                {/* the last language stays: there is nothing to practise without one */}
                {settings.studying.length > 1 && (
                  <button
                    type="button"
                    className="row-remove"
                    data-tooltip={t('stopLearning')}
                    aria-label={t('stopLearningLabel', { language: name })}
                    onClick={() => stopLearning(language)}
                  >
                    ✕
                  </button>
                )}
              </div>
              {verbLanguage && (
                <TenseChoice
                  language={verbLanguage}
                  ticked={knownTenses(verbLanguage, settings)}
                  onChange={(ticked) =>
                    updateSettings({
                      tenses: tensesWith(settings.tenses, verbLanguage, level, ticked),
                    })
                  }
                  onFollowLevel={
                    settings.tenses[verbLanguage]
                      ? () =>
                          updateSettings({ tenses: withoutLanguage(settings.tenses, verbLanguage) })
                      : undefined
                  }
                  level={level}
                />
              )}
            </li>
          );
        })}
      </ul>
      {isAdding ? (
        <AddLanguage choices={notStudied} onDone={() => setIsAdding(false)} />
      ) : (
        notStudied.length > 0 && (
          <button type="button" className="btn" onClick={() => setIsAdding(true)}>
            + {t('addLanguage')}
          </button>
        )
      )}
      <small className="hint">{t('studyingHint')}</small>
      <small className="hint">{t('levelsHint')}</small>
      <small className="hint">{t('quizTensesHint')}</small>
    </section>
  );
}

// The tenses quizzes ask in one language, as checkboxes; one always stays ticked.
function TenseChoice({
  language,
  level,
  ticked,
  onChange,
  onFollowLevel,
}: {
  language: VerbLanguage;
  level: Level;
  ticked: readonly Tense[];
  onChange: (ticked: Tense[]) => void;
  // shown when the tenses were ticked by hand: back to the level's
  onFollowLevel?: () => void;
}) {
  const { t } = useTranslation(settingsText);
  return (
    <fieldset className={styles.tenses}>
      <legend>{t('quizTenses')}</legend>
      <ul>
        {TENSES_BY_LANGUAGE[language].map((tense: Tense) => {
          const isTicked = ticked.includes(tense);
          const isLastOne = isTicked && ticked.length === 1;
          return (
            <li key={tense}>
              <label data-tooltip={isLastOne ? t('atLeastOneTense') : undefined}>
                <input
                  type="checkbox"
                  checked={isTicked}
                  disabled={isLastOne}
                  onChange={() => {
                    const next = withToggled(language, ticked, tense);
                    if (next) onChange(next);
                  }}
                />
                <span lang={language}>{tense}</span>
              </label>
            </li>
          );
        })}
      </ul>
      {onFollowLevel && (
        <button type="button" className="btn ghost" onClick={onFollowLevel}>
          {t('tensesByLevel', { level })}
        </button>
      )}
    </fieldset>
  );
}

/** The form that adds a language: which one, the level, and the quiz tenses (the level's until
    some are ticked by hand). */
function AddLanguage({ choices, onDone }: { choices: Language[]; onDone: () => void }) {
  const { t } = useTranslation(settingsText);
  const names = useTranslation(learning);
  const commonText = useTranslation(common);
  const settings = useSettings();
  const [language, setLanguage] = useState<Language>(choices[0] ?? 'fr');
  const [level, setLevel] = useState<Level>(settings.levels[language]);
  // ticked by hand; null while they follow the level
  const [tenses, setTenses] = useState<Tense[] | null>(null);
  const verbLanguage = verbLanguageOf(language);

  const add = () => {
    updateSettings({
      studying: [...settings.studying, language],
      levels: { ...settings.levels, [language]: level },
      tenses:
        verbLanguage && tenses
          ? tensesWith(settings.tenses, verbLanguage, level, tenses)
          : settings.tenses,
    });
    onDone();
  };

  return (
    <div className={styles['add-language']}>
      <div className={styles['add-fields']}>
        <label className="form-field">
          <span>{t('newLanguage')}</span>
          <select
            value={language}
            onChange={(event) => {
              const chosen = choices.find((option) => option === event.target.value);
              if (!chosen) return;
              setLanguage(chosen);
              setLevel(settings.levels[chosen]);
              setTenses(null);
            }}
          >
            {choices.map((option) => (
              <option key={option} value={option}>
                {names.t(`name.${option}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span>{t('level')}</span>
          <select
            value={level}
            onChange={(event) => {
              const chosen = LEVELS.find((option) => option === event.target.value);
              if (chosen) setLevel(chosen);
            }}
          >
            {LEVELS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
      {verbLanguage && (
        <TenseChoice
          language={verbLanguage}
          level={level}
          ticked={tenses ?? tensesForLevel(verbLanguage, level)}
          onChange={setTenses}
          onFollowLevel={tenses ? () => setTenses(null) : undefined}
        />
      )}
      <div className="row-actions">
        <button type="button" className="btn primary" onClick={add}>
          {t('addThisLanguage', { language: names.t(`name.${language}`) })}
        </button>
        <button type="button" className="btn ghost" onClick={onDone}>
          {commonText.t('cancel')}
        </button>
      </div>
    </div>
  );
}
