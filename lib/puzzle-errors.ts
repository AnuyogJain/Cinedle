export type PuzzleErrorCode =
  | "no_eligible_movie"
  | "tmdb_not_configured"
  | "database_unavailable"
  | "not_found";

export class PuzzleServiceError extends Error {
  readonly code: PuzzleErrorCode;

  constructor(code: PuzzleErrorCode, message: string) {
    super(message);
    this.name = "PuzzleServiceError";
    this.code = code;
  }
}
