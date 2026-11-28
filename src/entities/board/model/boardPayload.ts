import type { BinaryFileData, Collaborator } from '@excalidraw/excalidraw/types';

/* What the other people on the board send (src/shared/api/boardSync.ts), checked before it reaches
   Excalidraw: a message from another device is outside data, and one malformed shape or picture
   must not break the board for everyone. Only the fields Excalidraw relies on are checked. */

type JsonObject = Record<string, unknown>;
const isObject = (value: unknown): value is JsonObject => !!value && typeof value === 'object';

// A shape as Excalidraw sends it: what has no id, type and version is dropped.
export interface SharedElement extends JsonObject {
  id: string;
  type: string;
  version: number;
}
// The shapes in a message, without the ones that aren't shapes.
export const asSharedElements = (value: unknown): SharedElement[] => {
  return (Array.isArray(value) ? value : []).filter(
    (element): element is SharedElement =>
      isObject(element) &&
      typeof element.id === 'string' &&
      typeof element.type === 'string' &&
      typeof element.version === 'number'
  );
};

// A picture on the board: kept only when it is a data: URL with its id and type.
export const asSharedFiles = (value: unknown): BinaryFileData[] => {
  return (Array.isArray(value) ? value : []).filter(
    (file): file is BinaryFileData =>
      isObject(file) &&
      typeof file.id === 'string' &&
      typeof file.mimeType === 'string' &&
      typeof file.dataURL === 'string' &&
      file.dataURL.startsWith('data:')
  );
};

// Leave room for the broadcast envelope above the encoded files payload.
const BOARD_FILES_PAYLOAD_BYTES = 200_000;

// Keep each broadcast below the byte limit even when several pictures are pasted together.
export const batchBoardFiles = (files: BinaryFileData[]): BinaryFileData[][] => {
  const encoder = new TextEncoder();
  const emptyPayloadBytes = '{"files":[]}'.length;
  const batches: BinaryFileData[][] = [];
  let batch: BinaryFileData[] = [];
  let bytes = emptyPayloadBytes;
  for (const file of files) {
    const size = encoder.encode(JSON.stringify(file)).length;
    if (size + emptyPayloadBytes > BOARD_FILES_PAYLOAD_BYTES) continue;
    if (batch.length && bytes + size + 1 > BOARD_FILES_PAYLOAD_BYTES) {
      batches.push(batch);
      batch = [];
      bytes = emptyPayloadBytes;
    }
    bytes += size + (batch.length ? 1 : 0);
    batch.push(file);
  }
  if (batch.length) batches.push(batch);
  return batches;
};

// Where someone's pointer is; undefined when the message has no usable position.
export const asPointer = (value: unknown): Collaborator['pointer'] => {
  if (!isObject(value) || typeof value.x !== 'number' || typeof value.y !== 'number')
    return undefined;
  return { x: value.x, y: value.y, tool: value.tool === 'laser' ? 'laser' : 'pointer' };
};

// Whether that person is pressing: Excalidraw draws the pointer differently.
export const asPointerButton = (value: unknown): Collaborator['button'] =>
  value === 'down' ? 'down' : 'up';

/** A board as saved on this device (one a day), with its shapes and pictures checked like the
    ones that come from another device. */
export interface SavedBoard {
  elements: SharedElement[];
  files: Record<string, BinaryFileData>;
}
// The board saved on this device; null when nothing usable was saved.
export const asSavedBoard = (raw: unknown): SavedBoard | null => {
  if (!isObject(raw)) return null;
  const files = asSharedFiles(Object.values(isObject(raw.files) ? raw.files : {}));
  return {
    elements: asSharedElements(raw.elements),
    files: Object.fromEntries(files.map((file) => [file.id, file])),
  };
};
