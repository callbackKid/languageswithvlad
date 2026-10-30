export const shuffle = <T,>(items: readonly T[]): T[] => {
  const copy = items.slice();
  for (let index = copy.length - 1; index > 0; index--) { const other = Math.floor(Math.random() * (index + 1)); [copy[index], copy[other]] = [copy[other], copy[index]]; }
  return copy;
};
export const hash = (text: string): string => {
  let digest = 5381;
  for (let index = 0; index < text.length; index++) digest = ((digest << 5) + digest + text.charCodeAt(index)) | 0;
  return (digest >>> 0).toString(36);
};
export const asText = (value: unknown): string => (typeof value === "string" ? value.trim() : "");
export const plural = (count: number, one: string, many = one + "s") => `${count} ${count === 1 ? one : many}`;
