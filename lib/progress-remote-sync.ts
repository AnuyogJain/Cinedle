import {
  readLocalProgress,
  type ProgressMap,
  type StoredProgress,
  writeLocalProgress,
} from "./progress-local";

function isNewerOrEqual(incoming: StoredProgress, existing: StoredProgress): boolean {
  return Date.parse(incoming.updatedAt) >= Date.parse(existing.updatedAt);
}

/** Merge server rows into localStorage (newer updatedAt wins). */
export function mergeRemoteProgressIntoLocal(entries: StoredProgress[]): boolean {
  if (entries.length === 0) return false;
  const map: ProgressMap = { ...readLocalProgress() };
  let changed = false;
  for (const entry of entries) {
    const current = map[entry.puzzleKey];
    if (!current || isNewerOrEqual(entry, current)) {
      map[entry.puzzleKey] = entry;
      changed = true;
    }
  }
  if (changed) writeLocalProgress(map);
  return changed;
}

export async function pushLocalProgressToServer(): Promise<void> {
  const entries = Object.values(readLocalProgress());
  if (entries.length === 0) return;
  await fetch("/api/progress", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entries }),
  });
}

export async function pullServerProgressIntoLocal(): Promise<boolean> {
  const res = await fetch("/api/progress", { credentials: "same-origin" });
  if (!res.ok) return false;
  const data = (await res.json()) as { progress?: StoredProgress[] };
  mergeRemoteProgressIntoLocal(data.progress ?? []);
  return true;
}

/** Upload local entries, then download merged server state into localStorage. */
export async function syncProgressWithServer(): Promise<void> {
  await pushLocalProgressToServer();
  await pullServerProgressIntoLocal();
}

export async function persistEntryToServer(entry: StoredProgress): Promise<boolean> {
  const res = await fetch("/api/progress", {
    method: "PUT",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entry }),
  });
  return res.ok;
}
