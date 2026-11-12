import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { gameProgress } from "@/lib/db/schema";
import type { StoredProgress } from "./progress-local";

function buildProgressUpsert(userId: string, entry: StoredProgress) {
  const updatedAt = new Date(entry.updatedAt);
  const completedAt = entry.completedAt ? new Date(entry.completedAt) : null;
  const values = {
    userId,
    puzzleKey: entry.puzzleKey,
    mode: entry.mode,
    solved: entry.solved,
    guessCount: entry.guessCount,
    guessesJson: JSON.stringify(entry.guesses),
    revealTitle: entry.revealTitle ?? null,
    revealYear: entry.revealYear ?? null,
    completedAt,
    updatedAt,
  };

  return db
    .insert(gameProgress)
    .values(values)
    .onConflictDoUpdate({
      target: [gameProgress.userId, gameProgress.puzzleKey],
      set: {
        mode: entry.mode,
        solved: entry.solved,
        guessCount: entry.guessCount,
        guessesJson: JSON.stringify(entry.guesses),
        revealTitle: entry.revealTitle ?? null,
        revealYear: entry.revealYear ?? null,
        completedAt,
        updatedAt,
      },
    });
}

export async function saveProgressForUser(
  userId: string,
  entry: StoredProgress,
): Promise<void> {
  const [existing] = await db
    .select({ updatedAt: gameProgress.updatedAt })
    .from(gameProgress)
    .where(
      and(
        eq(gameProgress.userId, userId),
        eq(gameProgress.puzzleKey, entry.puzzleKey),
      ),
    )
    .limit(1);

  const updatedAt = new Date(entry.updatedAt);
  if (existing?.updatedAt && existing.updatedAt > updatedAt) {
    return;
  }

  await buildProgressUpsert(userId, entry);
}

export async function listProgressForUser(userId: string): Promise<StoredProgress[]> {
  const rows = await db
    .select()
    .from(gameProgress)
    .where(eq(gameProgress.userId, userId));

  return rows.map((row) => ({
    puzzleKey: row.puzzleKey,
    mode: row.mode,
    solved: row.solved,
    guessCount: row.guessCount,
    guesses: JSON.parse(row.guessesJson) as StoredProgress["guesses"],
    completedAt: row.completedAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
    revealTitle: row.revealTitle ?? undefined,
    revealYear: row.revealYear ?? undefined,
  }));
}

export async function mergeLocalIntoServer(
  userId: string,
  localEntries: StoredProgress[],
): Promise<void> {
  if (!localEntries.length) return;

  // Single round trip to fetch all existing puzzle keys and timestamps for the user
  const existingRows = await db
    .select({
      puzzleKey: gameProgress.puzzleKey,
      updatedAt: gameProgress.updatedAt,
    })
    .from(gameProgress)
    .where(eq(gameProgress.userId, userId));

  const existingMap = new Map(
    existingRows.map((r) => [r.puzzleKey, r.updatedAt.getTime()]),
  );

  // Filter entries that are new or newer than the server version
  const toUpsert = localEntries.filter((entry) => {
    const existingTime = existingMap.get(entry.puzzleKey);
    const entryTime = new Date(entry.updatedAt).getTime();
    return existingTime === undefined || entryTime > existingTime;
  });

  if (!toUpsert.length) return;

  if (toUpsert.length === 1) {
    await buildProgressUpsert(userId, toUpsert[0]);
    return;
  }

  // Batch execute all upserts in chunks of 50 via db.batch (1 network round trip per chunk)
  const CHUNK_SIZE = 50;
  for (let i = 0; i < toUpsert.length; i += CHUNK_SIZE) {
    const chunk = toUpsert.slice(i, i + CHUNK_SIZE);
    const statements = chunk.map((entry) => buildProgressUpsert(userId, entry));
    await db.batch(statements as [any, ...any[]]);
  }
}
