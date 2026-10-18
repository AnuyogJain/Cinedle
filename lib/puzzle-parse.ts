import { filterKey, type PuzzleFilters } from "./puzzle-picker";

export function parsePuzzleKey(puzzleKey: string): {
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

export function buildAssignmentKey(
  puzzleKey: string,
  filters: PuzzleFilters,
): string | null {
  const parsed = parsePuzzleKey(puzzleKey);
  if (!parsed) return null;
  if (parsed.mode === "daily") return puzzleKey;
  return `${puzzleKey}|${filterKey(filters)}`;
}
