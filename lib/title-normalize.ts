export const MAX_WORDS = 8;
export const MAX_WORD_LENGTH = 10;
export const MAX_TOTAL_LETTERS = 40;

/** TMDB display title must match this (no &, :, digits, etc.). Play uses letters-only words. */
const ELIGIBLE_TITLE_PATTERN = /^[A-Za-z\s'-]+$/;

export interface PoolMovie {
  tmdbId: number;
  title: string;
  year: number;
  genreIds: number[];
  originCountry: string;
}

export function lettersOnlyUpper(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z]/g, "");
}

export function titleToPlayWords(displayTitle: string): string[] {
  return displayTitle
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => lettersOnlyUpper(word))
    .filter((word) => word.length > 0);
}

export function wordLengths(words: string[]): number[] {
  return words.map((w) => w.length);
}

export function isEligibleMovieTitle(title: string): boolean {
  const trimmed = title.trim();
  if (!trimmed || !ELIGIBLE_TITLE_PATTERN.test(trimmed)) return false;
  const words = titleToPlayWords(title);
  if (words.length > MAX_WORDS) return false;
  const total = words.reduce((sum, w) => sum + w.length, 0);
  if (total > MAX_TOTAL_LETTERS) return false;
  if (words.some((w) => w.length === 0)) return false;
  if (words.some((w) => w.length > MAX_WORD_LENGTH)) return false;
  return true;
}

export function parseGuessIntoWords(
  raw: string,
  expectedLengths: number[]
): string[] | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length !== expectedLengths.length) return null;

  const words: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    const letters = lettersOnlyUpper(parts[i]!);
    if (letters.length !== expectedLengths[i]) return null;
    words.push(letters);
  }
  return words;
}

export function guessMatchesAnswer(
  guessWords: string[],
  answerWords: string[]
): boolean {
  if (guessWords.length !== answerWords.length) return false;
  return guessWords.every((w, i) => w === answerWords[i]);
}
