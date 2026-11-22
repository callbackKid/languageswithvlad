/* Which tenses a student has learned, so quizzes don't ask an A0 student for the passé composé.
   By default it follows the level; a student who ticks tenses in Settings overrides it for that
   language. The Verbs tab still shows every tense: there the student picks one on purpose. */
import { type Tense, TENSES_BY_LANGUAGE, type VerbLanguage } from '@/shared/config/languages';
import { getSettings, type Level, LEVELS, type Settings } from '@/shared/config/settings';

// The level at which each tense is usually taught: a quiz asks the tenses up to the student's.
const FIRST_LEVEL: {
  [Key in VerbLanguage]: Record<(typeof TENSES_BY_LANGUAGE)[Key][number], Level>;
} = {
  fr: {
    présent: 'A0',
    'passé composé': 'A1',
    impératif: 'A1',
    imparfait: 'A2',
    'futur proche': 'A1',
    'futur simple': 'A2',
    'conditionnel présent': 'B1',
  },
  de: { Präsens: 'A0', Perfekt: 'A1', Präteritum: 'A2', 'Futur I': 'A2', 'Konjunktiv II': 'B1' },
  es: {
    'presente de indicativo': 'A0',
    'pretérito perfecto compuesto': 'A1',
    'pretérito indefinido': 'A2',
    'pretérito imperfecto': 'A2',
    'futuro simple': 'A2',
    'condicional simple': 'B1',
  },
  it: {
    'indicativo presente': 'A0',
    'passato prossimo': 'A1',
    imperfetto: 'A2',
    'futuro semplice': 'A2',
    'condizionale presente': 'B1',
  },
  pt: {
    'presente do indicativo': 'A0',
    'pretérito perfeito': 'A1',
    'pretérito imperfeito': 'A2',
    'futuro do presente': 'A2',
    condicional: 'B1',
  },
};

// The tenses usually learned by a level, in the order the Verbs tab shows them.
export function tensesForLevel(language: VerbLanguage, level: Level): Tense[] {
  const reached = LEVELS.indexOf(level);
  const firstLevels: Record<string, Level> = FIRST_LEVEL[language];
  return TENSES_BY_LANGUAGE[language].filter(
    (tense) => LEVELS.indexOf(firstLevels[tense] ?? 'A0') <= reached
  );
}

// The tenses quizzes ask in a language: the ones ticked in Settings, or those of the level.
export const knownTenses = (language: VerbLanguage, settings: Settings = getSettings()): Tense[] =>
  settings.tenses[language] ?? tensesForLevel(language, settings.levels[language]);
