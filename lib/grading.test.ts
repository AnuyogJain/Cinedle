import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { gradeGuess } from "./grading";

describe("gradeGuess", () => {
  it("marks exact match as correct", () => {
    const states = gradeGuess(["NOWAY"], ["NOWAY"]);
    assert.deepEqual(states, [["correct", "correct", "correct", "correct", "correct"]]);
  });

  it("marks same-word wrong position as present", () => {
    const states = gradeGuess(["YOU"], ["OUY"]);
    assert.equal(states[0]![1], "present");
  });

  it("marks cross-word letter as elsewhere when budget remains", () => {
    const answer = ["BY", "FAR"];
    const guess = ["AF", "BAR"];
    const states = gradeGuess(answer, guess);
    assert.equal(states[0]![0], "absent");
    assert.equal(states[0]![1], "elsewhere");
    assert.equal(states[1]![0], "elsewhere");
  });

  it("handles multi-word Expresso-style phrase", () => {
    const answer = ["TO", "YOU"];
    const guess = ["BY", "FAR"];
    const states = gradeGuess(answer, guess);
    assert.equal(states[0]![1], "elsewhere");
  });

  it("limits yellows when answer has one matching letter", () => {
    const states = gradeGuess(["AB"], ["AA"]);
    assert.equal(states[0]![0], "correct");
    assert.equal(states[0]![1], "absent");
  });

  it("does not mark elsewhere when letter is already matched in the other word", () => {
    const answer = ["LETHAL", "WEAPON"];
    const guess = ["LETHAL", "WETHEP"];
    const states = gradeGuess(answer, guess);
    assert.equal(states[0]![0], "correct");
    assert.equal(states[1]![2], "absent");
    assert.equal(states[1]![3], "absent");
    assert.equal(states[1]![4], "absent");
  });
});
