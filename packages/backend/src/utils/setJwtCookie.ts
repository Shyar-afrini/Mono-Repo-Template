import type { Response } from "express";

export function setJwtCookie(
  res: Response,
  token: string,
  maxAgeMs?: number,
  cookieName?: string,
  domain?: string
) {
  res.cookie(cookieName ?? "session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    domain: domain || (process.env.NODE_ENV === "production" ? undefined : "localhost"),
    ...(maxAgeMs ? { maxAge: maxAgeMs } : {}),
    priority: "high",
  });
}
