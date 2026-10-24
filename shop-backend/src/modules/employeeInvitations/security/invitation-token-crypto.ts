
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const encodedKey = process.env.INVITATION_TOKEN_ENCRYPTION_KEY;

  if (!encodedKey) {
    throw new Error(
      "INVITATION_TOKEN_ENCRYPTION_KEY is not configured",
    );
  }

  const key = Buffer.from(encodedKey, "base64");

  if (
    key.length !== 32 ||
    key.toString("base64") !== encodedKey
  ) {
    throw new Error(
      "INVITATION_TOKEN_ENCRYPTION_KEY must be a valid base64-encoded 32-byte key",
    );
  }

  return key;
}

/**
 * Output format:
 * v1:base64(iv):base64(authTag):base64(ciphertext)
 */
export function encryptInvitationToken(
  rawToken: string,
): string {
  if (!rawToken) {
    throw new Error("Cannot encrypt an empty invitation token");
  }

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(
    ALGORITHM,
    getEncryptionKey(),
    iv,
  );

  const ciphertext = Buffer.concat([
    cipher.update(rawToken, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    "v1",
    iv.toString("base64"),
    authTag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(":");
}


export function decryptInvitationToken(
  encryptedToken: string,
): string {
  const parts = encryptedToken.split(":");

  if (parts.length !== 4 || parts[0] !== "v1") {
    throw new Error(
      "Unsupported encrypted invitation token format",
    );
  }

  const encodedIv = parts[1];
  const encodedTag = parts[2];
  const encodedCiphertext = parts[3];

  // Explicit checks narrow each value from string | undefined to string.
  if (!encodedIv || !encodedTag || !encodedCiphertext) {
    throw new Error("Invalid encrypted invitation token");
  }

  const iv = Buffer.from(encodedIv, "base64");
  const authTag = Buffer.from(encodedTag, "base64");
  const ciphertext = Buffer.from(encodedCiphertext, "base64");

  if (
    iv.length !== 12 ||
    authTag.length !== 16 ||
    ciphertext.length === 0
  ) {
    throw new Error("Invalid encrypted invitation token");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    iv,
  );

  decipher.setAuthTag(authTag);

  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return plaintext.toString("utf8");
}
