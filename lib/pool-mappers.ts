import { puzzlePoolMovies } from "@/lib/db/schema";
import type { PoolMovie } from "@/lib/title-normalize";

export function poolMovieToRow(movie: PoolMovie) {
  return {
    tmdbId: movie.tmdbId,
    title: movie.title,
    year: movie.year,
    genreIdsJson: JSON.stringify(movie.genreIds),
    originCountry: movie.originCountry,
  };
}

export function rowToPoolMovie(
  row: typeof puzzlePoolMovies.$inferSelect,
): PoolMovie {
  return {
    tmdbId: row.tmdbId,
    title: row.title,
    year: row.year,
    genreIds: JSON.parse(row.genreIdsJson) as number[],
    originCountry: row.originCountry,
  };
}
