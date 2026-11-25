// The public API of entities/homework: everything outside the slice imports from here.
export { loadDone, saveDone, useHomeworkDone } from './model/done';
export {
  findHomework,
  type Homework,
  type HomeworkItem,
  homeworkItems,
  homeworkKey,
  homeworkLeft,
  isTaskDone,
  readItem,
  sameTask,
  writingKey,
} from './model/homework';
export { normalizeWriting, normalizeWritingCheck } from './model/normalize';
export { type Writing, type WritingCheck } from './model/types';
