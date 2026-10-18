import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { gameProgress } from "@/lib/db/schema";
import type { StoredProgress } from "./progress-local";

export async function saveProgressForUser(
  userId: string,
  entry: StoredProgress,
): Promise<void> {
  const existing = await db
    .select()
    .from(gameProgress)
    .where(eq(gameProgress.userId, userId))
    .then((rows) => rows.find((r) => r.puzzleKey === entry.puzzleKey));

  const updatedAt = new Date(entry.updatedAt);
  if (existing?.updatedAt && existing.updatedAt > updatedAt) {
    return;
  }

  await db
    .insert(gameProgress)
    .values({
      userId,
      puzzleKey: entry.puzzleKey,
      mode: entry.mode,
      solved: entry.solved,
      guessCount: entry.guessCount,
      guessesJson: JSON.stringify(entry.guesses),
      completedAt: entry.completedAt ? new Date(entry.completedAt) : null,
      updatedAt,
    })
    .onConflictDoUpdate({
      target: [gameProgress.userId, gameProgress.puzzleKey],
      set: {
        mode: entry.mode,
        solved: entry.solved,
        guessCount: entry.guessCount,
        guessesJson: JSON.stringify(entry.guesses),
        completedAt: entry.completedAt ? new Date(entry.completedAt) : null,
        updatedAt,
      },
    });
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
  }));
}

export async function mergeLocalIntoServer(
  userId: string,
  localEntries: StoredProgress[],
): Promise<void> {
  for (const entry of localEntries) {
    await saveProgressForUser(userId, entry);
  }
}
