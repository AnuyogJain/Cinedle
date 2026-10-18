import { config } from "dotenv";
import { resolve } from "node:path";
import { isEligibleMovieTitle, type PoolMovie } from "../lib/title-normalize";
import { createScriptDb } from "../lib/db/script-client";
import {
  countPoolMoviesScript,
  upsertPoolMoviesScript,
} from "../lib/pool-db-script";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const TMDB_BASE = "https://api.themoviedb.org/3";
const TARGET_SIZE = 3000;
const MAX_PAGE = 500;

async function fetchPage(
  apiKey: string,
  page: number,
  voteCountGte: number,
): Promise<{ movies: PoolMovie[]; exhausted: boolean }> {
  const url = new URL(`${TMDB_BASE}/discover/movie`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "en-US");
  url.searchParams.set("sort_by", "popularity.desc");
  url.searchParams.set("vote_count.gte", String(voteCountGte));
  url.searchParams.set("page", String(page));

  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  const data = (await res.json()) as {
    results?: Array<{
      id: number;
      title: string;
      release_date?: string;
      genre_ids?: number[];
      origin_country?: string[];
    }>;
  };

  const results = data.results ?? [];
  if (results.length === 0) {
    return { movies: [], exhausted: true };
  }

  const movies: PoolMovie[] = [];
  for (const m of results) {
    if (!isEligibleMovieTitle(m.title)) continue;
    const year = m.release_date
      ? Number.parseInt(m.release_date.slice(0, 4), 10)
      : 0;
    movies.push({
      tmdbId: m.id,
      title: m.title,
      year: Number.isFinite(year) ? year : 0,
      genreIds: m.genre_ids ?? [],
      originCountry: m.origin_country?.[0]?.toUpperCase() ?? "US",
    });
  }
  return { movies, exhausted: false };
}

async function main() {
  const apiKey = process.env.TMDB_API_KEY?.trim();
  if (!apiKey) {
    console.error("Set TMDB_API_KEY in .env.local");
    process.exit(1);
  }

  const db = createScriptDb();
  let total = await countPoolMoviesScript(db);
  console.log(`Starting pool size in DB: ${total}`);

  const passes: Array<{ voteCountGte: number; label: string }> = [
    { voteCountGte: 300, label: "popular (vote_count ≥ 300)" },
    { voteCountGte: 100, label: "broader (vote_count ≥ 100)" },
    { voteCountGte: 50, label: "wide (vote_count ≥ 50)" },
  ];

  for (const pass of passes) {
    if (total >= TARGET_SIZE) break;

    for (let page = 1; page <= MAX_PAGE && total < TARGET_SIZE; page++) {
      const { movies, exhausted } = await fetchPage(
        apiKey,
        page,
        pass.voteCountGte,
      );
      if (exhausted) {
        console.log(`${pass.label}: no more TMDB pages at ${page}, next pass`);
        break;
      }
      if (movies.length > 0) {
        await upsertPoolMoviesScript(db, movies);
      }
      total = await countPoolMoviesScript(db);
      if (page % 10 === 0 || total >= TARGET_SIZE) {
        console.log(`${pass.label} page ${page}: ${total} titles in DB`);
      }
    }
  }

  console.log(`Done. ${total} titles in Turso (target ${TARGET_SIZE}).`);
  if (total < TARGET_SIZE) {
    console.warn(
      "Could not reach target — add more TMDB discover passes or lower eligibility filters.",
    );
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
