import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "node:crypto";

// AES-256-GCM encryption helpers for short strings (e.g., S3 keys)
// Encodes output as base64url segments: iv.ciphertext.tag

function getKey(secret?: string): Buffer {
  const s = (secret ?? process.env.FILES_ENCRYPTION_SECRET ?? "").trim();
  if (!s) {
    throw new Error("FILES_ENCRYPTION_SECRET is not set");
  }
  // Derive 32-byte key from the secret
  return scryptSync(s, "um-files", 32);
}

export function encryptText(plainText: string, secret?: string): string {
  const key = getKey(secret);
  const iv = randomBytes(12); // 96-bit IV for GCM
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    iv.toString("base64url"),
    enc.toString("base64url"),
    tag.toString("base64url"),
  ].join(".");
}

export function decryptText(cipherText: string, secret?: string): string {
  const key = getKey(secret);
  const [ivB64, dataB64, tagB64] = cipherText.split(".");
  if (!ivB64 || !dataB64 || !tagB64) {
    throw new Error("Invalid encrypted payload");
  }
  const iv = Buffer.from(ivB64, "base64url");
  const data = Buffer.from(dataB64, "base64url");
  const tag = Buffer.from(tagB64, "base64url");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString("utf8");
}
