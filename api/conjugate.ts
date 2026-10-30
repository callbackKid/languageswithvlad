import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkAccess, claudeJSON, fail, onlyPost, MODEL } from "./_lib/claude.js";
import { conjPrompt } from "./_lib/prompts.js";

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!onlyPost(request, response) || !checkAccess(request, response)) return;
  const infinitive = typeof request.body?.inf === "string" ? request.body.inf.trim() : "";
  const ru = typeof request.body?.ru === "string" ? request.body.ru.trim().slice(0, 100) : "";
  if (!infinitive || infinitive.length > 60) return response.status(400).json({ error: "Bad verb." });
  try {
    response.status(200).json(await claudeJSON(conjPrompt(infinitive, ru), { model: MODEL, maxTokens: 3000 }));
  } catch (error) { fail(response, error); }
}
