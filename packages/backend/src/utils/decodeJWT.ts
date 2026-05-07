import jwt from "jsonwebtoken";
import { AnyClaims, JWT_AUDIENCE, JWT_ISSUER, JWT_SECRET } from "./jwt";

export function verifyJWT(token: string): AnyClaims | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as AnyClaims;

    // basic sanity: role + sub
    if (
      !decoded?.sub ||
      decoded.role !== "admin") {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}
