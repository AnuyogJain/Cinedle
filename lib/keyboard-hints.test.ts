import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { letterCountsInAnswer, mergeKeyboardHints } from "./keyboard-hints";

describe("mergeKeyboardHints", () => {
  const counts = letterCountsInAnswer(["TO", "O", "OK"]);

  it("prefers green over yellow when the letter was correct in any guess", () => {
    const mixed = mergeKeyboardHints(counts, [
      {
        words: ["TO", "O", "OK"],
        states: [
          ["correct", "present"],
          ["correct"],
          ["correct", "correct"],
        ],
      },
    ]);
    assert.equal(mixed.get("O"), "correct");

    const allCorrect = mergeKeyboardHints(counts, [
      {
        words: ["TO", "O", "OK"],
        states: [
          ["correct", "correct"],
          ["correct"],
          ["correct", "correct"],
        ],
      },
    ]);
    assert.equal(allCorrect.get("O"), "correct");
  });

  it("shows green for a correct letter before every copy is found", () => {
    const map = mergeKeyboardHints(letterCountsInAnswer(["CHILDS", "PLAY"]), [
      {
        words: ["CHILDS", "PLAY"],
        states: [
          ["correct", "absent", "present", "absent", "absent", "absent"],
          ["absent", "absent", "correct", "absent"],
        ],
      },
    ]);
    assert.equal(map.get("C"), "correct");
    assert.equal(map.get("A"), "correct");
    assert.equal(map.get("I"), "present");
  });

  it("keeps green when later guesses also mark the letter yellow", () => {
    const counts = letterCountsInAnswer(["CC", "AB"]);
    const submissions = [
      {
        words: ["CC", "AB"],
        states: [
          ["correct", "absent"],
          ["absent", "absent"],
        ],
      },
      {
        words: ["XX", "XC"],
        states: [
          ["absent", "absent"],
          ["absent", "present"],
        ],
      },
    ];
    assert.equal(mergeKeyboardHints(counts, [submissions[0]]).get("C"), "correct");
    assert.equal(mergeKeyboardHints(counts, submissions).get("C"), "correct");
  });

  it("prefers green over purple when both appear across guesses", () => {
    const map = mergeKeyboardHints(letterCountsInAnswer(["XO", "YO"]), [
      {
        words: ["XO", "YO"],
        states: [
          ["absent", "elsewhere"],
          ["absent", "correct"],
        ],
      },
      {
        words: ["OO", "XX"],
        states: [["correct", "correct"], ["absent", "absent"]],
      },
    ]);
    assert.equal(map.get("O"), "correct");
  });

  it("marks absent when the letter was guessed but is not in the title", () => {
    const map = mergeKeyboardHints(letterCountsInAnswer(["AB", "CD"]), [
      {
        words: ["AB", "CD"],
        states: [
          ["absent", "absent"],
          ["absent", "absent"],
        ],
      },
    ]);
    assert.equal(map.get("Z"), undefined);
    const withZ = mergeKeyboardHints(letterCountsInAnswer(["AB", "CD"]), [
      {
        words: ["ZAB", "CD"],
        states: [
          ["absent", "correct", "present"],
          ["correct", "correct"],
        ],
      },
    ]);
    assert.equal(withZ.get("Z"), "absent");
  });

  it("uses purple when no green or yellow for that letter", () => {
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
