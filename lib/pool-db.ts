import "server-only";

import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { puzzlePoolMovies } from "@/lib/db/schema";
import { poolMovieToRow, rowToPoolMovie } from "@/lib/pool-mappers";
import { sortPoolStable } from "@/lib/puzzle-picker";
import { isEligibleMovieTitle, type PoolMovie } from "@/lib/title-normalize";

const POOL_CACHE_MS = 5 * 60 * 1000;

const globalForPool = globalThis as unknown as {
  puzzlePool?: PoolMovie[];
  puzzlePoolLoadedAt?: number;
};

export async function upsertPoolMovies(movies: PoolMovie[]): Promise<void> {
  if (movies.length === 0) return;

  const CHUNK = 40;
  for (let i = 0; i < movies.length; i += CHUNK) {
    const chunk = movies.slice(i, i + CHUNK).map(poolMovieToRow);
    await db
      .insert(puzzlePoolMovies)
      .values(chunk)
      .onConflictDoUpdate({
        target: puzzlePoolMovies.tmdbId,
        set: {
          title: sql`excluded.title`,
          year: sql`excluded.year`,
          genreIdsJson: sql`excluded.genre_ids_json`,
          originCountry: sql`excluded.origin_country`,
        },
      });
  }
  clearPuzzlePoolCache();
}

export async function countPoolMovies(): Promise<number> {
  const rows = await db.select({ tmdbId: puzzlePoolMovies.tmdbId }).from(puzzlePoolMovies);
  return rows.length;
}

export function clearPuzzlePoolCache(): void {
  globalForPool.puzzlePool = undefined;
  globalForPool.puzzlePoolLoadedAt = undefined;
}

export async function getPuzzlePool(): Promise<PoolMovie[]> {
  const loadedAt = globalForPool.puzzlePoolLoadedAt ?? 0;
  if (
    globalForPool.puzzlePool &&
    Date.now() - loadedAt < POOL_CACHE_MS
  ) {
    return globalForPool.puzzlePool;
  }

  const rows = await db.select().from(puzzlePoolMovies);
  const pool = sortPoolStable(
    rows.map(rowToPoolMovie).filter((m) => isEligibleMovieTitle(m.title)),
  );

  if (pool.length === 0) {
    throw new Error(
      "Puzzle pool is empty. Run npm run db:push then npm run pool:refresh (or pool:import).",
    );
  }

  globalForPool.puzzlePool = pool;
  globalForPool.puzzlePoolLoadedAt = Date.now();
  return pool;
}
