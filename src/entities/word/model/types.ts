import { type Language } from '@/shared/config/languages';

export interface Word {
  fr: string;
  ru: string;
  kind: string;
  added: boolean;
  // pronunciation as the teacher wrote it, without brackets
  tr: string;
  // key of the lesson the word comes from, set when lessons are merged
  lesson?: string;
  // language of fr (the word being learned), set with lesson; French when missing
  language?: Language;
  // short English gloss of the meaning; words that mean nearly the same share it, so neither is offered as a wrong answer for the other
  sense?: string;
  // a key word of the lesson: the teacher marked its line with ★, and exercises ask it more often
  key?: boolean;
}

export interface Pair {
  a: string;
  b: string;
  kind: 'synonym' | 'antonym';
}
