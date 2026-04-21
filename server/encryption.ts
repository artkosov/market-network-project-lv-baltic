/**
 * encryption.ts — AES-256-GCM PII field encryption
 *
 * Privacy by Design principle: all personally identifiable information (PII)
 * is encrypted at rest using AES-256-GCM before being written to the database.
 * The encryption key is derived from JWT_SECRET (server-side only, never exposed
 * to the client). Each encrypted value carries its own random IV and auth tag,
 * so even identical plaintext values produce different ciphertext.
 *
 * Format stored in DB: "iv:authTag:ciphertext" (all base64-encoded)
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const AUTH_TAG_LENGTH = 16;
const SEPARATOR = ":";

/**
 * Derive a 32-byte AES key from the JWT_SECRET environment variable.
 * Uses SHA-256 so any length secret produces a valid 256-bit key.
 */
function getDerivedKey(): Buffer {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("[Encryption] JWT_SECRET is not set. Cannot derive encryption key.");
  }
  return createHash("sha256").update(secret).digest();
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a compact "iv:authTag:ciphertext" string safe for DB storage.
 * Returns null if input is null/undefined.
 */
export function encryptField(plaintext: string | null | undefined): string | null {
  if (plaintext === null || plaintext === undefined) return null;
  if (plaintext === "") return "";

  const key = getDerivedKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(SEPARATOR);
}

/**
 * Decrypt a value previously encrypted with encryptField().
 * Returns null if input is null/undefined or empty.
 * Throws if the ciphertext has been tampered with (auth tag mismatch).
 */
export function decryptField(ciphertext: string | null | undefined): string | null {
  if (ciphertext === null || ciphertext === undefined) return null;
  if (ciphertext === "") return "";

  // If the value doesn't look like our encrypted format, return as-is
  // (handles migration of legacy plaintext values)
  const parts = ciphertext.split(SEPARATOR);
  if (parts.length !== 3) return ciphertext;

  try {
    const key = getDerivedKey();
    const iv = Buffer.from(parts[0]!, "base64");
    const authTag = Buffer.from(parts[1]!, "base64");
    const encryptedData = Buffer.from(parts[2]!, "base64");

    const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    return decrypted.toString("utf8");
  } catch (err) {
    console.error("[Encryption] Decryption failed — possible tampering or key mismatch:", err);
    throw new Error("Datu atšifrēšana neizdevās. Sazinieties ar atbalstu.");
  }
}

/**
 * Encrypt an object's specified fields in place.
 * Returns a new object with the listed fields encrypted.
 */
export function encryptFields<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj };
  for (const field of fields) {
    const value = result[field];
    if (typeof value === "string" || value === null || value === undefined) {
      (result as Record<string, unknown>)[field as string] = encryptField(value as string | null | undefined);
    }
  }
  return result;
}

/**
 * Decrypt an object's specified fields in place.
 * Returns a new object with the listed fields decrypted.
 */
export function decryptFields<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj };
  for (const field of fields) {
    const value = result[field];
    if (typeof value === "string" || value === null || value === undefined) {
      (result as Record<string, unknown>)[field as string] = decryptField(value as string | null | undefined);
    }
  }
  return result;
}

/**
 * Generate a stable pseudonymous ID for a candidate.
 * Used in employer-facing views to identify candidates without revealing their real ID.
 * The pseudonym is deterministic (same candidate always gets same pseudonym) but
 * cannot be reversed to find the real user ID without the secret key.
 */
export function generatePseudonymousId(candidateId: number): string {
  const key = getDerivedKey();
  const hash = createHash("sha256")
    .update(key)
    .update(String(candidateId))
    .digest("hex")
    .slice(0, 12)
    .toUpperCase();
  return `KND-${hash}`;
}

// PII fields that must be encrypted in candidateProfiles
export const CANDIDATE_PII_FIELDS = ["fullName", "phone"] as const;

// PII fields that must be encrypted in employerProfiles
export const EMPLOYER_PII_FIELDS = ["contactEmail", "contactPhone"] as const;
