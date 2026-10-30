import type { VercelRequest, VercelResponse } from "@vercel/node";

const API_URL = "https://api.anthropic.com/v1/messages";
export const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-5-5";
export const FAST_MODEL = process.env.CLAUDE_FAST_MODEL || "claude-haiku-5-5";

/** Rejects requests without the shared access code (when one is configured). */
export function checkAccess(request: VercelRequest, response: VercelResponse): boolean {
  const code = process.env.APP_ACCESS_CODE;
  if (!code) return true;
  if (request.headers["x-access-code"] === code) return true;
  response.status(401).json({ error: "access_code" });
  return false;
}

export function onlyPost(request: VercelRequest, response: VercelResponse): boolean {
  if (request.method === "POST") return true;
  response.setHeader("Allow", "POST");
  response.status(405).json({ error: "method" });
  return false;
}

/* Small in-memory cache: warm instances skip repeated identical prompts
   (many students opening the same lesson or the same verb). */
const cache = new Map<string, unknown>();
const MAX_CACHE = 500;

export class ClaudeError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function claudeJSON(prompt: string, options: { model?: string; maxTokens?: number; cache?: boolean } = {}): Promise<unknown> {
  const model = options.model || MODEL;
  const key = model + "\u0000" + prompt;
  if (options.cache !== false && cache.has(key)) return cache.get(key);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new ClaudeError(500, "ANTHROPIC_API_KEY is not set on the server.");

  const apiResponse = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: options.maxTokens ?? 4000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!apiResponse.ok) {
    const detail = await apiResponse.text().catch(() => "");
    console.error("Claude API error", apiResponse.status, detail.slice(0, 500));
    if (apiResponse.status === 429 || apiResponse.status === 529) throw new ClaudeError(503, "Claude is busy. Try again in a minute.");
    throw new ClaudeError(502, "Claude request failed.");
  }
  const data = (await apiResponse.json()) as { content?: { type: string; text?: string }[] };
  const text = (data.content || []).filter(block => block.type === "text").map(block => block.text || "").join("\n");
  const value = extractJSON(text);
  if (value === undefined) throw new ClaudeError(502, "Claude’s answer could not be read.");

  if (options.cache !== false) {
    if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value as string);
    cache.set(key, value);
  }
  return value;
}

export function extractJSON(text: string): unknown {
  const trimmed = text.trim();
  const tries = [trimmed];
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) tries.push(fence[1]);
  const first = trimmed.search(/[[{]/);
  const last = Math.max(trimmed.lastIndexOf("}"), trimmed.lastIndexOf("]"));
  if (first >= 0 && last > first) tries.push(trimmed.slice(first, last + 1));
  for (const candidate of tries) { try { return JSON.parse(candidate); } catch { /* next */ } }
  return undefined;
}

export function fail(response: VercelResponse, error: unknown) {
  if (error instanceof ClaudeError) return response.status(error.status).json({ error: error.message });
  console.error(error);
  return response.status(500).json({ error: "Something went wrong on the server." });
}
