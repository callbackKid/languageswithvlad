// The public API of entities/homework: everything outside the slice imports from here.
export {
  findHomework,
  type Homework,
  type HomeworkItem,
  homeworkItems,
  homeworkKey,
  readItem,
  writingKey,
} from './model/homework';
export { normalizeWriting, normalizeWritingCheck } from './model/normalize';
export { type Writing, type WritingCheck } from './model/types';
