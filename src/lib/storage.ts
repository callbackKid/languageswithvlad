const PREFIX = "cahier-fr:";
export function load<T>(key: string): T | null {
  try { const stored = localStorage.getItem(PREFIX + key); return stored ? (JSON.parse(stored) as T) : null; } catch { return null; }
}
export function save(key: string, value: unknown): void {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch { /* storage full or blocked */ }
}
export function remove(key: string): void {
  try { localStorage.removeItem(PREFIX + key); } catch { /* ignore */ }
}
