import type { Request } from "express";

function readQueryToken(req: Request): string | undefined {
  if (req.method !== "GET" && req.method !== "HEAD") return undefined;
  const q = req.query;
  const raw =
    (typeof q.access_token === "string" && q.access_token) ||
    (typeof q.token === "string" && q.token);
  if (!raw) return undefined;
  const t = raw.trim();
  return t || undefined;
}

/**
 * Lee el JWT de Authorization (Bearer), X-Access-Token, cookie app_token,
 * o en GET/HEAD query access_token|token (fallback si el header no llega en cross-origin).
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

  return readQueryToken(req);
}
