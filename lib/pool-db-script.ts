import { sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { puzzlePoolMovies } from "@/lib/db/schema";
import type * as schema from "@/lib/db/schema";
import { poolMovieToRow, rowToPoolMovie } from "@/lib/pool-mappers";
import type { PoolMovie } from "@/lib/title-normalize";

type ScriptDb = LibSQLDatabase<typeof schema>;

export async function upsertPoolMoviesScript(
  db: ScriptDb,
  movies: PoolMovie[],
): Promise<void> {
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
}

export async function countPoolMoviesScript(db: ScriptDb): Promise<number> {
  const rows = await db.select({ tmdbId: puzzlePoolMovies.tmdbId }).from(puzzlePoolMovies);
  return rows.length;
}

export async function loadAllPoolMoviesScript(db: ScriptDb): Promise<PoolMovie[]> {
  const rows = await db.select().from(puzzlePoolMovies);
  return rows.map(rowToPoolMovie);
}
