import crypto from "crypto";
import { promisify } from "util";
import * as argon2 from "node-argon2";

const scryptAsync = promisify(crypto.scrypt);

export async function hashPassword(password: string, salt: string) {
  const normalizedPassword = password.normalize();
  const derivedKey = (await scryptAsync(
    normalizedPassword,
    salt,
    64,
  )) as Buffer;
  return derivedKey.toString("hex");
}

export function generateSalt() {
  return crypto.randomBytes(16).toString("hex").normalize();
}

export async function comparePasswords({
  password,
  salt,
  hashedPassword,
}: {
  password: string;
  salt: string;
  hashedPassword: string;
}) {
  const inputHashedPassword = await hashPassword(password, salt);

  return crypto.timingSafeEqual(
    Buffer.from(inputHashedPassword, "hex"),
    Buffer.from(hashedPassword, "hex"),
  );
}

export async function hashPasswordArgon(password: string) {
  const hashedPassword = await argon2.hash(password);

  return hashedPassword;
}

export async function verifyPassword(hashedPassword: string, password: string) {
  const result = await argon2.verify({
    hash: hashedPassword, // value retrieved from user database,
    password: password, // value from the login form,
  });

  return result;
}
