import jwt, { SignOptions } from "jsonwebtoken";
import ms, { StringValue } from "ms";
import {
  AnyClaims,
  JWT_AUDIENCE,
  JWT_EXPIRE, // e.g. '7d'
  JWT_ISSUER,
  JWT_SECRET,
  Role,
} from "./jwt";

// Return type matches jsonwebtoken's SignOptions.expiresIn typing
function normalizeExpires(input?: string | number): number | StringValue {
  const val = input ?? JWT_EXPIRE;

  if (typeof val === "number") {
    if (!Number.isFinite(val) || val <= 0) {
      throw new Error(`Invalid expires number "${val}". Use seconds > 0.`);
    }
    return Math.floor(val); // seconds
  }

  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) throw new Error("Invalid expires: empty string");
    const msVal = ms(trimmed as StringValue);
    if (!msVal || msVal <= 0) {
      throw new Error(
        `Invalid expires string "${val}". Use "5m", "2h", "7d", etc.`
      );
    }
    // validated timespan string; assert to StringValue
    return trimmed as StringValue;
  }

  throw new Error(
    `Invalid expires type: ${typeof val}. Set JWT_EXPIRE (e.g., "7d") or pass expires.`
  );
}

export function createJWT(
  role: Role,
  subjectId: string,
  opts: {
    fullname?: string;
    isActive?: boolean | null;
    email?: string;
    expires?: string | number; // '7d' | '12h' | seconds
  } = {}
): string {
  const { fullname, isActive, email, expires, } =
    opts;

  // For otp_access role, default to 10 minutes if no expires provided
  const expiresIn = normalizeExpires(expires ?? undefined); // type: number | StringValue

  // Keep 'sub' in the payload to satisfy AnyClaims (your AdminClaims requires it)
  const payload: AnyClaims = {
    sub: subjectId,
    role,
    ...(fullname ? { fullname } : {}),
    ...(typeof isActive === "boolean" ? { isActive } : {}),
    ...(role === "admin" && email ? { email } : {}),
  } as AnyClaims;

  // Do NOT also set 'subject' here to avoid conflicts with payload.sub
  const signOptions: SignOptions = {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    expiresIn, // number | StringValue ✅
    algorithm: "HS256",
  };

  return jwt.sign(payload, JWT_SECRET, signOptions);
}
