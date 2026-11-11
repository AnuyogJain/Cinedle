/**
 * Helper to generate Letterboxd URLs for films.
 *
 * Letterboxd supports direct shortcut URLs using TMDb IDs:
 * https://letterboxd.com/tmdb/[TMDB_ID]/
 * which automatically redirects directly to the film's Letterboxd page.
 *
 * If no TMDb ID is available, it falls back to Letterboxd's search URL format:
 * https://letterboxd.com/search/[query]/
 */
export function buildLetterboxdMovieUrl({
  tmdbId,
  title,
  year,
}: {
  tmdbId?: number | null;
  title?: string;
  year?: number | null;
}): string {
  if (tmdbId != null && tmdbId > 0) {
    return `https://letterboxd.com/tmdb/${tmdbId}/`;
  }

  const cleanTitle = title?.trim() ?? "";
  const query = [cleanTitle, year ? String(year) : ""].filter(Boolean).join(" ");

  if (!query) {
    return "https://letterboxd.com/";
  }

  return `https://letterboxd.com/search/${encodeURIComponent(query)}/`;
}
