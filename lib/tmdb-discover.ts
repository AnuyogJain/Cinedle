import "server-only";

import { pickIndex } from "./puzzle-picker";
import type { PuzzleFilters } from "./puzzle-picker";
import { isEligibleMovieTitle, type PoolMovie } from "./title-normalize";

const TMDB_BASE = "https://api.themoviedb.org/3";

interface DiscoverResult {
  results?: Array<{
    id: number;
    title: string;
    release_date?: string;
    genre_ids?: number[];
    origin_country?: string[];
    poster_path: string | null;
  }>;
}

function tmdbKey(): string | null {
  return process.env.TMDB_API_KEY?.trim() || null;
}

export async function fetchMoviePosterPath(
  tmdbId: number
): Promise<string | null> {
  const apiKey = tmdbKey();
  if (!apiKey) return null;

  const url = new URL(`${TMDB_BASE}/movie/${tmdbId}`);
  url.searchParams.set("api_key", apiKey);

  const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
  if (!res.ok) return null;

  const data = (await res.json()) as { poster_path?: string | null };
  return data.poster_path ?? null;
}

export async function discoverEligibleMovie(
  seed: string,
  filters: PuzzleFilters,
  attempt = 0
): Promise<PoolMovie | null> {
  const apiKey = tmdbKey();
  if (!apiKey) return null;

  const pageSpread = 50 + Math.min(attempt, 12) * 15;
  const page = pickIndex(seed, pageSpread) + 1;
  const voteGte = attempt >= 12 ? 50 : attempt >= 6 ? 100 : 200;
  const url = new URL(`${TMDB_BASE}/discover/movie`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "en-US");
  url.searchParams.set("sort_by", "popularity.desc");
  url.searchParams.set("vote_count.gte", String(voteGte));
  url.searchParams.set("page", String(page));
  if (filters.genreIds.length > 0) {
    url.searchParams.set("with_genres", filters.genreIds.join(","));
  }
  if (filters.originCountry) {
    url.searchParams.set(
      "with_origin_country",
      filters.originCountry.trim().toUpperCase()
    );
  }

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) return null;

  const data = (await res.json()) as DiscoverResult;
  const results = data.results ?? [];
  if (results.length === 0) return null;

  const start = pickIndex(`${seed}:scan`, results.length);
  for (let offset = 0; offset < results.length; offset++) {
    const movie = results[(start + offset) % results.length]!;
    if (!isEligibleMovieTitle(movie.title)) continue;
    const year = movie.release_date
      ? Number.parseInt(movie.release_date.slice(0, 4), 10)
      : 0;
    return {
      tmdbId: movie.id,
      title: movie.title,
      year: Number.isFinite(year) ? year : 0,
      genreIds: movie.genre_ids ?? [],
      originCountry: movie.origin_country?.[0]?.toUpperCase() ?? "US",
    };
  }

  return null;
}
