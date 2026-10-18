import "server-only";

import Papa from "papaparse";
import { db } from "@/lib/db";
import { forUser } from "@/lib/db/user-scope";
import { gameProgress } from "@/lib/db/schema";
import { requestUserId } from "@/lib/auth/user-context";

const BACKUP_VERSION = "1";
export const MAX_BACKUP_BYTES = 2 * 1024 * 1024;

type BackupRow = Record<string, string>;

export async function exportUserBackupCsvAsync(): Promise<string> {
  const rows = await db
    .select()
    .from(gameProgress)
    .where(forUser(gameProgress));

  const csvRows: BackupRow[] = rows.map((row) => ({
    record_type: "progress",
    puzzle_key: row.puzzleKey,
    mode: row.mode,
    solved: row.solved ? "1" : "0",
    guess_count: String(row.guessCount),
    guesses_json: row.guessesJson,
    completed_at: row.completedAt?.toISOString?.() ?? "",
    updated_at: row.updatedAt?.toISOString?.() ?? "",
  }));

  const csv = Papa.unparse(csvRows, { header: true });
  return `# cinedle_backup_version=${BACKUP_VERSION}\n${csv}`;
}

export async function importUserBackupCsvReplace(csvText: string): Promise<void> {
  if (csvText.length > MAX_BACKUP_BYTES) {
    throw new Error("Backup file too large");
  }

  const withoutComment = csvText
    .split("\n")
    .filter((line) => !line.startsWith("#"))
    .join("\n");

  const parsed = Papa.parse<BackupRow>(withoutComment, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    throw new Error("Invalid backup CSV");
  }

  const userId = requestUserId();
  await db.delete(gameProgress).where(forUser(gameProgress));

  for (const row of parsed.data) {
    if (row.record_type !== "progress") continue;
    const puzzleKey = row.puzzle_key?.trim();
    if (!puzzleKey) continue;
    const mode = row.mode === "unlimited" ? "unlimited" : "daily";
    await db.insert(gameProgress).values({
      userId,
      puzzleKey,
      mode,
      solved: row.solved === "1",
      guessCount: row.guess_count ? Number(row.guess_count) : 0,
      guessesJson: row.guesses_json || "[]",
      completedAt: row.completed_at ? new Date(row.completed_at) : null,
      updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
    });
  }
}
