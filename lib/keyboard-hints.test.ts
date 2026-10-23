import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { gradeGuess, type TileState } from "./grading";
import {
  letterCountsInAnswer,
  mergeKeyboardHints,
  type GuessSubmission,
} from "./keyboard-hints";

describe("mergeKeyboardHints", () => {
  const counts = letterCountsInAnswer(["TO", "O", "OK"]);

  it("stays yellow until every instance of the letter is solved in the answer", () => {
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
    assert.equal(mixed.get("O"), "present");

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

  it("shows green for a solved copy but turns yellow when an unsolved copy is present in later guesses", () => {
    const counts = letterCountsInAnswer(["CC", "AB"]);
    const submissions: GuessSubmission[] = [
      {
        words: ["CC", "AB"],
        states: [
          ["correct", "absent"],
          ["absent", "absent"],
        ] as TileState[][],
      },
      {
        words: ["XX", "XC"],
        states: [
          ["absent", "absent"],
          ["absent", "present"],
        ] as TileState[][],
      },
    ];
    assert.equal(mergeKeyboardHints(counts, [submissions[0]]).get("C"), "correct");
    assert.equal(mergeKeyboardHints(counts, submissions).get("C"), "present");
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

  describe("duplicate letter rules (example TEST)", () => {
    const answer = ["TEST"];
    const counts = letterCountsInAnswer(answer);

    const guessTess: GuessSubmission = {
      words: ["TESS"],
      states: [["correct", "correct", "correct", "absent"]],
    };

    it("makes T as green when first T is correct and second T is not present (1. TESS)", () => {
      const map = mergeKeyboardHints(counts, [guessTess]);
      assert.equal(map.get("T"), "correct");
      assert.equal(map.get("E"), "correct");
      assert.equal(map.get("S"), "correct");
    });

    it("keeps T as green when later guess does not contain T (if 2. FOLL, T stays as green)", () => {
      const guessFoll: GuessSubmission = {
        words: ["FOLL"],
        states: [["absent", "absent", "absent", "absent"]],
      };
      const map = mergeKeyboardHints(counts, [guessTess, guessFoll]);
      assert.equal(map.get("T"), "correct");
    });

    it("makes T as yellow when later guess has T present again (if 2. FOTL, makes T as yellow as T is present again)", () => {
      const guessFotl: GuessSubmission = {
        words: ["FOTL"],
        states: [["absent", "absent", "present", "absent"]],
      };
      const map = mergeKeyboardHints(counts, [guessTess, guessFotl]);
      assert.equal(map.get("T"), "present");
    });

    it("makes T as yellow when first T is correct but second T is present in TTES", () => {
      const guessTtes: GuessSubmission = {
        words: ["TTES"],
        states: [["correct", "present", "present", "present"]],
      };
      // When 2. TTES follows 1. TESS
      const mapAfterTess = mergeKeyboardHints(counts, [guessTess, guessTtes]);
      assert.equal(mapAfterTess.get("T"), "present");

      // When TTES is guessed on its own
      const mapSingle = mergeKeyboardHints(counts, [guessTtes]);
      assert.equal(mapSingle.get("T"), "present");
    });

    it("makes T as green once all copies of T are correctly guessed", () => {
      const guessFotl: GuessSubmission = {
        words: ["FOTL"],
        states: [["absent", "absent", "present", "absent"]],
      };
      const guessTest: GuessSubmission = {
        words: ["TEST"],
        states: [["correct", "correct", "correct", "correct"]],
      };
      const map = mergeKeyboardHints(counts, [guessTess, guessFotl, guessTest]);
      assert.equal(map.get("T"), "correct");
    });

    it("validates the full flow end-to-end with gradeGuess", () => {
      const sub1 = { words: ["TESS"], states: gradeGuess(answer, ["TESS"]) };
      const subFoll = { words: ["FOLL"], states: gradeGuess(answer, ["FOLL"]) };
      const subFotl = { words: ["FOTL"], states: gradeGuess(answer, ["FOTL"]) };
      const subTtes = { words: ["TTES"], states: gradeGuess(answer, ["TTES"]) };
      const subSolved = { words: ["TEST"], states: gradeGuess(answer, ["TEST"]) };

      // 1. TESS -> T is green
      assert.equal(mergeKeyboardHints(counts, [sub1]).get("T"), "correct");

      // if 2. FOLL -> T stays green
      assert.equal(mergeKeyboardHints(counts, [sub1, subFoll]).get("T"), "correct");

      // if 2. FOTL -> makes T as yellow as T is present again
      assert.equal(mergeKeyboardHints(counts, [sub1, subFotl]).get("T"), "present");

      // if 2. TTES -> makes T as yellow as first T is correct but second T is still not correct
      assert.equal(mergeKeyboardHints(counts, [sub1, subTtes]).get("T"), "present");
      assert.equal(mergeKeyboardHints(counts, [subTtes]).get("T"), "present");

      // When all Ts are found in their correct positions -> T becomes green
      assert.equal(mergeKeyboardHints(counts, [sub1, subFotl, subSolved]).get("T"), "correct");
    });
  });
});

