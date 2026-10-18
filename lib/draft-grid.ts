export type DraftGrid = string[][];

export function emptyDraftGrid(wordLengths: number[]): DraftGrid {
  return wordLengths.map((len) => Array.from({ length: len }, () => ""));
}

export function draftGridToWords(grid: DraftGrid): string[] {
  return grid.map((word) => word.join(""));
}

export function draftGridToGuessText(grid: DraftGrid): string {
  return draftGridToWords(grid).join(" ");
}

export function isDraftComplete(
  grid: DraftGrid,
  wordLengths: number[]
): boolean {
  return wordLengths.every((len, wi) => {
    const word = grid[wi] ?? [];
    if (word.length !== len) return false;
    return word.every((ch) => /^[A-Z]$/.test(ch));
  });
}

export function setDraftCell(
  grid: DraftGrid,
  wordIndex: number,
  letterIndex: number,
  letter: string
): DraftGrid {
  const ch = letter
    .replace(/[^a-zA-Z]/g, "")
    .slice(-1)
    .toUpperCase();
  const next = grid.map((word) => [...word]);
  if (!next[wordIndex]) return next;
  next[wordIndex][letterIndex] = ch;
  return next;
}

export function clearDraftCell(
  grid: DraftGrid,
  wordIndex: number,
  letterIndex: number
): DraftGrid {
  const next = grid.map((word) => [...word]);
  if (!next[wordIndex]) return next;
  next[wordIndex][letterIndex] = "";
  return next;
}

export function nextCell(
  wordIndex: number,
  letterIndex: number,
  wordLengths: number[]
): { wordIndex: number; letterIndex: number } | null {
  const len = wordLengths[wordIndex] ?? 0;
  if (letterIndex < len - 1) {
    return { wordIndex, letterIndex: letterIndex + 1 };
  }
  if (wordIndex < wordLengths.length - 1) {
    return { wordIndex: wordIndex + 1, letterIndex: 0 };
  }
  return null;
}

export function prevCell(
  wordIndex: number,
  letterIndex: number,
  wordLengths: number[]
): { wordIndex: number; letterIndex: number } | null {
  if (letterIndex > 0) {
    return { wordIndex, letterIndex: letterIndex - 1 };
  }
  if (wordIndex > 0) {
    const prevLen = wordLengths[wordIndex - 1] ?? 0;
    return { wordIndex: wordIndex - 1, letterIndex: prevLen - 1 };
  }
  return null;
}

export function flatCellIndex(
  wordIndex: number,
  letterIndex: number,
  wordLengths: number[]
): number {
  let index = 0;
  for (let wi = 0; wi < wordIndex; wi++) {
    index += wordLengths[wi] ?? 0;
  }
  return index + letterIndex;
}

export function cellFromFlatIndex(
  flatIndex: number,
  wordLengths: number[]
): { wordIndex: number; letterIndex: number } {
  let remaining = flatIndex;
  for (let wi = 0; wi < wordLengths.length; wi++) {
    const len = wordLengths[wi] ?? 0;
    if (remaining < len) {
      return { wordIndex: wi, letterIndex: remaining };
    }
    remaining -= len;
  }
  const last = wordLengths.length - 1;
  return {
    wordIndex: Math.max(0, last),
    letterIndex: Math.max(0, (wordLengths[last] ?? 1) - 1),
  };
}
