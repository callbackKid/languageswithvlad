import { type Language, type Tense, type VerbLanguage } from '@/shared/config';

export interface VerbRef {
  inf: string;
  ru: string;
  /** the language of its lesson, set when lessons are merged or a lesson's verbs are shown;
      French when missing */
  language?: Language;
}

export interface Form {
  p: string;
  f: string;
}

export interface Conjugation {
  inf: string;
  ru: string;
  aux: string;
  pp: string;
  // missing in tables saved before German had them, which are all French
  language?: VerbLanguage;
  // only the tenses of its language
  tenses: Partial<Record<Tense, Form[]>>;
}
