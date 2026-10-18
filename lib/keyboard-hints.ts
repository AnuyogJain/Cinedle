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

function cellKey(wordIndex: number, letterIndex: number): string {
  return `${wordIndex}-${letterIndex}`;
}

export function mergeKeyboardHints(
  letterCounts: Record<string, number>,
  submissions: GuessSubmission[],
): Map<string, TileState> {
  const map = new Map<string, TileState>();

  for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    const totalInAnswer = letterCounts[letter] ?? 0;

    let hasPresent = false;
    let hasElsewhere = false;
    let hasAnyHint = false;
    const solvedPositions = new Set<string>();

    for (const row of submissions) {
      row.words.forEach((word, wi) => {
        word.split("").forEach((ch, li) => {
          if (ch.toUpperCase() !== letter) return;
          const state = row.states[wi]?.[li];
          if (!state) return;
          if (state !== "absent") hasAnyHint = true;
          if (state === "present") hasPresent = true;
          if (state === "elsewhere") hasElsewhere = true;
          if (state === "correct") {
            solvedPositions.add(cellKey(wi, li));
          }
        });
      });
    }

    if (totalInAnswer === 0) {
      if (hasAnyHint) map.set(letter, "absent");
      continue;
    }

    const allFound = solvedPositions.size >= totalInAnswer;
    if (allFound) {
      map.set(letter, "correct");
    } else if (hasPresent) {
      map.set(letter, "present");
    } else if (hasElsewhere) {
      map.set(letter, "elsewhere");
    }
  }

  return map;
}
