import type { VercelRequest, VercelResponse } from "@vercel/node";

/** Lets the app know whether it should ask students for an access code. */
export default function handler(_request: VercelRequest, response: VercelResponse) {
  response.status(200).json({ needsCode: !!process.env.APP_ACCESS_CODE, ai: !!process.env.ANTHROPIC_API_KEY });
}
