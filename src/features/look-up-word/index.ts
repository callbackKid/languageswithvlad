// The public API of features/look-up-word: everything outside the slice imports from here.
export {
  asLookUp,
  CARD_EVENT,
  type CardFound,
  cardNote,
  cardWord,
  cleanSelection,
  docLine,
  learnedLanguage,
  LOOK_UP_EVENT,
  type LookUp,
  lookUp,
  menuPlace,
  readWordCard,
  saveWordCard,
  sentenceAround,
} from './model/wordActions';
export { default as LookUpWord } from './ui/LookUpWord';
