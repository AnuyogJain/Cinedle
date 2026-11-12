import "server-only";

import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { sessions, users } from "@/lib/db/schema";
import { SESSION_COOKIE, SESSION_TTL_MS } from "./constants";

export interface SessionUser {
  id: string;
  displayName: string;
  username: string;
}

function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export async function createSession(userId: string): Promise<string> {
  const id = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(sessions).values({
    id,
    userId,
    expiresAt,
    createdAt: new Date(),
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, id, cookieOptions(Math.floor(SESSION_TTL_MS / 1000)));
  return id;
}

interface CachedSession {
  user: SessionUser;
  cachedAt: number;
}

const sessionUserCache = new Map<string, CachedSession>();
const SESSION_CACHE_TTL_MS = 60 * 1000; // 60s
const MAX_SESSION_CACHE_SIZE = 1000;

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value?.trim();
  if (token) {
    sessionUserCache.delete(token);
    await db.delete(sessions).where(eq(sessions.id, token));
  }
  jar.set(SESSION_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value?.trim();
  if (!token) return null;

  const nowMs = Date.now();
  const cached = sessionUserCache.get(token);
  if (cached && nowMs - cached.cachedAt < SESSION_CACHE_TTL_MS) {
    return cached.user;
  }

  const now = new Date(nowMs);
  const rows = await db
    .select({
      sessionId: sessions.id,
      userId: users.id,
      displayName: users.displayName,
      username: users.username,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, token), gt(sessions.expiresAt, now)))
    .limit(1);

  const row = rows[0];
  if (!row) {
    sessionUserCache.delete(token);
    return null;
  }

  const user: SessionUser = {
    id: row.userId,
    displayName: row.displayName,
    username: row.username,
  };

  if (sessionUserCache.size >= MAX_SESSION_CACHE_SIZE) {
    const firstKey = sessionUserCache.keys().next().value;
    if (firstKey) sessionUserCache.delete(firstKey);
  }
  sessionUserCache.set(token, { user, cachedAt: nowMs });

  return user;
}
