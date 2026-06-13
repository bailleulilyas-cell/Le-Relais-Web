import { cookies } from "next/headers";
import {
  signSession,
  verifyToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  type SessionPayload,
} from "./jwt";

export type { SessionPayload };

export async function createSession(payload: SessionPayload) {
  const token = await signSession(payload);
  const c = await cookies();
  c.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function destroySession() {
  const c = await cookies();
  c.delete(SESSION_COOKIE);
}
