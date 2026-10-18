import { NextResponse } from "next/server";
import { publicDbErrorMessage } from "@/lib/db/public-db-error";
import { parseFiltersFromSearchParams } from "@/lib/puzzle-query";
import {
  publicPuzzleView,
  resolvePuzzle,
  utcDateString,
} from "@/lib/puzzle-store";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    let puzzleKey = url.searchParams.get("key")?.trim() ?? "";

    if (!puzzleKey && url.searchParams.get("today") === "1") {
      puzzleKey = `daily:${utcDateString()}`;
    }

    if (!puzzleKey) {
      return NextResponse.json({ error: "Missing puzzle key" }, { status: 400 });
    }

    const filters = parseFiltersFromSearchParams(url.searchParams);
    const puzzle = await resolvePuzzle(puzzleKey, filters);
    if (!puzzle) {
      return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });
    }

    return NextResponse.json(publicPuzzleView(puzzle));
  } catch (error) {
    return NextResponse.json(
      {
        error: publicDbErrorMessage(error, "Could not load puzzle"),
      },
      { status: 503 },
    );
  }
}
