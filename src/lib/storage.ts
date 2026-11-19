const PREFIX = 'cahier-fr:';
export function load<T>(key: string): T | null {
  try {
    const stored = localStorage.getItem(PREFIX + key);
    return stored ? (JSON.parse(stored) as T) : null;
  } catch {
    return null;
  }
}
export function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage full or blocked */
  }
}
export function remove(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}

// A saved list of texts (ticked homework tasks): anything else in it is dropped.
export function loadTexts(key: string): string[] {
  const stored = load<unknown>(key);
  return Array.isArray(stored)
    ? stored.filter((item): item is string => typeof item === 'string')
    : [];
}

/** A saved value passed through a check (a normalizeX or asX function): null when nothing is
    saved, or when what is saved can't be used (an older shape, a value edited by hand). */
export function loadChecked<T>(key: string, check: (raw: unknown) => T | null): T | null {
  const stored = load<unknown>(key);
  if (stored == null) return null;
  try {
    return check(stored);
  } catch {
    return null;
  }
}

type FieldKind = 'string' | 'number';
type Fields<Shape extends Record<string, FieldKind>> = {
  [Key in keyof Shape]: Shape[Key] extends 'string' ? string : number;
};
/** An object with these fields of these kinds ({ title: 'string', at: 'number' }), or null when
    one is missing or of another kind. Other fields are dropped. */
export function asFields<Shape extends Record<string, FieldKind>>(
  raw: unknown,
  shape: Shape
): Fields<Shape> | null {
  if (!raw || typeof raw !== 'object') return null;
  const source = raw as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [field, kind] of Object.entries(shape)) {
    if (typeof source[field] !== kind) return null;
    out[field] = source[field];
  }
  // every field of the shape was checked to be of its kind just above
  return out as Fields<Shape>;
}

// The items of a saved list that pass the check; [] when nothing usable is saved.
export function asList<T>(raw: unknown, check: (item: unknown) => T | null): T[] {
  return (Array.isArray(raw) ? raw : []).map(check).filter((item): item is T => item !== null);
}
