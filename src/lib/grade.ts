export type Grade = "ok" | "accent" | "bad" | "empty";

const strip = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const normalize = (text: string) => String(text || "").toLowerCase().replace(/[’`ʼ]/g, "'").replace(/\s+/g, " ").trim();

/** "allé(e)s" → allés, allées … every optional part on or off. */
function variants(answer: string): string[] {
  const normalized = normalize(answer);
  const match = normalized.match(/\(([^)]*)\)/);
  if (!match || match.index === undefined) return [normalized];
  const before = normalized.slice(0, match.index), after = normalized.slice(match.index + match[0].length);
  return [...variants(before + after), ...variants(before + match[1] + after)];
}

export function grade(input: string, answer: string, pronoun = ""): Grade {
  let typed = normalize(input);
  if (!typed) return "empty";
  for (const part of normalize(pronoun).split("/").filter(Boolean)) {
    if (part.endsWith("'") && typed.startsWith(part)) { typed = typed.slice(part.length).trim(); break; }
    if (typed.startsWith(part + " ")) { typed = typed.slice(part.length + 1).trim(); break; }
  }
  const accepted = variants(answer).map(variant => variant.replace(/\s+/g, " ").trim());
  if (accepted.includes(typed)) return "ok";
  if (accepted.some(variant => strip(variant) === strip(typed))) return "accent";
  return "bad";
}
