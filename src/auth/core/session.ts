import { userRoles } from "@/drizzle/schema";
import z from "zod";
import crypto from "crypto";
import { redis } from "@/redis/redis";

const SESSION_EXPIRATION_SECONDS = 60 * 60 * 24 * 7;
const COOKIE_SESSION_KEY = "session_id";

const sessionSchema = z.object({
  id: z.string(),
  role: z.enum(userRoles),
});

export type Cookies = {
  set: (
    key: string,
    value: string,
    options: {
      secure?: boolean;
      httpOnly?: boolean;
      sameSite?: "strict" | "lax";
      expires?: number;
    },
  ) => void;
  get: (key: string) => { name: string; value: string } | undefined;
  delete: (key: string) => void;
};

type UserSession = z.infer<typeof sessionSchema>;

export async function createUserSession(
  user: UserSession,
  cookies: Pick<Cookies, "set">,
) {
  const sessionId = crypto.randomBytes(64).toString("hex").normalize();
  const sessionData = JSON.stringify(sessionSchema.parse(user));
  await redis.set(
    `session:${sessionId}`,
    sessionData,
    "EX",
    SESSION_EXPIRATION_SECONDS,
  );

  setCookie(sessionId, cookies);
}

function setCookie(sessionId: string, cookies: Pick<Cookies, "set">) {
  cookies.set(COOKIE_SESSION_KEY, sessionId, {
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    expires: Date.now() + SESSION_EXPIRATION_SECONDS * 1000,
  });
}

export async function getUserFromSession(cookies: Pick<Cookies, "get">) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;

  if (sessionId == null) return null;

  return getUserFromSessionById(sessionId);
}

async function getUserFromSessionById(sessionId: string) {
  const rawUserJSON = await redis.get(`session:${sessionId}`);

  if (!rawUserJSON) return null;

  const rawUser = JSON.parse(rawUserJSON);

  const { success, data: user } = sessionSchema.safeParse(rawUser);

  return success ? user : null;
}

export async function removeUserFromSession(
  cookies: Pick<Cookies, "get" | "delete">,
) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;

  if (sessionId == null) return null;

  await redis.del(`session:${sessionId}`);
  cookies.delete(COOKIE_SESSION_KEY);
}

export async function updateUserSessionData(
  user: UserSession,
  cookies: Pick<Cookies, "get">,
) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;

  if (sessionId == null) return null;

  const sessionData = JSON.stringify(sessionSchema.parse(user));
  await redis.set(
    `session:${sessionId}`,
    sessionData,
    "EX",
    SESSION_EXPIRATION_SECONDS,
  );
}

export async function updateUserSessionExpiration(cookies: Cookies) {
  // Get session from cookies
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;
  if (sessionId == null) return null;

  const result = await redis.expire(
    `session:${sessionId}`,
    SESSION_EXPIRATION_SECONDS,
  );
  if (result === 0) {
    // Session didn't exist in Redis, maybe expired between requests
    // Should treat it as logged out, and delete the cookies
    console.log("session id not found");
    // Optional, consider to delete cookie if session is gone
    cookies.delete(COOKIE_SESSION_KEY);
    return null;
  }

  setCookie(sessionId, cookies);
}
