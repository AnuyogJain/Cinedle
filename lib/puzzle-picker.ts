import { createHash } from "node:crypto";
import type { PoolMovie } from "./title-normalize";

export interface PuzzleFilters {
  genreIds: number[];
  originCountry: string | null;
}

export function filterKey(filters: PuzzleFilters): string {
  const genres = [...filters.genreIds].sort((a, b) => a - b).join(",");
  const country = filters.originCountry?.trim().toUpperCase() || "ANY";
  return `${genres}|${country}`;
}

export function pickIndex(seed: string, length: number): number {
  if (length <= 0) return 0;
  const hash = createHash("sha256").update(seed).digest();
  const n = hash.readUInt32BE(0);
  return n % length;
}

export function filterPool(
  pool: PoolMovie[],
  filters: PuzzleFilters,
): PoolMovie[] {
  return pool.filter((movie) => {
    if (filters.genreIds.length > 0) {
      const hasGenre = filters.genreIds.some((id) =>
        movie.genreIds.includes(id),
      );
      if (!hasGenre) return false;
    }
    if (filters.originCountry) {
      const code = filters.originCountry.trim().toUpperCase();
      if (movie.originCountry !== code) return false;
    }
    return true;
  });
}

export function buildPickerSeed(
  mode: "daily" | "unlimited",
  keyPart: string,
  filters: PuzzleFilters,
): string {
  return `${mode}:${keyPart}:${filterKey(filters)}`;
}

export function pickFromPool(
  pool: PoolMovie[],
  seed: string,
): PoolMovie | null {
  if (pool.length === 0) return null;
  const index = pickIndex(seed, pool.length);
  return pool[index] ?? null;
}
