// utils/auth/cookies.ts
import type { CookieOptions, Response } from "express";

export function clearJwtCookies(res: Response, opts?: { isProd?: boolean; domain?: string }) {
  const isProd = opts?.isProd ?? process.env.NODE_ENV === "production";
  const base = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    ...(opts?.domain ? { domain: opts.domain } : {}),
  } satisfies CookieOptions;

  // Current name (recommended)
  res.cookie("session", "", { ...base, maxAge: 0 });
  // Legacy/alt name (if you ever used it)
  res.cookie("session_token", "", { ...base, maxAge: 0 });
}
