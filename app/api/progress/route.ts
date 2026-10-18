import { NextResponse } from "next/server";
import { z } from "zod";
import { withUser } from "@/lib/api/run-with-user";
import { requestUserId } from "@/lib/auth/user-context";
import {
  listProgressForUser,
  mergeLocalIntoServer,
  saveProgressForUser,
} from "@/lib/progress-sync";
import type { StoredProgress } from "@/lib/progress-local";

const progressEntrySchema = z.object({
  puzzleKey: z.string(),
  mode: z.enum(["daily", "unlimited"]),
  solved: z.boolean(),
  guessCount: z.number(),
  guesses: z.array(
    z.object({
      words: z.array(z.string()),
      states: z.array(z.array(z.string())),
    }),
  ),
  completedAt: z.string().nullable(),
  updatedAt: z.string(),
  revealTitle: z.string().optional(),
  revealYear: z.number().optional(),
});

export const GET = withUser(async () => {
  const userId = requestUserId();
  const progress = await listProgressForUser(userId);
  return NextResponse.json({ progress });
});

export const POST = withUser(async (request: Request) => {
  const json = await request.json();
  const parsed = z.object({ entries: z.array(progressEntrySchema) }).safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid progress payload" }, { status: 400 });
  }

  const userId = requestUserId();
  await mergeLocalIntoServer(userId, parsed.data.entries as StoredProgress[]);
  const progress = await listProgressForUser(userId);
  return NextResponse.json({ progress });
});

export const PUT = withUser(async (request: Request) => {
  const json = await request.json();
  const parsed = z.object({ entry: progressEntrySchema }).safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid entry" }, { status: 400 });
  }

  const userId = requestUserId();
  await saveProgressForUser(userId, parsed.data.entry as StoredProgress);
  return NextResponse.json({ ok: true });
});
