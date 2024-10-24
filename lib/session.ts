"use server";
import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId, expiresAt });

  cookies().set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
  });
}

export async function deleteSession() {
  "use server";
  cookies().delete("session");
}

type SessionPayload = {
  userId: string;
  expiresAt: Date;
};

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(
  session?: string,
): Promise<SessionPayload | null> {
  try {
    const cookieStore = cookies();
    const sessionCookie = session || cookieStore.get("session")?.value;

    if (!sessionCookie) {
      return null;
    }

    const { payload } = await jwtVerify(sessionCookie, encodedKey, {
      algorithms: ["HS256"],
    });

    return {
      userId: String(payload.userId),
      expiresAt: new Date(payload.expiresAt as string),
    };
  } catch (error) {
    console.error("Failed to verify session:", error);
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const sessionCookie = cookies().get("session");
    if (!sessionCookie) {
      return null;
    }

    const session = await decrypt(sessionCookie.value);
    if (!session) {
      return null;
    }

    if (new Date() > session.expiresAt) {
      await deleteSession();
      return null;
    }

    return session;
  } catch (error) {
    console.error("Failed to get session:", error);
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await getSession();
    return session !== null;
  } catch {
    return false;
  }
}

export async function refreshSession(userId: string) {
  try {
    await deleteSession();
    return await createSession(userId);
  } catch (error) {
    console.error("Failed to refresh session:", error);
    return { success: false, error: "Failed to refresh session" };
  }
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
