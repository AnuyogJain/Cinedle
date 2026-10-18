import { NextResponse } from "next/server";
import { z } from "zod";
import { publicDbErrorMessage } from "@/lib/db/public-db-error";
import { gradeGuess } from "@/lib/grading";
import { parseFiltersFromSearchParams } from "@/lib/puzzle-query";
import {
  guessMatchesAnswer,
  parseGuessIntoWords,
} from "@/lib/title-normalize";
import { revealPuzzleAsync, resolvePuzzle } from "@/lib/puzzle-store";
import { getSessionUser } from "@/lib/auth/session";
import { saveProgressForUser } from "@/lib/progress-sync";

const bodySchema = z.object({
  puzzleKey: z.string().min(3),
  guess: z.string().min(1).max(200),
  genres: z.string().optional(),
  country: z.string().optional(),
  guessesJson: z.string().optional(),
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  try {
    const { puzzleKey, guess } = parsed.data;
    const params = new URLSearchParams();
    if (parsed.data.genres) params.set("genres", parsed.data.genres);
    if (parsed.data.country) params.set("country", parsed.data.country);
    const filters = parseFiltersFromSearchParams(params);

    const puzzle = await resolvePuzzle(puzzleKey, filters);
    if (!puzzle) {
      return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });
    }

    const guessWords = parseGuessIntoWords(guess, puzzle.wordLengths);
    if (!guessWords) {
      return NextResponse.json(
        { error: "Guess must match the word lengths" },
        { status: 400 },
      );
    }

    const states = gradeGuess(puzzle.answerWords, guessWords);
    const won = guessMatchesAnswer(guessWords, puzzle.answerWords);
    const reveal = won ? await revealPuzzleAsync(puzzle) : null;

    const user = await getSessionUser();
    if (user && parsed.data.guessesJson) {
      try {
        const guesses = JSON.parse(parsed.data.guessesJson) as unknown[];
        const entry = {
          puzzleKey,
          mode: puzzle.mode,
          solved: won,
          guessCount: Array.isArray(guesses) ? guesses.length : 0,
          guesses,
          completedAt: won ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString(),
          revealTitle: reveal?.displayTitle,
          revealYear: reveal?.year,
        };
        await saveProgressForUser(
          user.id,
          entry as Parameters<typeof saveProgressForUser>[1],
        );
      } catch {
        /* ignore malformed sync payload */
      }
    }

    return NextResponse.json({
      states,
      won,
      reveal,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: publicDbErrorMessage(error, "Could not grade guess"),
      },
      { status: 503 },
    );
  }
}
