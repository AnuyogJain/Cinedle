import type { PuzzleFilters } from "./puzzle-picker";

export function parseFiltersFromSearchParams(
  params: URLSearchParams,
): PuzzleFilters {
  const genreRaw = params.get("genres")?.trim();
  const genreIds = genreRaw
    ? genreRaw
        .split(",")
        .map((s) => Number.parseInt(s, 10))
        .filter((n) => Number.isFinite(n))
    : [];

  const country = params.get("country")?.trim().toUpperCase() || null;
  return {
    genreIds,
    originCountry: country && country !== "ANY" ? country : null,
  };
}

export const UNLIMITED_FILTERS_PREFIX = "cinedle-unlimited-filters:";
