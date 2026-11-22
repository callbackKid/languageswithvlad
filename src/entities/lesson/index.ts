// The public API of entities/lesson: everything outside the slice imports from here.
export { findCall, openCallWindow } from './lib/call';
export {
  docIdFrom,
  languageOfLesson,
  localParse,
  markKeyWords,
  splitLessons,
} from './lib/document';
export { parseNextLesson } from './lib/nextLesson';
export { isNotion, sourceUrl } from './lib/source';
export {
  analysisKey,
  type Bank,
  fetchConjugation,
  lessonWords,
  readAnalysis,
  readConjugation,
  readLessonLanguage,
  useBank,
  usePreparedLesson,
  verbLanguageOf,
} from './model/bank';
export { useLessonOn, useLiveSync } from './model/liveSync';
export {
  normalizeAnalysis,
  normalizeExtras,
  normalizeGrammarRule,
  normalizePhonetics,
} from './model/normalize';
export {
  buildChoiceQuiz,
  buildDictation,
  buildQuiz,
  dictationForm,
  type FormQuestion,
  keyWordsFirst,
  pickForms,
  pickWords,
  type QuizItem,
  verbForms,
} from './model/quiz';
export {
  getRemoved,
  removedCount,
  removeVerb,
  removeWord,
  restore,
  useRemoved,
  withoutRemoved,
} from './model/removed';
export {
  type Analysis,
  type GrammarRule,
  type HomeworkTask,
  type Lesson,
  type LessonExtras,
  type LessonPhonetics,
} from './model/types';
export { prepareRound, previousLesson, warmUpRound } from './model/warmUp';
export { default as BankNote } from './ui/BankNote';
export { default as GrammarRuleBox } from './ui/GrammarRuleBox';
