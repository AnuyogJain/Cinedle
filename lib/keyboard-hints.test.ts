import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { letterCountsInAnswer, mergeKeyboardHints } from "./keyboard-hints";

describe("mergeKeyboardHints", () => {
  const counts = letterCountsInAnswer(["TO", "O", "OK"]);

  it("stays yellow until every answer O is correct somewhere", () => {
    const partial = mergeKeyboardHints(counts, [
      {
        words: ["TO", "O", "OK"],
        states: [
          ["correct", "present"],
          ["correct"],
          ["correct", "correct"],
        ],
      },
    ]);
    assert.equal(partial.get("O"), "present");

    const allFound = mergeKeyboardHints(counts, [
      {
        words: ["TO", "O", "OK"],
        states: [
          ["correct", "correct"],
          ["correct"],
          ["correct", "correct"],
        ],
      },
    ]);
    assert.equal(allFound.get("O"), "correct");
  });

  it("prefers yellow over partial green", () => {
    const map = mergeKeyboardHints(letterCountsInAnswer(["AB", "AB"]), [
      {
        words: ["AB", "AB"],
        states: [
          ["correct", "present"],
          ["absent", "absent"],
        ],
      },
    ]);
    assert.equal(map.get("B"), "present");
    assert.equal(map.get("A"), undefined);
  });

  it("uses purple when no yellow and not all instances found", () => {
    const map = mergeKeyboardHints(letterCountsInAnswer(["BY", "TO"]), [
      {
        words: ["BY", "TO"],
        states: [
          ["absent", "elsewhere"],
          ["correct", "correct"],
        ],
      },
    ]);
    assert.equal(map.get("Y"), "elsewhere");
    assert.equal(map.get("T"), "correct");
  });
});
