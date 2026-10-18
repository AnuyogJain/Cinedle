import type { TileState } from "@/lib/grading";

export type GuessSubmission = {
  words: string[];
  states: TileState[][];
};

export function letterCountsInAnswer(
  answerWords: string[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const word of answerWords) {
    for (const ch of word) {
      counts[ch] = (counts[ch] ?? 0) + 1;
    }
  }
  return counts;
}

export function mergeKeyboardHints(
  letterCounts: Record<string, number>,
  submissions: GuessSubmission[],
): Map<string, TileState> {
  const map = new Map<string, TileState>();

  for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    const totalInAnswer = letterCounts[letter] ?? 0;

    let hasGuessed = false;
    let hasCorrect = false;
    let hasPresent = false;
    let hasElsewhere = false;

    for (const row of submissions) {
      row.words.forEach((word, wi) => {
        word.split("").forEach((ch, li) => {
          if (ch.toUpperCase() !== letter) return;
          const state = row.states[wi]?.[li];
          if (!state) return;
          hasGuessed = true;
          if (state === "correct") hasCorrect = true;
          if (state === "present") hasPresent = true;
          if (state === "elsewhere") hasElsewhere = true;
        });
      });
    }

    if (totalInAnswer === 0) {
      if (hasGuessed) map.set(letter, "absent");
      continue;
    }

    // Best hint wins (Wordle-style): green beats yellow/purple across all guesses.
    if (hasCorrect) {
      map.set(letter, "correct");
    } else if (hasPresent) {
      map.set(letter, "present");
    } else if (hasElsewhere) {
      map.set(letter, "elsewhere");
    }
  }

  return map;
}
