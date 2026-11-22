/** The language a lesson teaches; translations are always Russian. Its name in each interface
    language is in shared/i18n/messages/common.ts ("name.<code>"). */
export type Language = 'fr' | 'en' | 'de' | 'es' | 'pt' | 'it';
export const LANGUAGES: Language[] = ['fr', 'en', 'de', 'es', 'pt', 'it'];
// A lesson's language from outside data; French when it isn't one.
export const asLanguage = (value: unknown): Language =>
  LANGUAGES.includes(value as Language) ? (value as Language) : 'fr';

/** The languages with verb tables, and their tenses in the order the tabs show them. The names
    differ between languages, so a tense alone tells which language a saved form is in. The
    futur proche is built by the app (entities/verb/lib/futurProche.ts), so Claude is never asked for it. */
export const TENSES_BY_LANGUAGE = {
  fr: [
    'présent',
    'passé composé',
    'imparfait',
    'futur proche',
    'futur simple',
    'conditionnel présent',
    'impératif',
  ],
  de: ['Präsens', 'Perfekt', 'Präteritum', 'Futur I', 'Konjunktiv II'],
  // the full names: plain "presente" would be the same in three languages
  es: [
    'presente de indicativo',
    'pretérito perfecto compuesto',
    'pretérito indefinido',
    'pretérito imperfecto',
    'futuro simple',
    'condicional simple',
  ],
  it: [
    'indicativo presente',
    'passato prossimo',
    'imperfetto',
    'futuro semplice',
    'condizionale presente',
  ],
  pt: [
    'presente do indicativo',
    'pretérito perfeito',
    'pretérito imperfeito',
    'futuro do presente',
    'condicional',
  ],
} as const;
export type VerbLanguage = keyof typeof TENSES_BY_LANGUAGE;
export type Tense = (typeof TENSES_BY_LANGUAGE)[VerbLanguage][number];
/** The past built with an auxiliary, which the table's auxiliary belongs to; Portuguese has
    none in everyday use (its pretérito perfeito is one word). */
export const COMPOUND_PAST: Partial<Record<VerbLanguage, Tense>> = {
  fr: 'passé composé',
  de: 'Perfekt',
  es: 'pretérito perfecto compuesto',
  it: 'passato prossimo',
};
// Every tense of every language.
export const TENSES: readonly Tense[] = Object.values(TENSES_BY_LANGUAGE).flat();
export const VERB_LANGUAGES = Object.keys(TENSES_BY_LANGUAGE) as VerbLanguage[];
// Whether a language has verb tables (every one but English).
export const isVerbLanguage = (language: Language | undefined): language is VerbLanguage =>
  VERB_LANGUAGES.some((verbLanguage) => verbLanguage === language);
/** The language a tense belongs to: "Perfekt" → German. Takes a plain string too, as saved progress
    keeps it; an unknown name counts as French. */
export const languageOfTense = (tense: string): VerbLanguage =>
  VERB_LANGUAGES.find((language) =>
    (TENSES_BY_LANGUAGE[language] as readonly string[]).includes(tense)
  ) ?? 'fr';
