import type { Request } from "express";

/**
 * Lee el JWT de Authorization (Bearer), X-Access-Token o cookie app_token.
 * Bearer es case-insensitive; tolera espacios (algunos proxies/clientes).
 */
export function extractAccessToken(req: Request): string | undefined {
  const raw = req.headers.authorization;
  if (typeof raw === "string" && raw.length > 0) {
    const trimmed = raw.trim();
    const m = /^Bearer\s+(\S+)/i.exec(trimmed);
    if (m?.[1]) return m[1].trim();
  }

  const alt = req.headers["x-access-token"];
  if (typeof alt === "string" && alt.trim()) return alt.trim();

  const cookie = req.cookies?.app_token;
  if (typeof cookie === "string" && cookie.trim()) return cookie.trim();

  return undefined;
}
