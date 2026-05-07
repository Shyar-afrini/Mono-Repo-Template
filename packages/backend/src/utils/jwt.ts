import { JwtPayload, Secret } from "jsonwebtoken";
import { JWT_EXPIRE as CONST_JWT_EXPIRE } from "./constants";

export const JWT_SECRET = (process.env.JWT_SECRET_KEY ?? "") as Secret;
export const JWT_ISSUER = process.env.JWT_ISSUER ?? "primary-backend";
export const JWT_AUDIENCE = process.env.JWT_AUDIENCE ?? "primary-clients";
// e.g. '7d' or '12h' in env; fallback:
export const JWT_EXPIRE = process.env.JWT_EXPIRE ?? CONST_JWT_EXPIRE;

export type Role = "admin";

export interface BaseClaims extends JwtPayload {
  sub: string; // subject: user/admin id
  role: Role; // discriminator
  fullname?: string;
  isActive?: boolean;
  iat?: number;
  exp?: number;
}

export interface AdminClaims extends BaseClaims {
  role: "admin";
  email?: string;
}

export type AnyClaims = AdminClaims;
