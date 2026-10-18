import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildAssignmentKey } from "./puzzle-parse";

describe("buildAssignmentKey", () => {
  it("uses puzzle key alone for daily", () => {
    assert.equal(
      buildAssignmentKey("daily:2026-10-18", {
        genreIds: [],
        originCountry: null,
      }),
      "daily:2026-10-18",
    );
  });

  it("includes filter fingerprint for unlimited", () => {
    const key = buildAssignmentKey("unlimited:abc-123", {
      genreIds: [28, 12],
      originCountry: "US",
    });
    assert.equal(key, "unlimited:abc-123|12,28|US");
  });
});
