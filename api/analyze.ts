import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkAccess, claudeJSON, fail, onlyPost, MODEL } from "./_lib/claude.js";
import { analysisPrompt } from "./_lib/prompts.js";

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!onlyPost(request, response) || !checkAccess(request, response)) return;
  const body = typeof request.body?.body === "string" ? request.body.body : "";
  if (!body.trim()) return response.status(400).json({ error: "Empty lesson." });
  if (body.length > 20000) return response.status(413).json({ error: "This lesson is too long to analyze in one go." });
  try {
    const fresh = request.body?.fresh === true;
    response.status(200).json(await claudeJSON(analysisPrompt(body), { model: MODEL, maxTokens: 16000, cache: !fresh }));
  } catch (error) { fail(response, error); }
}
