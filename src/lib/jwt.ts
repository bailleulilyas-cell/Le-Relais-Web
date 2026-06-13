import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "lrw_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

export type SessionPayload = {
  userId: number;
  role: "client" | "admin";
  prenom: string;
};

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET manquant.");
  return new TextEncoder().encode(s);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret());
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
