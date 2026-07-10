import crypto from "crypto";

export function generateAccessToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function generateRefreshToken() {
  return crypto.randomBytes(48).toString("hex");
}