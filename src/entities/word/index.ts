// The public API of entities/word: everything outside the slice imports from here.
export { normalizePhotoItems, normalizeWordCard, photoItem } from './model/normalize';
export {
  dailyStats,
  type FormStat,
  getProgress,
  isLearned,
  LEARNED_STREAK,
  type Progress,
  recordForm,
  recordWord,
  setHard,
  setProgressDoc,
  statWord,
  topMistakes,
  useProgress,
  wordKey,
  type WordStat,
} from './model/progress';
export { type Word } from './model/types';
export { type PhotoItem, type WordCard } from './model/wordCard';
export { default as Transcription } from './ui/Transcription';
