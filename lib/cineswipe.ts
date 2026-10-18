function parsePublicHttpUrl(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }
    return parsed.href.replace(/\/$/, "");
  } catch {
    return null;
  }
}

/** Server-only — set `CINESWIPE_APP_URL` in `.env.local` (restart dev after changes). */
export function getCineswipeAppUrl(): string | null {
  return parsePublicHttpUrl(process.env.CINESWIPE_APP_URL);
}

export function cineswipeHomeMoviePath(tmdbId: number): string {
  return `/?tmdbId=${tmdbId}`;
}

export function buildCineswipeMovieHref(
  baseUrl: string,
  tmdbId: number,
  loggedIn: boolean,
): string {
  const target = cineswipeHomeMoviePath(tmdbId);
  if (loggedIn) {
    return `${baseUrl}${target}`;
  }
  return `${baseUrl}/login?next=${encodeURIComponent(target)}`;
}
