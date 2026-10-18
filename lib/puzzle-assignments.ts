import "server-only";

import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { puzzleAssignments } from "@/lib/db/schema";
import { buildAssignmentKey, parsePuzzleKey } from "@/lib/puzzle-parse";
import { buildPickerSeed, filterKey, type PuzzleFilters } from "@/lib/puzzle-picker";
import { isEligibleMovieTitle, type PoolMovie } from "@/lib/title-normalize";
import { discoverEligibleMovie } from "@/lib/tmdb-discover";

const RECENT_DAILY_WINDOW = 299;
const MAX_ASSIGN_ATTEMPTS = 20;

function rowToPoolMovie(
  row: typeof puzzleAssignments.$inferSelect,
): PoolMovie {
  return {
    tmdbId: row.tmdbId,
    title: row.title,
    year: row.year,
    genreIds: JSON.parse(row.genreIdsJson) as number[],
    originCountry: row.originCountry,
  };
}

async function loadAssignment(
  assignmentKey: string,
): Promise<PoolMovie | null> {
  const row = await db
    .select()
    .from(puzzleAssignments)
    .where(eq(puzzleAssignments.assignmentKey, assignmentKey))
    .then((rows) => rows[0]);
  return row ? rowToPoolMovie(row) : null;
}

async function recentDailyTmdbIds(): Promise<Set<number>> {
  const rows = await db
    .select({ tmdbId: puzzleAssignments.tmdbId })
    .from(puzzleAssignments)
    .where(eq(puzzleAssignments.mode, "daily"))
    .orderBy(desc(puzzleAssignments.dailyDate))
    .limit(RECENT_DAILY_WINDOW);
  return new Set(rows.map((r) => r.tmdbId));
}

export async function getOrCreateAssignment(
  puzzleKey: string,
  filters: PuzzleFilters,
): Promise<PoolMovie | null> {
  const parsed = parsePuzzleKey(puzzleKey);
  if (!parsed) return null;

  const assignmentKey = buildAssignmentKey(puzzleKey, filters);
  if (!assignmentKey) return null;

  const existing = await loadAssignment(assignmentKey);
  if (existing) return existing;

  const { mode, keyPart } = parsed;
  const fKey = filterKey(filters);
  const seed = buildPickerSeed(mode, keyPart, filters);
  const recent =
    mode === "daily" ? await recentDailyTmdbIds() : new Set<number>();
  const dailyDate = mode === "daily" ? keyPart : null;

  for (let attempt = 0; attempt < MAX_ASSIGN_ATTEMPTS; attempt++) {
    const movie = await discoverEligibleMovie(
      `${seed}:a${attempt}`,
      filters,
      attempt,
    );
    if (!movie || !isEligibleMovieTitle(movie.title)) continue;

    const allowReuse = attempt >= MAX_ASSIGN_ATTEMPTS - 1;
    if (
      mode === "daily" &&
      !allowReuse &&
      recent.has(movie.tmdbId)
    ) {
      continue;
    }

    try {
      await db.insert(puzzleAssignments).values({
        assignmentKey,
        mode,
        puzzleKey,
        filterKey: fKey,
        dailyDate,
        tmdbId: movie.tmdbId,
        title: movie.title,
        year: movie.year,
        genreIdsJson: JSON.stringify(movie.genreIds),
        originCountry: movie.originCountry,
      });
      return movie;
    } catch {
      const raced = await loadAssignment(assignmentKey);
      if (raced) return raced;
    }
  }

  throw new Error(
    "Could not assign puzzle from TMDB. Check TMDB_API_KEY and try again.",
  );
}
