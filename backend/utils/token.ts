import crypto from "crypto";

export function generateToken(): string {
  return crypto.randomBytes(16).toString("hex");
}
