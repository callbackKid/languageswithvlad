import { type Language } from '@/shared/config';
import { type UiLanguage } from '@/shared/i18n';

/** A question of an exercise the teacher makes in lesson mode: choose the answer, fill the gap,
    or translate a sentence from the translation language. */
export interface ExerciseQuestion {
  type: 'choice' | 'gap' | 'translate';
  prompt: string;
  // the answers to choose from, for "choice"; [] otherwise
  options: string[];
  answer: string;
  // other answers that are just as right
  accept: string[];
  // the translation of the prompt ("" for "translate", whose prompt is in the translation language)
  ru: string;
  // why the answer is right, in the translation language
  explanation: string;
  // a word or phrase in the language learned that the question reads aloud (phonetics); "" for none
  say: string;
  // the question asks which word was heard: it needs a voice to be answered
  heard: boolean;
}

export interface MadeExercise {
  title: string;
  language: Language;
  questions: ExerciseQuestion[];
  // the language of its translations and explanations; Russian for one made before it was kept
  translatedTo: UiLanguage;
  // the language its prompts are written in, when not the language learned (phonetics questions)
  promptIn?: UiLanguage;
}
