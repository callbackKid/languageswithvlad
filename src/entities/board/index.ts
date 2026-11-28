// The public API of entities/board: everything outside the slice imports from here.
export {
  asPointer,
  asPointerButton,
  asSavedBoard,
  asSharedElements,
  asSharedFiles,
  batchBoardFiles,
  type SavedBoard,
} from './model/boardPayload';
export {
  getBoardRevision,
  readBoardPreview,
  updateBoardPreviews,
  writeBoardPreview,
} from './model/boardPreview';
