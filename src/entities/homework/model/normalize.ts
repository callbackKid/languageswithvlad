import { asArray, asObject } from '@/shared/lib/json';
import { asText } from '@/shared/lib/util';

import { type Writing, type WritingCheck } from './types';

// Claude's check of a written answer; null when the reply has no corrected text.
export const normalizeWritingCheck = (raw: unknown): WritingCheck | null => {
  const data = asObject(raw);
  const corrected = asText(data.corrected);
  if (!corrected) return null;
  return {
    corrected,
    mistakes: asArray(data.mistakes)
      .map(asObject)
      .map((mistake) => ({
        wrong: asText(mistake.wrong),
        right: asText(mistake.right),
        why: asText(mistake.why),
      }))
      .filter((mistake) => mistake.wrong || mistake.right),
    comment: asText(data.comment),
  };
};

// A written homework answer as saved on the device; null when it has no task.
export const normalizeWriting = (raw: unknown): Writing | null => {
  const data = asObject(raw);
  const task = asText(data.task);
  if (!task) return null;
  const check = data.check === undefined ? null : normalizeWritingCheck(data.check);
  return {
    task,
    text: typeof data.text === 'string' ? data.text : '',
    ...(check && { check }),
    ...(typeof data.checkedText === 'string' && { checkedText: data.checkedText }),
    ...(typeof data.checkedAt === 'number' && { checkedAt: data.checkedAt }),
  };
};
