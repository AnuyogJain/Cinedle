import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildLetterboxdMovieUrl } from "./letterboxd";

describe("buildLetterboxdMovieUrl", () => {
  it("generates direct TMDB redirect URL when tmdbId is provided", () => {
    assert.equal(
      buildLetterboxdMovieUrl({ tmdbId: 550, title: "Fight Club", year: 1999 }),
      "https://letterboxd.com/tmdb/550/",
    );
  });

  it("falls back to search query when tmdbId is not provided", () => {
    assert.equal(
      buildLetterboxdMovieUrl({ title: "Inception", year: 2010 }),
      "https://letterboxd.com/search/Inception%202010/",
    );
  });

  it("handles title only when year is missing", () => {
    assert.equal(
      buildLetterboxdMovieUrl({ title: "The Matrix" }),
      "https://letterboxd.com/search/The%20Matrix/",
    );
  });

  it("returns home URL if both title and tmdbId are missing", () => {
    assert.equal(buildLetterboxdMovieUrl({}), "https://letterboxd.com/");
  });
});
