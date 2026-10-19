const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";
const SECRET = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || "mahdiya-portal-secure-key-2024";
const SECRET_KEY = crypto.scryptSync(SECRET, "mahdiya_portal_salt", 32);

/**
 * Encrypt a plain-text password using AES-256-GCM.
 * Returns formatted string: iv:authTag:encryptedHex
 */
function encryptPassword(plainText) {
  if (!plainText) return "";
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(String(plainText), "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${tag}:${encrypted}`;
}

/**
 * Decrypt an AES-256-GCM encrypted password string.
 * Falls back to "1986" if string is empty, invalid, or legacy default.
 */
function decryptPassword(cipherText) {
  if (!cipherText) return "1986";
  try {
    const parts = String(cipherText).split(":");
    if (parts.length !== 3) {
      // If it's stored as plain or legacy, return as-is or fallback to 1986
      return cipherText.startsWith("$2") ? "1986" : cipherText;
    }
    const [ivHex, tagHex, dataHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(dataHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted || "1986";
  } catch (err) {
    return "1986";
  }
}

module.exports = {
  encryptPassword,
  decryptPassword,
};
