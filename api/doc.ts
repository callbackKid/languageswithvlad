import type { VercelRequest, VercelResponse } from "@vercel/node";

/** Reads a Google Doc shared as "Anyone with the link can view" as plain text. */
export default async function handler(request: VercelRequest, response: VercelResponse) {
  const id = String(request.query.id || "");
  // Only real Docs ids reach the outgoing URL.
  if (!/^[a-zA-Z0-9_-]{20,100}$/.test(id)) return response.status(400).json({ error: "bad_id" });

  try {
    const googleResponse = await fetch(`https://docs.google.com/document/d/${encodeURIComponent(id)}/export?format=txt`, { redirect: "follow" });
    const type = googleResponse.headers.get("content-type") || "";
    if (googleResponse.status === 404) return response.status(404).json({ error: "not_found" });
    // A private doc redirects to Google's sign-in page instead of returning text.
    if (!googleResponse.ok || type.includes("text/html") || googleResponse.url.includes("accounts.google.com")) {
      return response.status(403).json({ error: "not_shared" });
    }
    const text = (await googleResponse.text()).replace(/^\uFEFF/, "");
    const disposition = googleResponse.headers.get("content-disposition") || "";
    const match = disposition.match(/filename\*=UTF-8''([^;]+)/i) || disposition.match(/filename="([^"]+)"/i);
    let title = "";
    if (match) { try { title = decodeURIComponent(match[1]); } catch { title = match[1]; } title = title.replace(/\.txt$/i, ""); }
    response.setHeader("Cache-Control", "no-store");
    return response.status(200).json({ title, text });
  } catch (error) {
    console.error(error);
    return response.status(502).json({ error: "unreachable" });
  }
}
