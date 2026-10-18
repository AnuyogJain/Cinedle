export const SESSION_COOKIE = "cinedle_session";
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}
