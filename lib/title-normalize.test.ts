import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isEligibleMovieTitle, titleToPlayWords } from "./title-normalize";

describe("isEligibleMovieTitle", () => {
  it("rejects ampersands and other punctuation", () => {
    assert.equal(isEligibleMovieTitle("Tom & Jerry"), false);
    assert.equal(isEligibleMovieTitle("Bonnie & Clyde"), false);
    assert.equal(isEligibleMovieTitle("Rogue One: A Star Wars Story"), false);
    assert.equal(isEligibleMovieTitle("102 Dalmatians"), false);
  });

  it("allows plain words with apostrophe or hyphen", () => {
    assert.equal(isEligibleMovieTitle("Don't Look Up"), true);
    assert.equal(isEligibleMovieTitle("Spider-Man"), true);
    assert.equal(isEligibleMovieTitle("The Dark Knight"), true);
  });

  it("play words strip apostrophes from allowed titles", () => {
    assert.deepEqual(titleToPlayWords("Don't Look Up"), ["DONT", "LOOK", "UP"]);
  });

  it("rejects any word longer than ten letters", () => {
    assert.equal(isEligibleMovieTitle("ABCDEFGHIJK"), false);
    assert.equal(isEligibleMovieTitle("ABCDEFGHIJ"), true);
  });
});
