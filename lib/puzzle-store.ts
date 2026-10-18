import "server-only";

import { getOrCreateAssignment } from "./puzzle-assignments";
import {
  titleToPlayWords,
  wordLengths,
  type PoolMovie,
} from "./title-normalize";
import { fetchMoviePosterPath } from "./tmdb-discover";
import type { PuzzleFilters } from "./puzzle-picker";
import { parsePuzzleKey } from "./puzzle-parse";

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

  const picked = await getOrCreateAssignment(puzzleKey, filters);
  if (!picked) return null;

  const date = parsed.mode === "daily" ? parsed.keyPart : null;
  return movieToPuzzle(picked, puzzleKey, parsed.mode, date);
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
