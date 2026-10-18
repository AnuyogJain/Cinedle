export type TileState = "correct" | "present" | "elsewhere" | "absent";

function gradeWordRow(answerWord: string, guessWord: string): TileState[] {
  const row: TileState[] = new Array(guessWord.length).fill("absent");

  const remaining = new Map<string, number>();
  for (let i = 0; i < answerWord.length; i++) {
    if (guessWord[i] === answerWord[i]) {
      row[i] = "correct";
    } else {
      const ch = answerWord[i]!;
      remaining.set(ch, (remaining.get(ch) ?? 0) + 1);
    }
  }

  for (let i = 0; i < guessWord.length; i++) {
    if (row[i] === "correct") continue;
    const ch = guessWord[i]!;
    const count = remaining.get(ch) ?? 0;
    if (count > 0) {
      row[i] = "present";
      remaining.set(ch, count - 1);
    }
  }

  return row;
}

export function gradeGuess(
  answerWords: string[],
  guessWords: string[],
): TileState[][] {
  const result: TileState[][] = [];

  for (let w = 0; w < guessWords.length; w++) {
    const answerWord = answerWords[w] ?? "";
    const guessWord = guessWords[w] ?? "";
    result.push(gradeWordRow(answerWord, guessWord));
  }

  const globalRemaining = new Map<string, number>();
  for (const word of answerWords) {
    for (const ch of word) {
      globalRemaining.set(ch, (globalRemaining.get(ch) ?? 0) + 1);
    }
  }

  for (let w = 0; w < result.length; w++) {
    const guessWord = guessWords[w] ?? "";
    for (let i = 0; i < guessWord.length; i++) {
      const state = result[w]![i];
      if (state !== "correct" && state !== "present") continue;
      const ch = guessWord[i]!;
      const left = globalRemaining.get(ch) ?? 0;
      if (left > 0) globalRemaining.set(ch, left - 1);
    }
  }

  const fullAnswer = answerWords.join("");
  for (let w = 0; w < result.length; w++) {
    const guessWord = guessWords[w] ?? "";
    for (let i = 0; i < guessWord.length; i++) {
      if (result[w]![i] !== "absent") continue;
      const ch = guessWord[i]!;
      if (!fullAnswer.includes(ch)) continue;

      let inOtherWord = false;
      for (let j = 0; j < answerWords.length; j++) {
        if (j === w) continue;
        if (answerWords[j]!.includes(ch)) {
          inOtherWord = true;
          break;
        }
      }
      if (!inOtherWord) continue;

      const budget = globalRemaining.get(ch) ?? 0;
      if (budget > 0) {
        result[w]![i] = "elsewhere";
        globalRemaining.set(ch, budget - 1);
      }
    }
  }

  return result;
}

export function flattenStates(states: TileState[][]): TileState[] {
  return states.flat();
}
