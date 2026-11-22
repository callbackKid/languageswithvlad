import { asText } from './util';

type JsonObject = Record<string, unknown>;

// The fields of an answer's object, or {} when it isn't one (null, a string, a number).
export const asObject = (value: unknown): JsonObject =>
  value && typeof value === 'object' ? (value as JsonObject) : {};

// A list, or an empty list for anything else.
export const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

// The non-empty strings of a list.
export const asTexts = (value: unknown): string[] => asArray(value).map(asText).filter(Boolean);

// Picks string fields out of an answer, "" for anything missing.
export function asObjectText<K extends string>(raw: unknown, keys: K[]): Record<K, string> {
  const object = asObject(raw);
  return Object.fromEntries(keys.map((key) => [key, asText(object[key])])) as Record<K, string>;
}
