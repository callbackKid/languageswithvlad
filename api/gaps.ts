import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkAccess, claudeJSON, fail, onlyPost, FAST_MODEL } from "./_lib/claude.js";
import { gapPrompt } from "./_lib/prompts.js";

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!onlyPost(request, response) || !checkAccess(request, response)) return;
  const raw: unknown[] = Array.isArray(request.body?.words) ? request.body.words : [];
  const words = raw.slice(0, 30)
    .map(word => word as { fr?: unknown; ru?: unknown })
    .map(word => ({ fr: String(word.fr ?? "").slice(0, 80), ru: String(word.ru ?? "").slice(0, 120) }))
    .filter(word => word.fr);
  if (!words.length) return response.status(400).json({ error: "No words." });
  const count = Math.min(8, Math.max(4, words.length));
  const language = request.body?.language === "en" ? "en" : "fr";
  try {
    // Fresh sentences every time, so no caching.
    response.status(200).json(await claudeJSON(gapPrompt(words, count, language), { model: FAST_MODEL, maxTokens: 3000, cache: false }));
  } catch (error) { fail(response, error); }
}
