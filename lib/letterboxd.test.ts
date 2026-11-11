import { describe, expect, it } from "vitest";
import { buildLetterboxdMovieUrl } from "./letterboxd";

describe("buildLetterboxdMovieUrl", () => {
  it("generates direct TMDB redirect URL when tmdbId is provided", () => {
    expect(buildLetterboxdMovieUrl({ tmdbId: 550, title: "Fight Club", year: 1999 })).toBe(
      "https://letterboxd.com/tmdb/550/",
    );
  });

  it("falls back to search query when tmdbId is not provided", () => {
    expect(buildLetterboxdMovieUrl({ title: "Inception", year: 2010 })).toBe(
      "https://letterboxd.com/search/Inception%202010/",
    );
  });

  it("handles title only when year is missing", () => {
    expect(buildLetterboxdMovieUrl({ title: "The Matrix" })).toBe(
      "https://letterboxd.com/search/The%20Matrix/",
    );
  });

  it("returns home URL if both title and tmdbId are missing", () => {
    expect(buildLetterboxdMovieUrl({})).toBe("https://letterboxd.com/");
  });
});
