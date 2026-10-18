export const PROGRESS_STORAGE_KEY = "cinedle-progress-v1";

export interface StoredGuessRow {
  words: string[];
  states: string[][];
}

export interface StoredProgress {
  puzzleKey: string;
  mode: "daily" | "unlimited";
  solved: boolean;
  guessCount: number;
  guesses: StoredGuessRow[];
  completedAt: string | null;
  updatedAt: string;
  revealTitle?: string;
  revealYear?: number;
}

export type ProgressMap = Record<string, StoredProgress>;

export function readLocalProgress(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ProgressMap;
  } catch {
    return {};
  }
}

export function writeLocalProgress(map: ProgressMap): void {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function upsertLocalProgress(entry: StoredProgress): ProgressMap {
  const map = readLocalProgress();
  map[entry.puzzleKey] = entry;
  writeLocalProgress(map);
  return map;
}

export function getLocalProgress(puzzleKey: string): StoredProgress | null {
  return readLocalProgress()[puzzleKey] ?? null;
}
