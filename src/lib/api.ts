import { load } from "./storage";
import type { Language } from "./types";

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  const code = load<string>("code");
  if (code) headers["x-access-code"] = code;
  let response: Response;
  try { response = await fetch(path, { ...init, headers }); }
  catch { throw new ApiError(0, "offline", "No connection. Check your internet and try again."); }
  const data = await response.json().catch(() => null);
  // Vite alone (yarn dev) answers /api/* with index.html and a 200.
  if (response.ok && data === null) throw new ApiError(response.status, "no_api", "The server isn’t running. Start the app with yarn start.");
  if (!response.ok) {
    const errorCode = (data as { error?: string } | null)?.error || "";
    throw new ApiError(response.status, errorCode, messageFor(response.status, errorCode));
  }
  return data as T;
}

function messageFor(status: number, errorCode: string): string {
  if (status === 401) { window.dispatchEvent(new Event("cahier:need-code")); return "Enter the class code to continue."; }
  if (errorCode === "not_shared") return "This document isn’t shared. In Google Docs, choose Share → General access → Anyone with the link, then try again.";
  if (errorCode === "not_found") return "No Google Doc was found at that link.";
  if (errorCode === "bad_id") return "That doesn’t look like a Google Docs link.";
  if (errorCode === "unreachable") return "Google Docs didn’t answer. Try again in a moment.";
  return errorCode && errorCode.length > 3 && !/^[a-z_]+$/.test(errorCode) ? errorCode : "Something went wrong. Try again.";
}

// Identical analyses already on their way share one request (the lesson page and the
// word bank can ask for the same lesson at once; React's dev mode runs effects twice).
const inflight = new Map<string, Promise<unknown>>();
function analyzeOnce(body: string, fresh: boolean): Promise<unknown> {
  const cacheKey = (fresh ? "1:" : "0:") + body;
  let pending = inflight.get(cacheKey);
  if (!pending) {
    pending = request<unknown>("/api/analyze", { method: "POST", body: JSON.stringify({ body, fresh }) }).finally(() => inflight.delete(cacheKey));
    inflight.set(cacheKey, pending);
  }
  return pending;
}

export const api = {
  health: () => request<{ needsCode: boolean; ai: boolean }>("/api/health"),
  doc: (id: string) => request<{ title: string; text: string }>(`/api/doc?id=${encodeURIComponent(id)}`),
  analyze: (body: string, fresh = false) => analyzeOnce(body, fresh),
  conjugate: (infinitive: string, ru: string) => request<unknown>("/api/conjugate", { method: "POST", body: JSON.stringify({ inf: infinitive, ru }) }),
  gaps: (words: { fr: string; ru: string }[], language: Language) => request<unknown>("/api/gaps", { method: "POST", body: JSON.stringify({ words, language }) }),
};
