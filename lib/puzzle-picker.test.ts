import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pickFromPool, sortPoolStable } from "./puzzle-picker";
import type { PoolMovie } from "./title-normalize";

const sample = (tmdbId: number): PoolMovie => ({
  tmdbId,
  title: `Movie ${tmdbId}`,
  year: 2000,
  genreIds: [18],
  originCountry: "US",
});

describe("pickFromPool", () => {
  it("picks the same movie regardless of input order", () => {
    const poolA = [sample(3), sample(1), sample(2)];
    const poolB = [sample(2), sample(3), sample(1)];
    const seed = "daily:2026-10-18:ANY";

    assert.equal(
      pickFromPool(poolA, seed)?.tmdbId,
      pickFromPool(poolB, seed)?.tmdbId,
    );
  });

  it("sorts pool by tmdbId then title", () => {
    const sorted = sortPoolStable([
      sample(10),
      sample(2),
      { ...sample(5), title: "B" },
      { ...sample(5), title: "A" },
    ]);
    assert.deepEqual(
      sorted.map((m) => [m.tmdbId, m.title]),
      [
        [2, "Movie 2"],
        [5, "A"],
        [5, "B"],
        [10, "Movie 10"],
      ],
    );
  });
});
