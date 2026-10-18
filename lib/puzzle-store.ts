import "server-only";

import {
  buildPickerSeed,
  filterPool,
  pickFromPool,
  type PuzzleFilters,
} from "./puzzle-picker";
import { getPuzzlePool } from "./pool-db";
import {
  titleToPlayWords,
  wordLengths,
  type PoolMovie,
} from "./title-normalize";
import { discoverEligibleMovie, fetchMoviePosterPath } from "./tmdb-discover";

export interface ResolvedPuzzle {
  puzzleKey: string;
  mode: "daily" | "unlimited";
  date: string | null;
  wordLengths: number[];
  tmdbId: number;
  answerWords: string[];
  displayTitle: string;
  year: number;
  posterPath: string | null;
}

function parsePuzzleKey(puzzleKey: string): {
  mode: "daily" | "unlimited";
  keyPart: string;
} | null {
  const idx = puzzleKey.indexOf(":");
  if (idx <= 0) return null;
  const mode = puzzleKey.slice(0, idx);
  const keyPart = puzzleKey.slice(idx + 1);
  if (mode !== "daily" && mode !== "unlimited") return null;
  if (!keyPart) return null;
  return { mode, keyPart };
}

function movieToPuzzle(
  movie: PoolMovie,
  puzzleKey: string,
  mode: "daily" | "unlimited",
  date: string | null,
): ResolvedPuzzle {
  const answerWords = titleToPlayWords(movie.title);
  return {
    puzzleKey,
    mode,
    date,
    wordLengths: wordLengths(answerWords),
    tmdbId: movie.tmdbId,
    answerWords,
    displayTitle: movie.title,
    year: movie.year,
    posterPath: null,
  };
}

export async function resolvePuzzle(
  puzzleKey: string,
  filters: PuzzleFilters = { genreIds: [], originCountry: null },
): Promise<ResolvedPuzzle | null> {
  const parsed = parsePuzzleKey(puzzleKey);
  if (!parsed) return null;

  const { mode, keyPart } = parsed;
  const seed = buildPickerSeed(mode, keyPart, filters);
  const pool = await getPuzzlePool();
  let filtered = filterPool(pool, filters);

  if (filtered.length === 0 && mode === "unlimited") {
    const discovered = await discoverEligibleMovie(seed, filters);
    if (discovered) {
      filtered = [discovered];
    }
  }

  if (filtered.length === 0) {
    filtered = pool;
  }

  const picked = pickFromPool(filtered, seed);
  if (!picked) return null;

  const date = mode === "daily" ? keyPart : null;
  return movieToPuzzle(picked, puzzleKey, mode, date);
}

export { utcDateString } from "./dates";

export function publicPuzzleView(puzzle: ResolvedPuzzle) {
  const letterCounts: Record<string, number> = {};
  for (const word of puzzle.answerWords) {
    for (const ch of word) {
      letterCounts[ch] = (letterCounts[ch] ?? 0) + 1;
    }
  }
  return {
    puzzleKey: puzzle.puzzleKey,
    mode: puzzle.mode,
    date: puzzle.date,
    wordLengths: puzzle.wordLengths,
    tmdbId: puzzle.tmdbId,
    letterCounts,
  };
}

export async function revealPuzzleAsync(puzzle: ResolvedPuzzle) {
  const freshPoster = await fetchMoviePosterPath(puzzle.tmdbId);
  return {
    displayTitle: puzzle.displayTitle,
    year: puzzle.year,
    posterPath: freshPoster,
    tmdbId: puzzle.tmdbId,
  };
}
